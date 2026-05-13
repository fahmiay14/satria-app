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
      const rawData = snapshot.docs.map(docu => ({
        id: docu.id,
        ...docu.data()
      }))

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
      const payload = {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        type: data.type // 'lapangan' atau 'rapat'
      }
      const docId = data.id ? data.id.toString() : Date.now().toString()
      await setDoc(doc(db, ...jadwalPath, docId), payload)
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
