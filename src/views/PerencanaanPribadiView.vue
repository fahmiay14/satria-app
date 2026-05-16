<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden relative">

    <!-- HEADER -->
    <div class="bg-green-700 text-white px-4 py-4 flex items-center justify-between shadow-md pt-6 shrink-0 z-[500]">
      <div class="flex items-center gap-4">
        <!-- Kembali ke Menu Perencanaan -->
        <button @click="router.push('/rute/perencanaan')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-medium">Perencanaan Pribadi</h1>
      </div>

      <!-- Tombol Aksi Kanan (Fitur Tambah Petugas Dihilangkan) -->
      <div class="flex gap-2">
        <button @click="bukaLaporan" class="p-1.5 bg-teal-500 hover:bg-teal-400 rounded-lg transition text-xs font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">print</span> Laporan
        </button>
      </div>
    </div>

    <!-- LEAFLET MAP CONTAINER (Clean tanpa legenda melayang) -->
    <div class="flex-1 relative z-10 bg-slate-200">
      <div id="mapPribadi" class="w-full h-full"></div>
    </div>

    <!-- BOTTOM SHEET (Detail Lokasi saat Marker diklik) -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[500] transition-transform duration-300 transform"
      :class="selectedLokasi ? 'translate-y-0' : 'translate-y-full'"
    >
      <div v-if="selectedLokasi" class="p-5">
        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="flex items-center gap-1 mb-1">
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                Pribadi
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 leading-tight">{{ selectedLokasi.nama }}</h3>
            <p class="text-[11px] text-gray-500 mt-1 font-mono">{{ selectedLokasi.lat }}, {{ selectedLokasi.lng }}</p>
          </div>
          <button @click="selectedLokasi = null" class="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full p-1 transition">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
          <label class="block text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">Tugaskan Kepada:</label>
          <select
            v-model="selectedLokasi.petugas"
            @change="updatePetugas(selectedLokasi)"
            class="w-full text-sm p-2.5 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium"
          >
            <option value="">-- Belum Ditugaskan --</option>
            <option v-for="p in store.petugasList" :key="p.id" :value="p.nama">{{ p.nama }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- MODAL LAPORAN -->
    <div v-if="showLaporanModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-center items-center p-2 sm:p-4">
      <div class="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-slide-up">

        <div class="p-4 border-b border-teal-700 flex justify-between items-center bg-teal-600 text-white shrink-0">
          <h3 class="font-bold flex items-center gap-2">
            <span class="material-symbols-outlined">description</span> Pratinjau Penempatan (Pribadi)
          </h3>
          <button @click="showLaporanModal = false" class="text-teal-100 hover:text-white"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
          <div v-if="!reportData || reportData.total === 0" class="text-center text-gray-500 py-10">
            Data rute pribadi kosong.
          </div>

          <div v-else class="max-w-4xl mx-auto space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Pribadi</span>
                <span class="text-2xl font-black text-gray-800 mt-1">{{ reportData.total }}</span>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Petugas Aktif</span>
                <span class="text-2xl font-black text-blue-600 mt-1">{{ reportData.petugasCount }}</span>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Telah Ditangani</span>
                <span class="text-2xl font-black text-green-600 mt-1">{{ reportData.assigned }} <span class="text-xs font-normal text-gray-500">({{ reportData.percent }}%)</span></span>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanpa Petugas</span>
                <span class="text-2xl font-black mt-1" :class="reportData.unassigned.length > 0 ? 'text-red-600' : 'text-gray-400'">{{ reportData.unassigned.length }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(group, pName) in reportData.grouped" :key="pName" class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden max-h-[350px]">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
                  <h4 class="font-bold text-sm text-gray-800 uppercase truncate pr-2">{{ pName }}</h4>
                  <span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md shrink-0">{{ group.list.length }} Lokasi</span>
                </div>
                <div class="flex-1 overflow-y-auto p-2 bg-gray-50 space-y-2">
                  <div v-if="group.list.length === 0" class="p-6 text-center text-xs text-gray-400 italic">Belum ada penugasan</div>
                  <div v-else v-for="(loc, idx) in group.list" :key="loc.id" class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center">
                    <span class="w-6 text-center text-gray-400 font-medium text-xs mr-2 shrink-0">{{ idx + 1 }}</span>
                    <span class="font-medium text-gray-700 text-sm truncate">{{ loc.nama }}</span>
                  </div>
                </div>
              </div>

              <div v-if="reportData.unassigned.length > 0" class="bg-white rounded-xl shadow-sm border border-red-200 flex flex-col overflow-hidden max-h-[350px]">
                <div class="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center shrink-0">
                  <h4 class="font-bold text-sm text-red-800 uppercase truncate pr-2">Belum Diassign</h4>
                  <span class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md shrink-0">{{ reportData.unassigned.length }} Lokasi</span>
                </div>
                <div class="flex-1 overflow-y-auto p-2 bg-red-50 space-y-2">
                  <div v-for="(loc, idx) in reportData.unassigned" :key="loc.id" class="bg-white border border-red-200 rounded-lg p-3 shadow-sm flex items-center">
                    <span class="w-6 text-center text-red-400 font-medium text-xs mr-2 shrink-0">{{ idx + 1 }}</span>
                    <span class="font-bold text-red-700 text-sm truncate">{{ loc.nama }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 bg-white flex justify-end items-center shrink-0">
          <span class="text-xs text-gray-400 mr-4 hidden sm:block">Laporan PDF akan menggunakan format tabel formal.</span>
          <button @click="cetakLaporan" class="bg-[#10499b] hover:bg-blue-800 text-white px-6 py-3 rounded-xl shadow flex items-center gap-2 text-sm font-bold transition active:scale-95">
            <span class="material-symbols-outlined text-[18px]">print</span> CETAK LAPORAN (PDF)
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const store = useRuteStore()

let map = null
let markersGroup = null

const selectedLokasi = ref(null)
const showLaporanModal = ref(false)
const reportData = ref(null)

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

onMounted(async () => {
  await store.loadPetugas()
  await store.loadLokasi()
  initMap()
})

const filteredLokasiMap = computed(() => {
  return store.lokasiList.filter(loc => loc.kategori === 'Pribadi')
})

watch(() => store.lokasiList, () => {
  renderMarkers()
  selectedLokasi.value = null
}, { deep: true })

function initMap() {
  map = L.map('mapPribadi', { zoomControl: false }).setView([-6.27, 107.14], 12)
  L.control.zoom({ position: 'topleft' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  markersGroup = L.layerGroup().addTo(map)
  renderMarkers()
}

function createCustomIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  })
}

function renderMarkers() {
  if (!markersGroup) return
  markersGroup.clearLayers()

  filteredLokasiMap.value.forEach(loc => {
    const petugasObj = store.petugasList.find(p => p.nama === loc.petugas)
    const pinColor = petugasObj ? petugasObj.warna : '#94a3b8'

    const marker = L.marker([loc.lat, loc.lng], { icon: createCustomIcon(pinColor) })

    marker.bindTooltip(loc.nama, {
      permanent: true,
      direction: 'top',
      className: 'company-label-tooltip',
      offset: [0, -32]
    })

    marker.on('click', () => {
      selectedLokasi.value = { ...loc }
      map.flyTo([loc.lat, loc.lng], 16, { duration: 1 })
    })

    markersGroup.addLayer(marker)
  })
}

async function updatePetugas(lokasi) {
  await store.saveLokasi(lokasi)
}

function siapkanDataLaporan() {
  const companies = filteredLokasiMap.value
  const petugas = store.petugasList

  let grouped = {}
  let unassigned = []

  petugas.forEach(p => grouped[p.nama] = { list: [] })

  companies.forEach(c => {
    if (!c.petugas || c.petugas === '') {
      unassigned.push(c)
    } else {
      if(!grouped[c.petugas]) grouped[c.petugas] = { list: [] }
      grouped[c.petugas].list.push(c)
    }
  })

  const total = companies.length
  const assigned = total - unassigned.length
  const percent = total === 0 ? 0 : Math.round((assigned / total) * 100)

  reportData.value = {
    total,
    petugasCount: petugas.length,
    assigned,
    percent,
    unassigned,
    grouped
  }
}

function bukaLaporan() {
  siapkanDataLaporan()
  showLaporanModal.value = true
}

function cetakLaporan() {
  if (!reportData.value) return;

  const data = reportData.value;
  const tgl = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})

  let html = `
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px; color: #000;">Laporan Penempatan Petugas</h2>
      <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 5px 0 0 0; color: #000;">Data Rute Pribadi</h3>
      <p style="font-size: 11px; color: #555; margin: 8px 0 0 0;">Tanggal Cetak: ${tgl}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 25px; background-color: #f9fafb;">
      <tr>
        <td style="width: 25%; text-align: center; border-right: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555;">Total Pribadi</div>
          <div style="font-size: 20px; font-weight: bold; margin-top: 5px; color: #000;">${data.total}</div>
        </td>
        <td style="width: 25%; text-align: center; border-right: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555;">Petugas Aktif</div>
          <div style="font-size: 20px; font-weight: bold; margin-top: 5px; color: #0066cc;">${data.petugasCount}</div>
        </td>
        <td style="width: 25%; text-align: center; border-right: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555;">Ditangani</div>
          <div style="font-size: 20px; font-weight: bold; margin-top: 5px; color: #16a34a;">${data.assigned} <span style="font-size: 11px; font-weight: normal; color: #666;">(${data.percent}%)</span></div>
        </td>
        <td style="width: 25%; text-align: center; padding: 10px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555;">Tanpa Petugas</div>
          <div style="font-size: 20px; font-weight: bold; margin-top: 5px; color: ${data.unassigned.length > 0 ? '#dc2626' : '#94a3b8'};">${data.unassigned.length}</div>
        </td>
      </tr>
    </table>
    <div style="column-count: 2; column-gap: 30px;">
  `

  for (let pName in data.grouped) {
    let list = data.grouped[pName].list
    html += `
      <div style="break-inside: avoid; margin-bottom: 20px; page-break-inside: avoid;">
        <table style="width: 100%; border-bottom: 1px solid #000; margin-bottom: 8px; border-collapse: collapse;">
          <tr>
            <td style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #000; padding: 0 0 5px 0; vertical-align: bottom;">${pName}</td>
            <td style="font-size: 10px; font-weight: bold; color: #000; padding: 0 0 5px 0; vertical-align: bottom; text-align: right;">Total: ${list.length}</td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center; width: 30px; color: #000;">No</th>
              <th style="border: 1px solid #000; padding: 6px; font-size: 10px; text-align: left; color: #000;">Nama Titik Rute</th>
            </tr>
          </thead>
          <tbody>
    `
    if(list.length === 0) {
      html += `<tr><td colspan="2" style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px; color: #666; font-style: italic;">Belum ada tugas</td></tr>`
    } else {
      list.forEach((c, idx) => {
        html += `
          <tr>
            <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px; color: #000;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 6px; font-size: 10px; font-weight: 500; color: #000;">${c.nama}</td>
          </tr>`
      })
    }
    html += `</tbody></table></div>`
  }

  if(data.unassigned.length > 0) {
    html += `
      <div style="break-inside: avoid; margin-bottom: 20px; page-break-inside: avoid;">
        <table style="width: 100%; border-bottom: 1px solid #dc2626; margin-bottom: 8px; border-collapse: collapse;">
          <tr>
            <td style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #dc2626; padding: 0 0 5px 0; vertical-align: bottom;">BELUM ADA PETUGAS</td>
            <td style="font-size: 10px; font-weight: bold; color: #dc2626; padding: 0 0 5px 0; vertical-align: bottom; text-align: right;">Total: ${data.unassigned.length}</td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #dc2626;">
          <thead>
            <tr style="background-color: #fef2f2;">
              <th style="border: 1px solid #dc2626; padding: 6px; font-size: 10px; text-align: center; width: 30px; color: #991b1b;">No</th>
              <th style="border: 1px solid #dc2626; padding: 6px; font-size: 10px; text-align: left; color: #991b1b;">Nama Titik Rute</th>
            </tr>
          </thead>
          <tbody>
    `
    data.unassigned.forEach((c, idx) => {
      html += `
        <tr style="background-color: #fef2f2;">
          <td style="border: 1px solid #dc2626; padding: 6px; text-align: center; font-size: 10px; color: #991b1b;">${idx + 1}</td>
          <td style="border: 1px solid #dc2626; padding: 6px; font-size: 10px; font-weight: bold; color: #991b1b;">${c.nama}</td>
        </tr>`
    })
    html += `</tbody></table></div>`
  }

  html += `</div>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <html>
    <head>
      <title>Laporan_Penempatan_Petugas_Pribadi</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000; background: #fff; margin: 0; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 500)
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }

:deep(.leaflet-container) { z-index: 10 !important; }

:deep(.company-label-tooltip) {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important;
  color: #1e293b !important;
  font-weight: 700 !important;
  font-size: 10px !important;
  padding: 3px 6px !important;
  border-radius: 4px !important;
  white-space: nowrap !important;
}

:deep(.leaflet-tooltip-top.company-label-tooltip::before) {
  border-top-color: rgba(255, 255, 255, 0.95) !important;
}
</style>
