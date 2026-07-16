import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../services/firebase'
import * as XLSX from 'xlsx-js-style'

import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  writeBatch
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

    // Referensi fungsi unsubscribe listener real-time.
    // Dipakai sebagai guard: kalau sudah berlangganan, loadArsip()/loadBox()
    // berikutnya (mis. dipanggil ulang tiap kali view di-mount) tidak akan
    // membuat listener baru yang duplikat.
    let unsubArsip = null
    let unsubBox = null

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
       MAPPER (dipisah biar tidak duplikat kode)
    ========================= */
    function mapArsipDoc(docu) {
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
    }

    /* =========================
       VALIDASI NO POLISI (longgar: wajib ada huruf & angka, panjang wajar)
       Dipakai bersama saat import Excel -- baik dari mobile (DataArsipView)
       maupun desktop admin (DesktopAdminView) -- supaya aturan validasinya
       SELALU konsisten di kedua tempat, tidak ada lagi cabang kode yang
       longgar sendiri-sendiri.
    ========================= */
    function isNoPolisiValid(value) {
      if (!value) return false
      const hasLetter = /[A-Za-z]/.test(value)
      const hasDigit = /[0-9]/.test(value)
      return value.length >= 3 && value.length <= 15 && hasLetter && hasDigit
    }

    /* =========================
       IMPORT ARSIP DARI FILE EXCEL (.xlsx / .xls)
       Hanya membaca KOLOM A (Nomor Surat) dan KOLOM B (No Polisi) dari
       sheet PERTAMA file yang diupload. Kolom lain diabaikan sepenuhnya --
       jadi file seperti rekap Nota yang punya puluhan kolom pun aman
       diimport tanpa perlu dipotong-potong manual dulu. Baris pertama
       selalu dianggap header dan dilewati.

       Dipakai bersama oleh DataArsipView (mobile) dan DesktopAdminView
       (desktop admin) supaya validasi & perilaku importnya identik di
       kedua tempat -- tidak perlu ubah manual / convert ke CSV lagi.

       Return: { imported, errors } saat berhasil (errors = daftar baris
       yang dilewati, bisa kosong array). Melempar Error kalau gagal total
       (file bukan Excel, file kosong, atau tidak ada satu pun baris valid).
    ========================= */
    async function importArsipFromExcel(file) {
      if (!file) throw new Error('File tidak ditemukan')

      if (!/\.(xlsx|xls)$/i.test(file.name)) {
        throw new Error('File harus berformat .xlsx atau .xls')
      }

      let workbook
      try {
        const buffer = await file.arrayBuffer()
        workbook = XLSX.read(buffer, { type: 'array' })
      } catch (err) {
        console.error('GAGAL BACA FILE EXCEL:', err)
        // Attach original error as cause for better debugging
        throw new Error('File Excel tidak bisa dibaca / rusak', { cause: err })
      }

      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) throw new Error('Sheet pada file Excel tidak ditemukan')

      // header:1 -> array per baris mentah. Kolom A = index 0, Kolom B = index 1
      const rows = XLSX.utils
        .sheet_to_json(sheet, { header: 1, defval: '', raw: true })
        .filter(row => row.some(cell => String(cell).trim() !== ''))

      if (rows.length < 2) {
        throw new Error('File Excel kosong atau tidak memiliki data')
      }

      // Kumpulan No Surat yang sudah ada di database, untuk cegah duplikat
      const existingNoSurat = new Set(arsipList.value.map(item => Number(item.no_surat)))
      const seenInFile = new Set()

      const validRows = []
      const errors = []

      // Baris 0 dianggap header, mulai proses dari baris 1
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
        const rowNum = i + 1 // nomor baris asli di file (ikut menghitung header)

        const rawNoSurat = String(cols[0] ?? '').trim()
        const rawNoPolisi = String(cols[1] ?? '').trim().toUpperCase()

        // Validasi Nomor Surat: wajib angka bulat positif
        if (!/^\d+$/.test(rawNoSurat)) {
          errors.push(`Baris ${rowNum}: Nomor Surat "${rawNoSurat || '(kosong)'}" tidak valid, harus berupa angka`)
          continue
        }
        const noSurat = parseInt(rawNoSurat, 10)

        // Validasi No Polisi: wajib ada, kombinasi huruf & angka
        if (!isNoPolisiValid(rawNoPolisi)) {
          errors.push(`Baris ${rowNum}: No Polisi "${rawNoPolisi || '(kosong)'}" tidak valid`)
          continue
        }

        // Cegah duplikat No Surat yang sudah tersimpan di database
        if (existingNoSurat.has(noSurat)) {
          errors.push(`Baris ${rowNum}: Nomor Surat ${noSurat} sudah ada di database, dilewati`)
          continue
        }

        // Cegah duplikat No Surat di dalam file Excel yang sama
        if (seenInFile.has(noSurat)) {
          errors.push(`Baris ${rowNum}: Nomor Surat ${noSurat} duplikat di dalam file, dilewati`)
          continue
        }
        seenInFile.add(noSurat)

        // Status TIDAK diambil dari file, otomatis "Tersedia" untuk semua data baru
        validRows.push({ noSurat, noPolisi: rawNoPolisi })
      }

      if (validRows.length === 0) {
        const err = new Error('Tidak ada data valid untuk diimpor')
        err.details = errors
        throw err
      }

      loading.value = true
      try {
        let batch = writeBatch(db)
        let count = 0
        for (let idx = 0; idx < validRows.length; idx++) {
          const row = validRows[idx]
          const id = `ARSIP-IMP-${Date.now()}-${idx}`
          const docRef = doc(db, ...arsipPath, id)
          batch.set(docRef, {
            no_surat: row.noSurat,
            no_polisi: row.noPolisi,
            status: 'Tersedia', // Data hasil import selalu berstatus Tersedia
            id_admin: localStorage.getItem('userId') || 'ADMIN_UNKNOWN',
            nama_admin: localStorage.getItem('nama') || 'Admin',
            created_at: new Date().toISOString()
          })
          count++
          if (count === 400) { await batch.commit(); batch = writeBatch(db); count = 0 }
        }
        if (count > 0) await batch.commit()
        // Tidak perlu reload manual -- listener onSnapshot otomatis
        // memperbarui arsipList begitu batch ini masuk.
      } finally {
        loading.value = false
      }

      return { imported: validRows.length, errors }
    }

    /* =========================
       EXPORT ARSIP KE FILE EXCEL (.xlsx)
       Menghasilkan file .xlsx yang SUDAH rapi: header tebal berwarna,
       lebar kolom otomatis menyesuaikan isi, border tiap sel, dan filter
       aktif di baris header -- jadi tidak perlu dirapikan manual lagi
       setelah dibuka di Excel.

       Dipakai bersama oleh DataArsipView (mobile) dan DesktopAdminView
       supaya format hasil export selalu sama di kedua tempat.
    ========================= */
    function exportArsipToExcel() {
      if (arsipList.value.length === 0) {
        throw new Error('Tidak ada data arsip untuk diekspor')
      }

      const headers = ['Nomor Surat', 'No Polisi', 'Status', 'Nama Box']
      const dataRows = arsipList.value.map(item => [
        Number(item.no_surat) || 0,
        item.no_polisi || '',
        item.status || '',
        item.nama_box || '-'
      ])

      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])

      // Lebar kolom otomatis menyesuaikan isi terpanjang tiap kolom
      ws['!cols'] = headers.map((h, colIdx) => {
        const longest = dataRows.reduce((max, row) => {
          return Math.max(max, String(row[colIdx] ?? '').length)
        }, h.length)
        return { wch: Math.min(Math.max(longest + 3, 12), 45) }
      })

      const thinBorder = { style: 'thin', color: { rgb: 'D9D9D9' } }

      // Style header: tebal, background biru SATRIA, teks putih, rata tengah
      headers.forEach((_, colIdx) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: colIdx })
        if (ws[ref]) {
          ws[ref].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '10499B' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }
          }
        }
      })

      // Style tiap sel data: border tipis + rata sesuai jenis kolom
      dataRows.forEach((row, rowIdx) => {
        row.forEach((_, colIdx) => {
          const ref = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx })
          if (ws[ref]) {
            ws[ref].s = {
              border: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
              alignment: { vertical: 'center', horizontal: colIdx === 0 ? 'center' : 'left' }
            }
          }
        })
      })

      ws['!autofilter'] = { ref: `A1:D${dataRows.length + 1}` }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Arsip')

      const filename = `Data_Arsip_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, filename)

      return filename
    }

    /* =========================
       LOAD DATA ARSIP (REAL-TIME)
       Berlangganan ke koleksi arsip lewat onSnapshot. Promise yang
       dikembalikan resolve setelah data PERTAMA diterima (dari cache lokal
       atau server) -- supaya kode yang sudah ada seperti
       `await store.loadArsip()` tetap berjalan seperti biasa. Setelah itu,
       listener tetap aktif di belakang layar dan otomatis memperbarui
       arsipList setiap ada perubahan data (termasuk perubahan dari
       saveArsip/deleteArsip/importArsipFromExcel), jadi tidak perlu reload manual lagi.
    ========================= */
    function loadArsip() {
      if (unsubArsip) {
        // Sudah berlangganan sebelumnya (mis. view yang sama di-mount ulang)
        return Promise.resolve()
      }

      loading.value = true
      return new Promise((resolve) => {
        let firstSnapshot = true

        unsubArsip = onSnapshot(
          collection(db, ...arsipPath),
          (snapshot) => {
            const rawData = snapshot.docs.map(mapArsipDoc)

            // SORTING FINAL: Mengurutkan murni berdasarkan Nomor Surat (tertinggi di atas)
            rawData.sort((a, b) => Number(b.no_surat) - Number(a.no_surat))

            arsipList.value = rawData
            triggerSync()
            loading.value = false

            if (firstSnapshot) { firstSnapshot = false; resolve() }
          },
          (error) => {
            console.error('LOAD ARSIP ERROR:', error)
            loading.value = false
            if (firstSnapshot) { firstSnapshot = false; resolve() }
          }
        )
      })
    }

    // Opsional: hentikan listener arsip (mis. dipanggil saat logout)
    function unsubscribeArsip() {
      if (unsubArsip) { unsubArsip(); unsubArsip = null }
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
        // Tidak perlu await loadArsip() lagi -- listener onSnapshot di atas
        // otomatis memperbarui arsipList begitu tulisan ini masuk.
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
        // Listener onSnapshot otomatis memperbarui arsipList
      } catch (error) {
        console.error('DELETE ARSIP ERROR:', error)
      } finally {
        loading.value = false
      }
    }

    /* =========================
       LOAD BOX (REAL-TIME)
    ========================= */
    function loadBox() {
      if (unsubBox) {
        return Promise.resolve()
      }

      loading.value = true
      return new Promise((resolve) => {
        let firstSnapshot = true

        unsubBox = onSnapshot(
          collection(db, ...boxPath),
          (snapshot) => {
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
            loading.value = false
            if (firstSnapshot) { firstSnapshot = false; resolve() }
          },
          (error) => {
            console.error('LOAD BOX ERROR:', error)
            loading.value = false
            if (firstSnapshot) { firstSnapshot = false; resolve() }
          }
        )
      })
    }

    // Opsional: hentikan listener box (mis. dipanggil saat logout)
    function unsubscribeBox() {
      if (unsubBox) { unsubBox(); unsubBox = null }
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
      importArsipFromExcel,
      exportArsipToExcel,
      loadBox,
      saveBox,
      deleteBox,
      cariArsip,
      cariLokasiBox,
      unsubscribeArsip,
      unsubscribeBox
    }
  }
)
