<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center justify-between shadow-md shrink-0 z-20">
      <div class="flex items-center gap-4">
        <button @click="router.push('/laporan')" class="p-1 hover:bg-white/10 rounded-full transition">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-medium tracking-wide">Statistik Sistem</h1>
      </div>

      <button
        @click="cetakLaporan"
        :disabled="isLoading"
        class="bg-white/20 hover:bg-white/30 disabled:bg-white/10 p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold"
      >
        <span class="material-symbols-outlined text-[16px]">print</span> Cetak
      </button>
    </div>

    <!-- KONTEN UTAMA -->
    <div class="flex-1 overflow-y-auto px-5 pt-6 pb-24 relative">

      <div class="mb-6">
        <h2 class="text-xl font-black text-gray-800">Rekapitulasi Data</h2>
        <p class="text-xs text-gray-500 mt-1">Ringkasan seluruh aktivitas dan entri data sistem.</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="w-10 h-10 border-4 border-[#10499b] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-[#10499b] font-bold text-sm">Menghimpun data laporan...</p>
      </div>

      <!-- DASHBOARD RINGKASAN -->
      <div v-else class="space-y-6 animate-slide-up">

        <!-- 1. KARTU ARSIP -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-blue-50 px-4 py-3 flex items-center gap-2 border-b border-blue-100">
            <span class="material-symbols-outlined text-blue-600">folder_open</span>
            <h3 class="font-bold text-blue-800 text-sm">Statistik Arsip</h3>
          </div>
          <div class="p-4 grid grid-cols-3 gap-3 divide-x divide-gray-100">
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p class="text-2xl font-black text-gray-800">{{ arsipStore.totalArsip }}</p>
            </div>
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tersedia</p>
              <p class="text-2xl font-black text-green-600">{{ arsipStore.arsipTersedia }}</p>
            </div>
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dipinjam</p>
              <p class="text-2xl font-black text-amber-500">{{ arsipStore.arsipDipinjam }}</p>
            </div>
          </div>
        </div>

        <!-- 2. KARTU JADWAL -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-green-50 px-4 py-3 flex items-center gap-2 border-b border-green-100">
            <span class="material-symbols-outlined text-green-600">calendar_month</span>
            <h3 class="font-bold text-green-800 text-sm">Statistik Kegiatan</h3>
          </div>
          <div class="p-4 grid grid-cols-3 gap-3 divide-x divide-gray-100">
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p class="text-2xl font-black text-gray-800">{{ jadwalTotal }}</p>
            </div>
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lapangan</p>
              <p class="text-2xl font-black text-orange-500">{{ jadwalLapangan }}</p>
            </div>
            <div class="text-center px-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rapat</p>
              <p class="text-2xl font-black text-emerald-500">{{ jadwalRapat }}</p>
            </div>
          </div>
        </div>

        <!-- 3. KARTU RUTE & LOKASI -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-purple-50 px-4 py-3 flex items-center gap-2 border-b border-purple-100">
            <span class="material-symbols-outlined text-purple-600">route</span>
            <h3 class="font-bold text-purple-800 text-sm">Statistik Rute & Lokasi</h3>
          </div>
          <div class="p-4 grid grid-cols-2 gap-4">

            <div class="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mr-3">
                <span class="material-symbols-outlined">domain</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-500 uppercase">Perusahaan</p>
                <p class="text-lg font-black text-gray-800">{{ rutePerusahaan }} Titik</p>
              </div>
            </div>

            <div class="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm mr-3">
                <span class="material-symbols-outlined">person_pin_circle</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-500 uppercase">Pribadi</p>
                <p class="text-lg font-black text-gray-800">{{ rutePribadi }} Titik</p>
              </div>
            </div>

          </div>
        </div>

        <!-- TOMBOL CETAK BESAR -->
        <button
          @click="cetakLaporan"
          class="w-full mt-4 bg-[#10499b] hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px]">print</span>
          DOWNLOAD LAPORAN PDF
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArsipStore } from '../stores/arsip'
import { useJadwalStore } from '../stores/jadwal'
import { useRuteStore } from '../stores/rute'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const arsipStore = useArsipStore()
const jadwalStore = useJadwalStore()
const ruteStore = useRuteStore()

const isLoading = ref(true)

// MENGAMBIL SEMUA DATA SAAT HALAMAN DIMUAT
onMounted(async () => {
  isLoading.value = true

  // Load data secara bersamaan (Parallel)
  await Promise.all([
    arsipStore.loadArsip(),
    jadwalStore.loadJadwal(),
    ruteStore.loadLokasi(),
    ruteStore.loadPetugas()
  ])

  isLoading.value = false
})

