import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore'

export const useRuteStore = defineStore('rute', () => {
  // PATH FIREBASE SESUAI ERD
  const rutePath = ['artifacts', 'SatriaApp', 'public', 'data', 'rute']
  const usersPath = ['artifacts', 'SatriaApp', 'public', 'data', 'users_account']

  // STATE
  const lokasiList = ref([])
  const petugasList = ref([])
  const loading = ref(false)

  // Guard anti-listener-duplikat, sama seperti di arsip.js
  let unsubPetugas = null
  let unsubLokasi = null

  // HELPER: Generate ID
  function generateId(prefix) {
    return `${prefix}-${Date.now()}`
  }

  /* =========================
     1. LOAD PETUGAS (REAL-TIME, khusus role 'petugas')
  ========================= */
  function loadPetugas() {
    if (unsubPetugas) {
      return Promise.resolve()
    }

    loading.value = true
    return new Promise((resolve) => {
      let firstSnapshot = true
      const q = query(
        collection(db, ...usersPath),
        where('role', '==', 'petugas')
      )

      unsubPetugas = onSnapshot(
        q,
        (snapshot) => {
          petugasList.value = snapshot.docs.map(docu => {
            const data = docu.data()
            return {
              id: docu.id,
              nama: data.nama_lengkap || data.nama || 'Tanpa Nama',
              username: data.nik || data.username || '',
              warna: data.warna_user || data.warna || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
            }
          })
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        },
        (error) => {
          console.error("Error load petugas:", error)
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        }
      )
    })
  }

  // Opsional: hentikan listener petugas (mis. dipanggil saat logout)
  function unsubscribePetugas() {
    if (unsubPetugas) { unsubPetugas(); unsubPetugas = null }
  }

  /* =========================
     2. LOAD LOKASI RUTE (REAL-TIME, DENGAN NORMALISASI KATEGORI & FILTER HAK AKSES)
  ========================= */
  function loadLokasi() {
    if (unsubLokasi) {
      return Promise.resolve()
    }

    loading.value = true
    return new Promise((resolve) => {
      let firstSnapshot = true

      unsubLokasi = onSnapshot(
        collection(db, ...rutePath),
        (snapshot) => {
          // PENTING: identitas user dibaca ULANG di sini, di dalam callback,
          // setiap kali ada snapshot baru -- bukan sekali saja saat pertama
          // subscribe. Ini menjaga filter hak akses (Pribadi vs Perusahaan)
          // tetap benar walau user logout/login ganti akun di tab yang sama
          // tanpa reload halaman penuh.
          const currentUserId = localStorage.getItem('userId') || 'UNKNOWN_USER'
          const userRole = localStorage.getItem('role') || 'petugas'

          const allDocs = []

          snapshot.docs.forEach(docu => {
            const d = docu.data()

            // === NORMALISASI KATEGORI ===
            // Jika kosong/tidak ada, otomatis dianggap sebagai 'Perusahaan'
            let kat = d.kategori ? d.kategori.toString().trim() : 'Perusahaan'

            // Perbaiki penulisan (case-insensitive) agar seragam
            if (kat.toLowerCase() === 'perusahaan') {
              kat = 'Perusahaan'
            } else if (kat.toLowerCase() === 'pribadi') {
              kat = 'Pribadi'
            } else {
              // Fallback aman
              kat = 'Perusahaan'
            }

            const idPetugas = d.id_petugas || d.id_user_petugas || ''

            // Map ERD ke struktur UI
            const mappedDoc = {
              id: docu.id,
              id_rute: docu.id,
              nama: d.nama_lokasi || d.nama || '',
              lat: parseFloat(d.latitude || d.lat || 0),
              lng: parseFloat(d.longitude || d.lng || 0),
              kategori: kat,
              petugas: d.nama_petugas || d.petugas || '',
              id_petugas: idPetugas
            }

            // === FILTER VISIBILITAS (HAK AKSES) ===
            if (kat === 'Perusahaan') {
              // Rute Perusahaan: Bisa dilihat semua role (Admin & Petugas)
              allDocs.push(mappedDoc)
            } else if (kat === 'Pribadi') {
              // Rute Pribadi: Hanya admin ATAU petugas pembuatnya yang bisa melihat
              if (userRole === 'admin' || idPetugas === currentUserId) {
                allDocs.push(mappedDoc)
              }
            }
          })

          lokasiList.value = allDocs
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        },
        (error) => {
          console.error("Error load lokasi:", error)
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        }
      )
    })
  }

  // Opsional: hentikan listener lokasi (mis. dipanggil saat logout)
  function unsubscribeLokasi() {
    if (unsubLokasi) { unsubLokasi(); unsubLokasi = null }
  }

  /* =========================
     3. SIMPAN LOKASI (CREATE & UPDATE)
  ========================= */
  async function saveLokasi(lokasiData) {
    loading.value = true
    const currentUserId = localStorage.getItem('userId') || 'UNKNOWN_USER'
    const currentUserName = localStorage.getItem('nama') || 'UNKNOWN_NAME'

    try {
      const isNew = !(lokasiData.id || lokasiData.id_rute)
      const docId = isNew ? generateId('RUTE') : (lokasiData.id_rute || lokasiData.id)

      // Payload Sesuai ERD Baru
      let payload = {
        nama_lokasi: lokasiData.nama,
        latitude: String(lokasiData.lat), // Disimpan sbg Varchar
        longitude: String(lokasiData.lng), // Disimpan sbg Varchar
        kategori: lokasiData.kategori || 'Perusahaan',
        updated_at: new Date().toISOString()
      }

      if (isNew) {
        payload.created_at = new Date().toISOString()

        if (payload.kategori === 'Pribadi') {
          payload.id_admin = ""
          payload.nama_admin = ""
          payload.id_petugas = currentUserId
          payload.nama_petugas = currentUserName
        } else {
          payload.id_admin = currentUserId
          payload.nama_admin = currentUserName
          payload.id_petugas = lokasiData.id_petugas || ""
          payload.nama_petugas = lokasiData.petugas || ""
        }
      } else {
        // Logika Update Assign Petugas
        if (lokasiData.petugas) {
          payload.nama_petugas = lokasiData.petugas
          const p = petugasList.value.find(x => x.nama === lokasiData.petugas)
          payload.id_petugas = p ? p.id : ""
        } else {
          payload.nama_petugas = ""
          payload.id_petugas = ""
        }
      }

      // Merge: true agar atribut lama di database tidak terhapus jika di-update
      await setDoc(doc(db, ...rutePath, docId), payload, { merge: true })
      // Tidak perlu await loadLokasi() lagi -- listener onSnapshot otomatis update
    } catch (error) {
      console.error("Error save lokasi:", error)
    } finally {
      loading.value = false
    }
  }

  /* =========================
     4. HAPUS LOKASI
  ========================= */
  async function deleteLokasi(id) {
    loading.value = true
    try {
      await deleteDoc(doc(db, ...rutePath, id))
    } catch (error) {
      console.error("Error delete lokasi:", error)
    } finally {
      loading.value = false
    }
  }

  return {
    lokasiList,
    petugasList,
    loading,
    loadPetugas,
    loadLokasi,
    saveLokasi,
    deleteLokasi,
    unsubscribePetugas,
    unsubscribeLokasi
  }
})
