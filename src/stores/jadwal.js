import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { useArsipStore } from './arsip' // Kita pinjam fungsi sync dari arsip

export const useJadwalStore = defineStore('jadwal', () => {
  const jadwalPath = ['artifacts', 'SatriaApp', 'public', 'data', 'jadwal']
  const jadwalList = ref([])
  const loading = ref(false)
  const arsipStore = useArsipStore()

  // Load Data Jadwal
  async function loadJadwal() {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, ...jadwalPath))
      const rawData = snapshot.docs.map(docu => {
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
      })

      jadwalList.value = rawData
      arsipStore.triggerSync() // Panggil efek loading bar di bawah
    } catch (error) {
      console.error('LOAD JADWAL ERROR:', error)
    } finally {
      loading.value = false
    }
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
      await loadJadwal()
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
      await loadJadwal()
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
    deleteJadwal
  }
})
