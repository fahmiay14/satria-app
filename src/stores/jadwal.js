import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { useArsipStore } from './arsip' // Kita pinjam fungsi sync dari arsip

export const useJadwalStore = defineStore('jadwal', () => {
  const jadwalPath = ['artifacts', 'SatriaApp', 'public', 'data', 'jadwal']
  const jadwalList = ref([])
  const loading = ref(false)
  const arsipStore = useArsipStore()

  // Guard anti-listener-duplikat, sama seperti di arsip.js
  let unsubJadwal = null

  function mapJadwalDoc(docu) {
    const data = docu.data()
    return {
      id: docu.id,
      // Menerjemahkan dari ERD ke format UI
      title: data.judul_kegiatan || data.title || '',
      date: data.tanggal || data.date || '',
      time: data.waktu || data.time || '',
      location: data.lokasi || data.location || '',
      type: data.kategori_jadwal || data.type || 'lapangan'
    }
  }

  // Load Data Jadwal (real-time via onSnapshot)
  // Promise resolve setelah data pertama diterima, listener tetap aktif
  // di belakang layar untuk sinkronisasi otomatis setelahnya.
  function loadJadwal() {
    if (unsubJadwal) {
      return Promise.resolve()
    }

    loading.value = true
    return new Promise((resolve) => {
      let firstSnapshot = true

      unsubJadwal = onSnapshot(
        collection(db, ...jadwalPath),
        (snapshot) => {
          jadwalList.value = snapshot.docs.map(mapJadwalDoc)
          arsipStore.triggerSync() // Panggil efek loading bar di bawah
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        },
        (error) => {
          console.error('LOAD JADWAL ERROR:', error)
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        }
      )
    })
  }

  // Opsional: hentikan listener jadwal (mis. dipanggil saat logout)
  function unsubscribeJadwal() {
    if (unsubJadwal) { unsubJadwal(); unsubJadwal = null }
  }

  // Simpan / Edit Data Jadwal
  async function saveJadwal(data) {
    loading.value = true
    try {
      // === PAYLOAD SESUAI STRUKTUR ERD ===
      const payload = {
        judul_kegiatan: data.title,
        tanggal: data.date,
        waktu: data.time,
        lokasi: data.location,
        kategori_jadwal: data.type, // 'lapangan' atau 'rapat'
        id_user: localStorage.getItem('userId') || '',
        created_at: new Date().toISOString()
      }
      const docId = data.id ? data.id.toString() : `JADWAL-${Date.now()}`
      await setDoc(doc(db, ...jadwalPath, docId), payload, { merge: true })
      // Tidak perlu await loadJadwal() lagi -- listener onSnapshot otomatis update
    } catch (error) {
      console.error('SAVE JADWAL ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  // Hapus Data Jadwal
  async function deleteJadwal(id) {
    loading.value = true
    try {
      await deleteDoc(doc(db, ...jadwalPath, id))
    } catch (error) {
      console.error('DELETE JADWAL ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    jadwalList,
    loading,
    loadJadwal,
    saveJadwal,
    deleteJadwal,
    unsubscribeJadwal
  }
})
