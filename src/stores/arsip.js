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
            id_arsip: docu.id, // Sesuai ERD
            // Backwards compatibility dengan data lama
            no_surat: d.no_surat || parseInt(d.noSurat) || parseInt(d['Nomor Surat']) || 0,
            no_polisi: d.no_polisi || d.nopol || d['Nopol'] || '',
            status: d.status ? (d.status.charAt(0).toUpperCase() + d.status.slice(1).toLowerCase()) : 'Tersedia',
            id_admin: d.id_admin || '',
            nama_admin: d.nama_admin || '',
            id_box: d.id_box || '',
            nama_box: d.nama_box || '',
            created_at: d.created_at || ''
          }
        })

        // SORTING FINAL: Mengurutkan murni berdasarkan Nomor Surat (tertinggi di atas)
        rawData.sort((a, b) => Number(b.no_surat) - Number(a.no_surat))

        arsipList.value = rawData
        triggerSync()
      } catch (error) {
        console.error('LOAD ARSIP ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       SAVE DATA ARSIP (SESUAI ERD)
    ========================= */
    async function saveArsip(data) {
      loading.value = true
      try {
        const docId = data.id ? data.id.toString() : `ARSIP-${Date.now()}`

        const payload = {
          no_surat: parseInt(data.no_surat),
          no_polisi: data.no_polisi,
          status: data.status,
          id_admin: localStorage.getItem('userId') || 'ADMIN_UNKNOWN',
          nama_admin: localStorage.getItem('nama') || 'Admin',
          id_box: data.id_box || '',
          nama_box: data.nama_box || '',
          created_at: data.created_at || new Date().toISOString(),
          update: new Date().toISOString()
        }

        await setDoc(doc(db, ...arsipPath, docId), payload, { merge: true })
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
           // Menangani kompatibilitas data lama jika ada
           let rAwal = d.range_awal || 0
           let rAkhir = d.range_akhir || 0

           if (d.range) {
             const split = d.range.split('-')
             rAwal = parseInt(split[0]) || 0
             rAkhir = parseInt(split[1]) || 0
           }

           return {
              id: docu.id,
              id_box: docu.id, // Sesuai ERD
              nama_box: d.nama_box || d.nama || d['Nama Box'] || '',
              range_awal: parseInt(rAwal),
              range_akhir: parseInt(rAkhir),
              id_admin: d.id_admin || '',
              created_at: d.created_at || ''
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
       SAVE BOX (SESUAI ERD)
    ========================= */
    async function saveBox(data) {
      loading.value = true
      try {
        const docId = data.id ? data.id.toString() : `BOX-${Date.now()}`

        const payload = {
          nama_box: data.nama_box,
          range_awal: parseInt(data.range_awal),
          range_akhir: parseInt(data.range_akhir),
          id_admin: localStorage.getItem('userId') || 'ADMIN_UNKNOWN',
          created_at: data.created_at || new Date().toISOString(),
          update: new Date().toISOString()
        }

        await setDoc(doc(db, ...boxPath, docId), payload, { merge: true })
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
       SEARCH & TOOLS
    ========================= */
    function cariArsip(keyword) {
      const key = keyword.trim().toUpperCase()
      return arsipList.value.filter(item => item.no_polisi.toUpperCase().includes(key))
    }

    function cariLokasiBox(noSurat) {
      const nomor = parseInt(noSurat)
      for (const box of boxList.value) {
        if (nomor >= box.range_awal && nomor <= box.range_akhir) {
          return box.nama_box
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
