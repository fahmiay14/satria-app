import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'

export const useRuteStore = defineStore('rute', () => {
  // Path Koleksi Firebase
  const lokasiPath = ['artifacts', 'SatriaApp', 'public', 'data', 'rute_lokasi']
  const petugasPath = ['artifacts', 'SatriaApp', 'public', 'data', 'rute_petugas']
  // Kita gabungkan saja penyimpanan tandai ke lokasiPath agar bisa muncul di Data Rute!
  // const tandaiPath = ['artifacts', 'SatriaApp', 'public', 'data', 'rute_tandai']

  // State
  const lokasiList = ref([]) // Data Perusahaan / Rute / Pribadi
  const petugasList = ref([]) // Data Petugas
  const loading = ref(false)

  // =========================
  // CRUD LOKASI (PERUSAHAAN / PRIBADI)
  // =========================
  async function loadLokasi() {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, ...lokasiPath))
      // Pastikan kategori di-load, jika tidak ada default ke Perusahaan
      lokasiList.value = snapshot.docs.map(docu => ({
        id: docu.id,
        nama: docu.data().nama,
        lat: docu.data().lat,
        lng: docu.data().lng,
        petugas: docu.data().petugas,
        kategori: docu.data().kategori || 'Perusahaan'
      }))
    } catch (error) {
      console.error('LOAD LOKASI ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  async function saveLokasi(data) {
    loading.value = true
    try {
      const payload = {
        nama: data.nama,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        petugas: data.petugas || '',
        kategori: data.kategori || 'Perusahaan' // Simpan kategori dari parameter data
      }
      const docId = data.id ? data.id.toString() : `LOC-${Date.now()}`
      await setDoc(doc(db, ...lokasiPath, docId), payload)
      await loadLokasi()
    } catch (error) {
      console.error('SAVE LOKASI ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  async function deleteLokasi(id) {
    loading.value = true
    try {
      await deleteDoc(doc(db, ...lokasiPath, id))
      await loadLokasi()
    } catch (error) {
      console.error('DELETE LOKASI ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  // =========================
  // CRUD PETUGAS
  // =========================
  async function loadPetugas() {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, ...petugasPath))
      petugasList.value = snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() }))
    } catch (error) {
      console.error('LOAD PETUGAS ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  async function savePetugas(data) {
    loading.value = true
    try {
      const payload = { nama: data.nama, warna: data.warna || '#0066cc' }
      const docId = data.id ? data.id.toString() : `PTG-${Date.now()}`
      await setDoc(doc(db, ...petugasPath, docId), payload)
      await loadPetugas()
    } catch (error) {
      console.error('SAVE PETUGAS ERROR:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    lokasiList, petugasList, loading,
    loadLokasi, saveLokasi, deleteLokasi,
    loadPetugas, savePetugas
  }
})
