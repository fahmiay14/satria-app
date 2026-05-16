import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore'

export const useRuteStore = defineStore('rute', () => {
  // PATH FIREBASE
  const rutePath = ['artifacts', 'SatriaApp', 'public', 'data', 'data_rute']
  const usersPath = ['artifacts', 'SatriaApp', 'public', 'data', 'users_account']

  const lokasiList = ref([])
  const petugasList = ref([])
  const loading = ref(false)

  // Helper: Buat ID String Acak (Contoh: RUTE-xY9zQ1wE4rTy)
  function generateId(prefix) {
    const randomStr = Math.random().toString(36).substring(2, 14).toUpperCase()
    return `${prefix}-${randomStr}`
  }

  // 1. Load Data Petugas
  async function loadPetugas() {
    loading.value = true
    try {
      const q = query(
        collection(db, ...usersPath),
        where('role', '==', 'petugas')
      )
      const snapshot = await getDocs(q)

      petugasList.value = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          nama: data.nama || data.nama_lengkap || 'Tanpa Nama',
          username: data.username || data.nik || '',
          warna: data.warna || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
        }
      })
    } catch (error) {
      console.error("Gagal memuat daftar petugas:", error)
    } finally {
      loading.value = false
    }
  }

  // 2. Load Lokasi Rute berdasarkan Aturan Hak Akses (Privasi)
  async function loadLokasi() {
    loading.value = true
    lokasiList.value = []

    const currentUserId = localStorage.getItem('userId') || 'UNKNOWN_USER'

    try {
      // QUERY 1: Ambil data Perusahaan (Semua role melihat ini)
      const perusahaanQuery = query(
        collection(db, ...rutePath),
        where('kategori', '==', 'Perusahaan')
      )

      // QUERY 2: Ambil data Pribadi (Hanya milik user yang sedang login)
      const pribadiQuery = query(
        collection(db, ...rutePath),
        where('kategori', '==', 'Pribadi'),
        where('id_user_petugas', '==', currentUserId)
      )

      // Eksekusi kedua Query secara paralel agar lebih cepat
      const [perusahaanSnap, pribadiSnap] = await Promise.all([
        getDocs(perusahaanQuery),
        getDocs(pribadiQuery)
      ])

      // Gabungkan hasilnya (Tambahkan id agar kompatibel dengan view)
      const allDocs = []
      perusahaanSnap.forEach(docu => allDocs.push({ id: docu.id, id_rute: docu.id, ...docu.data() }))
      pribadiSnap.forEach(docu => allDocs.push({ id: docu.id, id_rute: docu.id, ...docu.data() }))

      lokasiList.value = allDocs

    } catch (error) {
      console.error("Gagal memuat lokasi:", error)
    } finally {
      loading.value = false
    }
  }

  // 3. Simpan Lokasi (Create & Update)
  async function saveLokasi(lokasiData) {
    loading.value = true
    const currentUserId = localStorage.getItem('userId') || 'UNKNOWN_USER'
    const currentUserName = localStorage.getItem('nama') || 'UNKNOWN_NAME'

    try {
      // Cek apakah ini data baru atau update (dukungan untuk id dan id_rute)
      const isNew = !(lokasiData.id || lokasiData.id_rute)
      const docId = isNew ? generateId('RUTE') : (lokasiData.id_rute || lokasiData.id)

      let payload = {
        nama: lokasiData.nama,
        lat: parseFloat(lokasiData.lat),
        lng: parseFloat(lokasiData.lng),
        kategori: lokasiData.kategori || 'Perusahaan',
        updated_at: new Date().toISOString()
      }

      if (isNew) {
        payload.created_at = new Date().toISOString()

        if (payload.kategori === 'Pribadi') {
          // RUTE PRIBADI: Admin dikosongkan, Petugas diisi dengan pembuat
          payload.id_user_admin = ""
          payload.nama_admin = ""
          payload.id_user_petugas = currentUserId
          payload.nama_petugas = currentUserName
          payload.petugas = currentUserName // Menjaga kompatibilitas UI
        } else {
          // RUTE PERUSAHAAN
          payload.id_user_admin = currentUserId
          payload.nama_admin = currentUserName
          payload.id_user_petugas = lokasiData.id_user_petugas || ""
          payload.nama_petugas = lokasiData.nama_petugas || ""
          payload.petugas = lokasiData.petugas || ""
        }
      } else {
        // UPDATE RUTE (Pemetaan ulang nama_petugas & id_user_petugas jika petugas diganti)
        if (lokasiData.petugas) {
          payload.petugas = lokasiData.petugas
          const p = petugasList.value.find(x => x.nama === lokasiData.petugas)
          if (p) {
            payload.id_user_petugas = p.id
            payload.nama_petugas = p.nama
          } else {
            payload.id_user_petugas = ""
            payload.nama_petugas = ""
          }
        } else {
          payload.petugas = ""
          payload.id_user_petugas = ""
          payload.nama_petugas = ""
        }
      }

      // Simpan ke Firestore (Gunakan merge: true agar data lain yang tidak diedit tidak hilang)
      await setDoc(doc(db, ...rutePath, docId), payload, { merge: true })

      // Refresh data di memori
      await loadLokasi()

    } catch (error) {
      console.error("Gagal menyimpan lokasi:", error)
    } finally {
      loading.value = false
    }
  }

  // 4. Hapus Lokasi
  async function deleteLokasi(id_rute) {
    loading.value = true
    try {
      await deleteDoc(doc(db, ...rutePath, id_rute))
      await loadLokasi()
    } catch (error) {
      console.error("Gagal menghapus lokasi:", error)
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
    deleteLokasi
  }
})
