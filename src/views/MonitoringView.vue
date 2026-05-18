<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">
    
    <!-- HEADER (Melayang di atas Map) -->
    <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pt-6 pb-12 px-4 flex items-start justify-between z-[500] pointer-events-none">
      <div class="flex items-center gap-4">
        <button @click="router.push('/laporan')" class="p-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-full transition flex items-center justify-center pointer-events-auto shadow-sm border border-white/30">
          <span class="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div class="text-white mt-1">
          <h1 class="text-lg font-black tracking-wide drop-shadow-md">Monitoring Lapangan</h1>
          <p class="text-[10px] font-medium drop-shadow-md opacity-90">Pemantauan progres secara Real-time</p>
        </div>
      </div>
      
      <!-- Indikator Live -->
      <div class="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1 mt-2 shadow-md">
        <div class="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
      </div>
    </div>

    <!-- LEAFLET MAP CONTAINER -->
    <div class="flex-1 relative z-10 bg-slate-200">
      <div id="mapMonitoring" class="w-full h-full"></div>

      <!-- TOMBOL RECENTER MAP -->
      <button 
        @click="recenterMap" 
        class="absolute bottom-6 right-4 z-[400] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition active:scale-90 border border-gray-100"
      >
        <span class="material-symbols-outlined">zoom_out_map</span>
      </button>
    </div>

    <!-- BOTTOM SHEET (Daftar Progres Harian) -->
    <div 
      class="bg-white rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.15)] z-[500] flex flex-col shrink-0 relative transition-all duration-300"
      :class="isSheetExpanded ? 'h-[60vh]' : 'h-[25vh]'"
    >
      <!-- Area Handle untuk drag/klik -->
      <div 
        @click="isSheetExpanded = !isSheetExpanded" 
        class="w-full pt-3 pb-2 flex flex-col items-center cursor-pointer bg-gray-50/50 rounded-t-3xl hover:bg-gray-100 transition"
      >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
        <div class="flex justify-between items-center w-full px-6">
          <h3 class="font-bold text-gray-800 text-sm flex items-center gap-1.5">
            <span class="material-symbols-outlined text-blue-600 text-[18px]">data_usage</span>
            Progres Bulan Ini ({{ formatBulanTahun(today) }})
          </h3>
          <span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md">
            {{ completedCount }} / {{ totalLocations }} Selesai
          </span>
        </div>
      </div>

      <!-- Area Daftar Lokasi -->
      <div class="flex-1 overflow-y-auto p-5 pt-2">
        <!-- Input Pencarian -->
        <div class="relative mb-4">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm pointer-events-none">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari nama perusahaan atau petugas..." 
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs bg-gray-50"
          />
        </div>

        <div v-if="filteredLocations.length === 0" class="text-center py-6 text-gray-400 text-xs italic">
          Data lokasi tidak ditemukan.
        </div>

        <div class="space-y-2.5">
          <div 
            v-for="loc in filteredLocations" 
            :key="loc.id"
            @click="focusToLocation(loc)"
            class="border border-gray-100 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition group"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <!-- Indikator Warna Petugas -->
              <div class="w-3 h-3 rounded-full shrink-0 shadow-sm border border-gray-200" :style="{ backgroundColor: loc.color }"></div>
              
              <div class="min-w-0 flex-1">
                <h4 class="font-bold text-gray-800 text-[13px] truncate" :class="loc.isCompleted ? 'text-green-700' : ''">
                  {{ loc.nama }}
                </h4>
                <p class="text-[10px] text-gray-500 font-medium mt-0.5 truncate flex items-center gap-1">
                  <span class="material-symbols-outlined text-[10px]">person</span> 
                  {{ loc.petugas || 'Belum ditugaskan' }}
                </p>
              </div>
            </div>

            <!-- Status Selesai / Belum -->
            <div class="shrink-0 ml-2">
              <div v-if="loc.isCompleted" class="bg-green-100 text-green-700 rounded-full w-7 h-7 flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
              <div v-else class="bg-gray-100 text-gray-400 rounded-full w-7 h-7 flex items-center justify-center group-hover:text-blue-500">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'
import { useLaporanStore } from '../stores/laporan'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const ruteStore = useRuteStore()
const laporanStore = useLaporanStore()

let map = null
let markersGroup = null

const isSheetExpanded = ref(false)
const searchQuery = ref('')
const today = new Date()

// Helper format bulan dan tahun
const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

function formatBulanTahun(dateObj) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  return `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`
}

onMounted(async () => {
  await ruteStore.loadPetugas()
  await ruteStore.loadLokasi()
  laporanStore.subscribeLaporan() // Aktifkan real-time listener laporan
  initMap()
})

onUnmounted(() => {
  laporanStore.unsubscribeLaporan() // Matikan listener saat pindah halaman
})

