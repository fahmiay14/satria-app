<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER (Melayang di atas Map) -->
    <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent pt-6 pb-12 px-4 flex items-start gap-4 z-30 pointer-events-none">
      <button @click="router.push('/rute')" class="p-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-full transition flex items-center justify-center pointer-events-auto shadow-sm border border-white/30">
        <span class="material-symbols-outlined text-xl">arrow_back</span>
      </button>
      <div class="text-white mt-1">
        <h1 class="text-lg font-black tracking-wide drop-shadow-md">Tandai Lokasi Pribadi</h1>
        <p class="text-[10px] font-medium drop-shadow-md opacity-90">Geser pin atau gunakan GPS</p>
      </div>
    </div>

    <!-- LEAFLET MAP CONTAINER -->
    <div class="flex-1 relative z-10 bg-slate-200">
      <div id="mapTandai" class="w-full h-full"></div>

      <!-- Target/Crosshair di tengah layar (Visual cue) -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none mt-[-24px]">
        <div class="w-12 h-12 flex flex-col items-center justify-center animate-bounce-slow">
          <div class="bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-[0_5px_15px_rgba(0,0,0,0.4)] flex items-center justify-center" style="border-radius: 50% 50% 50% 0; transform: rotate(-45deg);">
            <div class="w-2 h-2 bg-white rounded-full" style="transform: rotate(45deg);"></div>
          </div>
        </div>
      </div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[399] pointer-events-none">
        <div class="w-2 h-1 bg-black/30 rounded-full shadow-[0_0_10px_5px_rgba(0,0,0,0.3)]"></div>
      </div>

      <!-- Tombol GPS (Shareloc) -->
      <button
        @click="dapatkanLokasiGPS"
        class="absolute bottom-6 right-4 z-[400] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition active:scale-90 border border-gray-100"
      >
        <span v-if="isLoadingGPS" class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span v-else class="material-symbols-outlined">my_location</span>
      </button>
    </div>

    <!-- BOTTOM SHEET (Form Simpan Lokasi) -->
    <div class="bg-white rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.1)] z-30 flex flex-col shrink-0 relative">
      <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-2"></div>

      <form @submit.prevent="simpanLokasi" class="p-5 pt-2 space-y-4">

        <div class="grid grid-cols-2 gap-3">
          <!-- Info Kategori -->
          <div class="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
              <span class="material-symbols-outlined text-[20px]">person_pin_circle</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-0.5">Kategori</p>
              <p class="text-xs text-green-600 font-bold truncate">Rute Pribadi</p>
            </div>
          </div>

          <!-- Info Koordinat Terpilih -->
          <div class="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <span class="material-symbols-outlined text-[20px]">explore</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">Koordinat</p>
              <p class="text-xs text-gray-600 font-mono truncate">{{ koordinat.lat.toFixed(5) }}, {{ koordinat.lng.toFixed(5) }}</p>
            </div>
          </div>
        </div>

        <!-- Input Nama Lokasi -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Titik Lokasi Pribadi</label>
          <input
            v-model="namaLokasi"
            type="text"
            required
            placeholder="Contoh: Rumah Bpk. Budi"
            class="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
          >
        </div>

        <!-- Tombol Simpan -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSaving || !namaLokasi"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2"
          >
            <span v-if="isSaving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined text-[18px]">add_location_alt</span>
            {{ isSaving ? 'Menyimpan...' : 'Simpan sebagai Rute Pribadi' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const store = useRuteStore()

let map = null

const koordinat = ref({ lat: -6.2700806, lng: 107.1481756 }) // Default Samsat Bekasi
const namaLokasi = ref('')
const isLoadingGPS = ref(false)
const isSaving = ref(false)

onMounted(() => {
  initMap()
})

// === INISIALISASI PETA LEAFLET ===
function initMap() {
  map = L.map('mapTandai', {
    zoomControl: false,
    attributionControl: false
  }).setView([koordinat.value.lat, koordinat.value.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map)

  map.on('move', () => {
    const center = map.getCenter()
    koordinat.value = {
      lat: center.lat,
      lng: center.lng
    }
  })
}

// === FUNGSI MENDAPATKAN LOKASI GPS (SHARELOC) ===
function dapatkanLokasiGPS() {
  if (!navigator.geolocation) {
    alert("Browser atau HP Anda tidak mendukung fitur GPS.")
    return
  }

  isLoadingGPS.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      map.flyTo([lat, lng], 17, { duration: 1.5 })
      isLoadingGPS.value = false
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Lokasi Anda ditemukan!', type: 'success' } }))
    },
    (error) => {
      isLoadingGPS.value = false
      let msg = "Gagal mendapatkan lokasi. "
      if (error.code === 1) msg += "Mohon izinkan akses lokasi (GPS) di browser Anda."
      else if (error.code === 2) msg += "Sinyal GPS tidak tersedia."
      else if (error.code === 3) msg += "Waktu pencarian lokasi habis (Timeout)."
      alert(msg)
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// === FUNGSI SIMPAN KE DATABASE SECARA OTOMATIS SEBAGAI PRIBADI ===
async function simpanLokasi() {
  if (!namaLokasi.value.trim()) return

  isSaving.value = true

  try {
    await store.saveLokasi({
      nama: namaLokasi.value.trim(),
      lat: koordinat.value.lat,
      lng: koordinat.value.lng,
      petugas: '',
      kategori: 'Pribadi' // DIKUNCI KE PRIBADI
    })

    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Rute Pribadi ditambahkan!`, type: 'success' } }))

    namaLokasi.value = ''
  } catch (error) {
    alert("Terjadi kesalahan saat menyimpan lokasi.")
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounceSlow 1.5s infinite;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

:deep(.leaflet-container) { z-index: 10 !important; }
</style>
