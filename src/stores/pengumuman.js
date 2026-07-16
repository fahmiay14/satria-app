import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore'

export const usePengumumanStore = defineStore('pengumuman', () => {
  // Pastikan path berjumlah 5 bagian (ganjil) agar valid di Firestore
  const pengumumanPath = ['artifacts', 'SatriaApp', 'public', 'data', 'pengumuman']

  const pengumumanList = ref([])
  const loading = ref(false)

  // Guard anti-listener-duplikat, sama seperti di arsip.js
  let unsubPengumuman = null

  function mapPengumumanDoc(docu) {
    const data = docu.data()
    return {
      id: docu.id,
      judul: data.judul || '',
      isi: data.isi || '',
      penting: data.status === 'Penting' || data.penting === true,
      pembuat: data.nama_admin || data.pembuat || '',
      tanggal: data.tanggal || ''
    }
  }

  // 1. Load Data (real-time via onSnapshot)
  function loadPengumuman() {
    if (unsubPengumuman) {
      return Promise.resolve()
    }

    loading.value = true
    return new Promise((resolve) => {
      let firstSnapshot = true

      unsubPengumuman = onSnapshot(
        collection(db, ...pengumumanPath),
        (snapshot) => {
          const rawData = snapshot.docs.map(mapPengumumanDoc)

          // Urutkan dari yang terbaru (Descending)
          rawData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

          pengumumanList.value = rawData
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        },
        (error) => {
          console.error('LOAD PENGUMUMAN ERROR:', error)
          loading.value = false
          if (firstSnapshot) { firstSnapshot = false; resolve() }
        }
      )
    })
  }

  // Opsional: hentikan listener pengumuman (mis. dipanggil saat logout)
  function unsubscribePengumuman() {
    if (unsubPengumuman) { unsubPengumuman(); unsubPengumuman = null }
  }

  // 2. Simpan Data (Tambah & Edit)
  async function savePengumuman(data) {
    loading.value = true
    try {
      // === PAYLOAD SESUAI STRUKTUR ERD ===
      const payload = {
        judul: data.judul,
        isi: data.isi,
        status: data.penting ? 'Penting' : 'Biasa',
        id_admin: localStorage.getItem('userId') || '',
        nama_admin: localStorage.getItem('nama') || 'Admin',
        tanggal: data.tanggal || new Date().toISOString()
      }

      const docId = data.id || `PENGUMUMAN-${Date.now()}`

      await setDoc(doc(db, ...pengumumanPath, docId), payload, { merge: true })
      // Tidak perlu await loadPengumuman() lagi -- listener onSnapshot otomatis update
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
    deletePengumuman,
    unsubscribePengumuman
  }
})