// === LOGIKA PENGGABUNGAN DATA (LOKASI + STATUS LAPORAN) ===
const mappedLocations = computed(() => {
  // Hanya ambil lokasi rute perusahaan (atau bisa semua jika mau)
  const perusahaanList = ruteStore.lokasiList.filter(l => (!l.kategori || l.kategori === 'Perusahaan'))
  
  return perusahaanList.map(loc => {
    // 1. Cari warna petugas
    const petugasObj = ruteStore.petugasList.find(p => p.nama === loc.petugas)
    const color = petugasObj ? petugasObj.warna : '#94a3b8'

    // 2. Cek apakah ada laporan BULAN INI untuk perusahaan ini
    const isCompleted = laporanStore.laporanList.some(r => r.perusahaan === loc.nama && r.date && r.date.startsWith(currentMonthStr))

    return { ...loc, color, isCompleted }
  })
})

const totalLocations = computed(() => mappedLocations.value.length)
const completedCount = computed(() => mappedLocations.value.filter(l => l.isCompleted).length)

// Filter List Pencarian
const filteredLocations = computed(() => {
  if (!searchQuery.value) return mappedLocations.value
  const q = searchQuery.value.toLowerCase()
  return mappedLocations.value.filter(l => 
    l.nama.toLowerCase().includes(q) || 
    (l.petugas && l.petugas.toLowerCase().includes(q))
  )
})

// Watcher untuk merender ulang pin di peta secara Real-time saat data berubah
watch(mappedLocations, () => {
  renderMarkers()
}, { deep: true })

// === INISIALISASI PETA LEAFLET ===
function initMap() {
  map = L.map('mapMonitoring', { zoomControl: false }).setView([-6.27, 107.14], 12)
  L.control.zoom({ position: 'topleft' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  markersGroup = L.layerGroup().addTo(map)
  renderMarkers()
}

// === MEMBUAT PIN MAPS CUSTOM ===
function createMonitoringIcon(color, isCompleted) {
  // Jika selesai, tambahkan badge ceklis hijau di pojok kanan atas pin
  const badgeHTML = isCompleted ? `
    <div style="position: absolute; top: -6px; right: -6px; background: #16a34a; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 20;">
      <svg style="width:12px; height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
    </div>
  ` : ''

  return L.divIcon({
    className: 'custom-monitoring-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <!-- Body Pin Peta -->
        <div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
        ${badgeHTML}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

// === RENDER MARKER KE MAPS ===
function renderMarkers() {
  if (!markersGroup || !map) return
  markersGroup.clearLayers()

  const bounds = L.latLngBounds()

  mappedLocations.value.forEach(loc => {
    if (!loc.lat || !loc.lng) return

    const marker = L.marker([loc.lat, loc.lng], { 
      icon: createMonitoringIcon(loc.color, loc.isCompleted),
      zIndexOffset: loc.isCompleted ? 1000 : 0 // Marker yang selesai prioritas tampil di atas
    })
    
    // Popup info ketika pin diklik
    marker.bindPopup(`
      <div class="text-center font-sans p-1">
        <h3 class="font-bold text-[13px] text-gray-800 border-b pb-1 mb-1">${loc.nama}</h3>
        <p class="text-[10px] text-gray-600 mb-2">Petugas: <span class="font-bold" style="color: ${loc.color}">${loc.petugas || 'Belum diassign'}</span></p>
        ${loc.isCompleted 
          ? '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">✓ Telah Dikunjungi</span>' 
          : '<span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">Menunggu Kunjungan</span>'
        }
      </div>
    `)

    markersGroup.addLayer(marker)
    bounds.extend([loc.lat, loc.lng])
  })

  // Fit bounds agar semua pin terlihat (jika baru pertama kali diload)
  if (mappedLocations.value.length > 0 && !isSheetExpanded.value) {
    map.fitBounds(bounds, { padding: [30, 30] })
  }
}

// === FUNGSI KLIK LIST KE MAPS ===
function focusToLocation(loc) {
  if (!map) return
  isSheetExpanded.value = false // Tutup sheet sebentar
  
  // Terbang ke lokasi
  map.flyTo([loc.lat, loc.lng], 16, { duration: 1.5 })
  
  // Cari dan buka popup marker terkait
  setTimeout(() => {
    markersGroup.eachLayer(layer => {
      const latLng = layer.getLatLng()
      if (latLng.lat === loc.lat && latLng.lng === loc.lng) {
        layer.openPopup()
      }
    })
  }, 1600)
}

function recenterMap() {
  const bounds = L.latLngBounds()
  mappedLocations.value.forEach(loc => {
    if (loc.lat && loc.lng) bounds.extend([loc.lat, loc.lng])
  })
  if (bounds.isValid()) {
    map.flyToBounds(bounds, { padding: [30, 30], duration: 1 })
  }
}
</script>

<style scoped>
:deep(.leaflet-container) { z-index: 10 !important; }
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
:deep(.leaflet-popup-content) {
  margin: 10px;
}
</style>