// === COMPUTED DATA UNTUK JADWAL ===
const jadwalTotal = computed(() => jadwalStore.jadwalList.length)
const jadwalLapangan = computed(() => jadwalStore.jadwalList.filter(j => j.type === 'lapangan').length)
const jadwalRapat = computed(() => jadwalStore.jadwalList.filter(j => j.type === 'rapat').length)

// === COMPUTED DATA UNTUK RUTE ===
const rutePerusahaan = computed(() => ruteStore.lokasiList.filter(r => (!r.kategori || r.kategori === 'Perusahaan')).length)
const rutePribadi = computed(() => ruteStore.lokasiList.filter(r => r.kategori === 'Pribadi').length)

async function cetakHtmlAtauSharePdf(html, namaFile, judulDokumen = 'Laporan') {
  // Kalau dibuka di browser/laptop, tetap pakai print iframe biasa
  if (!Capacitor.isNativePlatform()) {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow.document
    iframeDoc.open()
    iframeDoc.write(`
      <html>
      <head>
        <title>${judulDokumen}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    iframeDoc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 500)

    return
  }

  // Kalau di APK Android, ubah HTML menjadi PDF lalu Share/Cetak
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '794px'
  wrapper.style.background = '#fff'
  wrapper.style.color = '#000'
  wrapper.style.padding = '40px'
  wrapper.innerHTML = html

  document.body.appendChild(wrapper)

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const base64Pdf = pdf.output('datauristring').split(',')[1]

    await Filesystem.writeFile({
      path: namaFile,
      data: base64Pdf,
      directory: Directory.Cache
    })

    const fileUri = await Filesystem.getUri({
      path: namaFile,
      directory: Directory.Cache
    })

    await Share.share({
      title: judulDokumen,
      text: 'File laporan dalam bentuk PDF.',
      files: [fileUri.uri],
      dialogTitle: 'Bagikan / Cetak Laporan'
    })
  } catch (error) {
    console.error('Gagal membuat PDF:', error)
    alert('Gagal membuat PDF laporan.')
  } finally {
    document.body.removeChild(wrapper)
  }
}

// === FUNGSI CETAK LAPORAN (PDF) ===
async function cetakLaporan() {
  const tgl = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
  const jam = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})

  let html = `
    <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size: 22px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px; color: #000;">LAPORAN REKAPITULASI SISTEM</h2>
      <h3 style="font-size: 16px; font-weight: normal; margin: 5px 0 0 0; color: #333;">Aplikasi Penelusuran (Satria App)</h3>
      <p style="font-size: 12px; color: #555; margin: 10px 0 0 0;">Dicetak pada: ${tgl} | Pukul: ${jam} WIB</p>
    </div>

    <!-- TABEL 1: ARSIP -->
    <h4 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 8px; border-left: 4px solid #10499b; padding-left: 8px;">A. STATUS DATA ARSIP</h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">TOTAL ARSIP</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">TERSEDIA</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 34%;">DIPINJAM</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center;">${arsipStore.totalArsip}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #16a34a;">${arsipStore.arsipTersedia}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #d97706;">${arsipStore.arsipDipinjam}</td>
        </tr>
      </tbody>
    </table>

    <!-- TABEL 2: JADWAL -->
    <h4 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 8px; border-left: 4px solid #16a34a; padding-left: 8px;">B. REKAPITULASI JADWAL KEGIATAN</h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">TOTAL KEGIATAN</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">TUGAS LAPANGAN</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 34%;">RAPAT INTERNAL</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center;">${jadwalTotal.value}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #ea580c;">${jadwalLapangan.value}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #059669;">${jadwalRapat.value}</td>
        </tr>
      </tbody>
    </table>

    <!-- TABEL 3: RUTE -->
    <h4 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 8px; border-left: 4px solid #9333ea; padding-left: 8px;">C. PEMETAAN RUTE & LOKASI</h4>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">TOTAL TITIK LOKASI</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 33%;">RUTE PERUSAHAAN</th>
          <th style="border: 1px solid #000; padding: 10px; font-size: 12px; text-align: center; width: 34%;">RUTE PRIBADI</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center;">${ruteStore.lokasiList.length}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #2563eb;">${rutePerusahaan.value}</td>
          <td style="border: 1px solid #000; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; color: #16a34a;">${rutePribadi.value}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 50px; text-align: right; padding-right: 20px;">
      <p style="font-size: 12px; margin-bottom: 60px;">Mengetahui,<br>Administrator Sistem</p>
      <p style="font-size: 12px; font-weight: bold; text-decoration: underline;">${localStorage.getItem('nama') || 'Admin'}</p>
    </div>
  `
  await cetakHtmlAtauSharePdf(
  html,
  'Laporan_Rekapitulasi_Sistem.pdf',
  'Laporan Rekapitulasi Sistem'
)
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
