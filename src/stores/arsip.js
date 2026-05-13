import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../services/firebase'

import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

export const useArsipStore = defineStore(
  'arsip',
  () => {
    /* =========================
       PATH FIREBASE
    ========================= */
    const arsipPath = ['artifacts', 'SatriaApp', 'public', 'data', 'arsip']
    const boxPath = ['artifacts', 'SatriaApp', 'public', 'data', 'box']

    /* =========================
       STATE
    ========================= */
    const arsipList = ref([])
    const boxList = ref([])
    const loading = ref(false)

    /* =========================
       STATE & FUNGSI SYNC FOOTER
    ========================= */
    const sync = ref({
      visible: false,
      progress: 0,
      text: 'Menyinkronkan data...',
      icon: 'sync',
      color: 'blue'
    })
    
    let syncTimeout = null

    function triggerSync() {
      clearTimeout(syncTimeout)
      sync.value = { visible: true, progress: 40, text: 'Menyinkronkan pembaruan...', icon: 'sync', color: 'blue' }
      setTimeout(() => {
        sync.value.progress = 100
        sync.value.text = 'Sinkronisasi Selesai'
        sync.value.icon = 'cloud_done'
        sync.value.color = 'green'
        syncTimeout = setTimeout(() => {
          sync.value.visible = false
          setTimeout(() => { sync.value.progress = 0 }, 500)
        }, 2500)
      }, 600)
    }

    /* =========================
       GETTERS
    ========================= */
    const totalArsip = computed(() => arsipList.value.length)
    const totalBox = computed(() => boxList.value.length)
    const arsipTersedia = computed(() => arsipList.value.filter(item => item.status.toLowerCase() === 'tersedia').length)
    const arsipDipinjam = computed(() => arsipList.value.filter(item => item.status.toLowerCase() === 'dipinjam').length)

    /* =========================
       LOAD DATA ARSIP
    ========================= */
    async function loadArsip() {
      loading.value = true
      try {
        const snapshot = await getDocs(collection(db, ...arsipPath))
        
        const rawData = snapshot.docs.map(docu => {
          const d = docu.data()
          return {
            id: docu.id,
            // Membaca format camelCase (baru) ATAU format Title Case (lama dari CSV)
            noSurat: d.noSurat || d['Nomor Surat'] || '0',
            nopol: d.nopol || d['Nopol'] || '',
            // Merapikan status agar selalu kapital di awal (Tersedia / Dipinjam)
            status: d.status ? (d.status.charAt(0).toUpperCase() + d.status.slice(1).toLowerCase()) 
                             : (d['Status'] ? (d['Status'].charAt(0).toUpperCase() + d['Status'].slice(1).toLowerCase()) : 'Tersedia')
          }
        })

        // SORTING FINAL: Mengurutkan murni berdasarkan Nomor Surat (tertinggi di atas)
        rawData.sort((a, b) => Number(b.noSurat) - Number(a.noSurat))
        
        arsipList.value = rawData
        triggerSync()
      } catch (error) {
        console.error('LOAD ARSIP ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       SAVE DATA ARSIP
    ========================= */
    async function saveArsip(data) {
      loading.value = true
      try {
        // Payload baku untuk ke depannya
        const payload = {
          noSurat: data.noSurat,
          nopol: data.nopol,
          status: data.status
        }
        const docId = data.id ? data.id.toString() : Date.now().toString()
        await setDoc(doc(db, ...arsipPath, docId), payload)
        
        await loadArsip() // Refresh data
      } catch (error) {
        console.error('SAVE ARSIP ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       DELETE ARSIP
    ========================= */
    async function deleteArsip(id) {
      loading.value = true
      try {
        await deleteDoc(doc(db, ...arsipPath, id))
        await loadArsip() // Refresh data
      } catch (error) {
        console.error('DELETE ARSIP ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       LOAD BOX
    ========================= */
    async function loadBox() {
      loading.value = true
      try {
        const snapshot = await getDocs(collection(db, ...boxPath))
        boxList.value = snapshot.docs.map(docu => {
           const d = docu.data()
           return {
              id: docu.id,
              nama: d.nama || d['Nama Box'] || '',
              range: d.range || d['Range Isi'] || ''
           }
        })
        triggerSync()
      } catch (error) {
        console.error('LOAD BOX ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       SAVE BOX
    ========================= */
    async function saveBox(data) {
      loading.value = true
      try {
        const payload = {
          nama: data.nama,
          range: data.range
        }
        const docId = data.id ? data.id.toString() : Date.now().toString()
        await setDoc(doc(db, ...boxPath, docId), payload)
        await loadBox()
      } catch (error) {
        console.error('SAVE BOX ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       DELETE BOX
    ========================= */
    async function deleteBox(id) {
      loading.value = true
      try {
        await deleteDoc(doc(db, ...boxPath, id))
        await loadBox()
      } catch (error) {
        console.error('DELETE BOX ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       SEARCH
    ========================= */
    function cariArsip(keyword) {
      const key = keyword.trim().toUpperCase()
      return arsipList.value.filter(item => item.nopol.toUpperCase().includes(key))
    }

    function cariLokasiBox(noSurat) {
      const nomor = parseInt(noSurat)
      for (const box of boxList.value) {
        const split = box.range.split('-')
        const awal = parseInt(split[0])
        const akhir = parseInt(split[1])
        if (nomor >= awal && nomor <= akhir) {
          return box.nama
        }
      }
      return 'Belum masuk box'
    }

    return {
      arsipList,
      boxList,
      loading,
      sync,
      triggerSync,
      totalArsip,
      totalBox,
      arsipTersedia,
      arsipDipinjam,
      loadArsip,
      saveArsip,
      deleteArsip,
      loadBox,
      saveBox,
      deleteBox,
      cariArsip,
      cariLokasiBox
    }
  }
)