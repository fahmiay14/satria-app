<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden relative">

    <!-- HEADER -->
    <div class="bg-green-700 text-white px-4 py-4 flex items-center justify-between shadow-md pt-6 shrink-0 z-[500]">
      <div class="flex items-center gap-4">
        <button @click="router.push('/rute/perencanaan')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-lg font-medium">Perencanaan Pribadi</h1>
      </div>
    </div>

    <!-- AREA PETA -->
    <div class="flex-1 relative z-10 bg-slate-200">
      <div id="mapPribadi" class="w-full h-full z-0"></div>

      <!-- Tombol Fokus ke Lokasi Saya -->
      <button
        @click="centerOnUser"
        class="absolute right-4 z-[400] w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all duration-300 active:scale-95"
        :class="selectedLokasi ? 'bottom-[240px]' : 'bottom-6'"
        title="Fokus ke lokasi saya"
      >
        <span class="material-symbols-outlined text-[24px]">my_location</span>
      </button>
    </div>

    <!-- MODAL DETAIL LOKASI (MUNCUL DARI BAWAH) -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[500] transition-transform duration-300 transform"
      :class="selectedLokasi ? 'translate-y-0' : 'translate-y-full'"
    >
      <div v-if="selectedLokasi" class="p-5 pb-8">
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

        <div class="mt-4 mb-4">
          <button
            @click="bukaGoogleMaps(selectedLokasi.lat, selectedLokasi.lng)"
            class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span class="material-symbols-outlined text-[20px]">map</span>
            Buka Alamat di Google Maps
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'
import { Geolocation } from '@capacitor/geolocation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const store = useRuteStore()

// State Reaktif untuk UI
const selectedLokasi = ref(null)
const userLocation = ref(null)

// Variabel Non-Reaktif untuk Leaflet (PENTING: Jangan gunakan ref() untuk objek Leaflet)
let map = null
let markersGroup = null
let userMarker = null
let watchId = null

// Memperbaiki masalah ikon default Leaflet pada Vite/Webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

// === LIFECYCLE ===
onMounted(async () => {
  try {
    await store.loadPetugas()
    await store.loadLokasi()
    initMap()
    startLiveTracking()
  } catch (error) {
    console.error("Gagal memuat data awal:", error)
  }
})

onUnmounted(() => {
  // Membersihkan GPS Tracker
  if (watchId) {
    Geolocation.clearWatch({ id: watchId }).catch(err => console.warn(err))
  }

  // Membersihkan Instance Map agar tidak memory leak atau error saat kembali ke halaman ini
  if (map) {
    map.off()
    map.remove()
    map = null
  }
})

// === FILTER DATA PRIBADI ===
const filteredLokasiMap = computed(() => {
  return store.lokasiList.filter(loc => loc.kategori === 'Pribadi')
})

// Pantau perubahan data rute dari store, lalu render ulang marker
watch(() => store.lokasiList, () => {
  if (map) {
    renderMarkers()
    selectedLokasi.value = null
  }
}, { deep: true })

// === INISIALISASI PETA ===
function initMap() {
  const mapContainer = document.getElementById('mapPribadi')
  if (!mapContainer) return

  // Mencegah inisialisasi ganda
  if (map !== null) {
    map.remove()
  }

  map = L.map('mapPribadi', { zoomControl: false }).setView([-6.27, 107.14], 12)
  L.control.zoom({ position: 'topleft' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  markersGroup = L.layerGroup().addTo(map)
  renderMarkers()
}

// === LOGIKA FITUR BUKA GOOGLE MAPS ===
function bukaGoogleMaps(lat, lng) {
  if (!lat || !lng) return
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  window.open(url, '_blank')
}

// === LOGIKA FITUR LIVE GPS TRACKING ===
async function startLiveTracking() {
  try {
    const checkPerm = await Geolocation.checkPermissions()
    if (checkPerm.location !== 'granted') {
      const requestPerm = await Geolocation.requestPermissions()
      if (requestPerm.location !== 'granted') {
        console.warn("Izin akses lokasi ditolak oleh pengguna.")
        return
      }
    }

    watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (position, err) => {
        if (err) {
          console.warn("Kesalahan membaca GPS:", err)
          return
        }
        if (position) {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          userLocation.value = { lat, lng }
          updateUserMarker(lat, lng)
        }
      }
    )
  } catch (error) {
    console.error("Fitur GPS Capacitor Gagal, mencoba Web API fallback:", error)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        userLocation.value = { lat, lng }
        updateUserMarker(lat, lng)
      }, (err) => {
        console.warn("Web Geolocation Error:", err)
      }, { enableHighAccuracy: true })
    }
  }
}

function updateUserMarker(lat, lng) {
  if (!map) return

  if (!userMarker) {
    const blueDotIcon = L.divIcon({
      className: 'live-location-marker',
      html: `
        <div style="position: relative; width: 18px; height: 18px;">
          <div class="blue-dot-pulse"></div>
          <div class="blue-dot-core"></div>
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    userMarker = L.marker([lat, lng], { icon: blueDotIcon, zIndexOffset: 9999 }).addTo(map)
  } else {
    userMarker.setLatLng([lat, lng])
  }
}

function centerOnUser() {
  if (map && userLocation.value) {
    map.flyTo([userLocation.value.lat, userLocation.value.lng], 16, { animate: true, duration: 1.5 })
  } else {
    // Gunakan alert browser bawaan atau Custom Event jika ada UI toast khusus
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Sedang mencari lokasi GPS Anda...', type: 'error' } }))
  }
}

// === MERENDER MARKER PERUSAHAAN ===
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
  if (!map || !markersGroup) return

  markersGroup.clearLayers()

  filteredLokasiMap.value.forEach(loc => {
    // Proteksi jika data lat/lng tidak valid
    if (!loc.lat || !loc.lng) return;

    const petugasObj = store.petugasList.find(p => p.nama === loc.petugas)
    const pinColor = petugasObj ? (petugasObj.warna || '#94a3b8') : '#94a3b8'

    const marker = L.marker([loc.lat, loc.lng], { icon: createCustomIcon(pinColor) })

    marker.bindTooltip(loc.nama || 'Lokasi', {
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
</script>

<style>
/* Style Khusus untuk Titik Biru Live Location (Global agar terbaca oleh Leaflet) */
.blue-dot-pulse {
  position: absolute;
  inset: 0;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.blue-dot-core {
  position: absolute;
  inset: 0;
  background-color: #2563eb;
  border: 2.5px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.4);
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.8; }
  80% { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}
</style>

<style scoped>
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
