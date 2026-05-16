import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'

export const usePengumumanStore = defineStore('pengumuman', () => {
  // Pastikan path berjumlah 5 bagian (ganjil) agar valid di Firestore
  const pengumumanPath = ['artifacts', 'SatriaApp', 'public', 'data', 'pengumuman']

  const pengumumanList = ref([])
  const loading = ref(false)

  // 1. Load Data
  async function loadPengumuman() {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, ...pengumumanPath))
      const rawData = snapshot.docs.map(docu => ({
        id: docu.id,
        ...docu.data()
      }))

      // Urutkan dari yang terbaru (Descending)
      rawData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

      pengumumanList.value = rawData
    } catch (error) {
      console.error('LOAD PENGUMUMAN ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  // 2. Simpan Data (Tambah & Edit)
  async function savePengumuman(data) {
    loading.value = true
    try {
      const payload = {
        judul: data.judul,
        isi: data.isi,
        penting: data.penting || false,
        pembuat: data.pembuat || localStorage.getItem('nama'),
        tanggal: data.tanggal || new Date().toISOString()
      }

      const docId = data.id || `PENGUMUMAN-${Date.now()}`

      await setDoc(doc(db, ...pengumumanPath, docId), payload, { merge: true })
      await loadPengumuman()
    } catch (error) {
      console.error('SAVE PENGUMUMAN ERROR:', error)
      alert("Gagal menyimpan pengumuman!")
    } finally {
      loading.value = false
    }
  }

  // 3. Hapus Data
  async function deletePengumuman(id) {
    loading.value = true
    try {
      await deleteDoc(doc(db, ...pengumumanPath, id))
      await loadPengumuman()
    } catch (error) {
      console.error('DELETE PENGUMUMAN ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    pengumumanList,
    loading,
    loadPengumuman,
    savePengumuman,
    deletePengumuman
  }
})
