import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

export const useLaporanStore = defineStore('laporan', () => {
  const laporanPath = ['artifacts', 'SatriaApp', 'public', 'data', 'laporan']
  const laporanList = ref([])
  const loading = ref(false)
  let unsubscribe = null

  // 1. Berlangganan Data Secara Real-time (Untuk Peta Admin & List Petugas)
  function subscribeLaporan() {
    loading.value = true
    // Order By berdasarkan ERD (created_at)
    const q = query(collection(db, ...laporanPath), orderBy('created_at', 'desc'))

    unsubscribe = onSnapshot(q, (snapshot) => {
      laporanList.value = snapshot.docs.map(docu => {
        const data = docu.data()
        return {
          id: docu.id,
          // Menerjemahkan dari ERD ke UI
          perusahaan: data.nama_perusahaan || data.perusahaan || '',
          status: data.status || '',
          petugas: data.nama_petugas || data.petugas || '',
          date: data.tanggal || data.date || '',
          lat: parseFloat(data.latitude || data.lat || 0),
          lng: parseFloat(data.longitude || data.lng || 0),
          catatan: data.catatan || '',
          timestamp: data.created_at || data.timestamp || ''
        }
      })
      loading.value = false
    }, (error) => {
      console.error("Gagal subscribe laporan:", error)
      loading.value = false
    })
  }

  // Berhenti berlangganan saat pindah halaman (opsional)
  function unsubscribeLaporan() {
    if (unsubscribe) unsubscribe()
  }

  // 2. Simpan Laporan Baru (Otomatis sisipkan Timestamp)
  async function saveLaporan(data) {
    loading.value = true
    try {
      const docId = `LAP-${Date.now()}`

      // === PAYLOAD SESUAI STRUKTUR ERD ===
      const payload = {
        id_perusahaan: data.id_perusahaan || '',
        nama_perusahaan: data.perusahaan,
        status: data.status,
        id_petugas: localStorage.getItem('userId') || '',
        nama_petugas: data.petugas,
        tanggal: data.date,
        catatan: data.catatan || '',
        latitude: String(data.lat), // Format varchar/String
        longitude: String(data.lng),
        created_at: new Date().toISOString()
      }

      await setDoc(doc(db, ...laporanPath, docId), payload)
      return true
    } catch (error) {
      console.error("Gagal menyimpan laporan:", error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    laporanList,
    loading,
    subscribeLaporan,
    unsubscribeLaporan,
    saveLaporan
  }
})
