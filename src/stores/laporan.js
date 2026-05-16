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
    const q = query(collection(db, ...laporanPath), orderBy('timestamp', 'desc'))

    unsubscribe = onSnapshot(q, (snapshot) => {
      laporanList.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
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
      await setDoc(doc(db, ...laporanPath, docId), {
        ...data,
        timestamp: new Date().toISOString()
      })
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
