<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button @click="router.push('/rute')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Optimasi Rute Tercepat</h1>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-6">

      <!-- FORM KALKULASI -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-amber-500">route</span>
          <h3 class="font-bold text-gray-800">Generate Rute Terpendek</h3>
        </div>

        <form @submit.prevent="kalkulasiRute" class="space-y-4">
          <!-- Pilih Petugas -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">1. Pilih Petugas</label>
            <select
              v-model="selectedPetugas"
              required
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white font-medium"
            >
              <option value="" disabled>-- Pilih Petugas --</option>
              <option v-for="p in store.petugasList" :key="p.id" :value="p.nama">{{ p.nama }}</option>
            </select>
          </div>

          <!-- Titik Awal -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">2. Titik Awal (Lat, Lng)</label>
            <input
              v-model="startCoord"
              type="text"
              required
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
            >
            <p class="text-[10px] text-gray-400 mt-1.5">*Default: Kantor Samsat Kabupaten Bekasi</p>
          </div>

          <!-- Tombol Generate -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isCalculating || !selectedPetugas"
              class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3.5 rounded-xl shadow transition active:scale-95 text-sm flex justify-center items-center gap-2"
            >
              <span v-if="isCalculating" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-[18px]">calculate</span>
              {{ isCalculating ? 'Mengkalkulasi...' : 'Kalkulasi & Buat Link Maps' }}
            </button>
          </div>
        </form>
      </div>

      <!-- HASIL OPTIMASI -->
      <div v-if="resultRoute && resultRoute.length > 0" class="bg-white rounded-2xl p-5 shadow-sm border border-green-200 animate-slide-up">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-green-500">check_circle</span>
          <h3 class="font-bold text-gray-800 text-sm">Rute Berhasil Dibuat!</h3>
        </div>

        <p class="text-[11px] text-gray-500 mb-4">
          Ditemukan <span class="font-bold text-gray-800">{{ resultRoute.length }} titik lokasi</span> untuk {{ selectedPetugas }}.
        </p>

        <!-- Link Result -->
        <div class="relative mb-5">
          <textarea
            v-model="resultLink"
            readonly
            class="w-full h-24 border border-green-300 bg-green-50 p-3 rounded-xl text-xs text-gray-700 outline-none resize-none font-mono pr-28"
          ></textarea>

          <button
            @click="bukaLinkMaps"
            class="absolute bottom-3 right-3 bg-[#10499b] hover:bg-blue-800 text-white text-[10px] font-bold py-2 px-3 rounded-lg shadow transition active:scale-95 flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">directions</span>
            BUKA DI MAPS
          </button>
        </div>

        <!-- Urutan Rute Preview -->
        <div>
          <h4 class="text-xs font-bold text-gray-700 mb-2 border-b pb-1">Urutan Kunjungan:</h4>
          <div class="space-y-2 max-h-[40vh] overflow-y-auto pr-1">

            <div class="flex gap-3 items-center">
              <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm border border-blue-200">
                <span class="material-symbols-outlined text-[14px]">home</span>
              </div>
              <span class="text-xs font-bold text-gray-800">Titik Awal (Samsat)</span>
            </div>

            <div class="w-0.5 h-3 bg-gray-200 ml-3"></div>

            <template v-for="(loc, index) in resultRoute" :key="loc.id">
              <div class="flex gap-3 items-center">
                <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm border border-amber-200">
                  {{ index + 1 }}
                </div>
                <span class="text-xs font-medium text-gray-700 truncate">{{ loc.nama }}</span>
              </div>
              <div v-if="index !== resultRoute.length - 1" class="w-0.5 h-3 bg-gray-200 ml-3"></div>
            </template>

          </div>
        </div>

      </div>

      <!-- Jika Petugas tidak punya tugas -->
      <div v-if="hasCalculated && (!resultRoute || resultRoute.length === 0)" class="bg-red-50 rounded-2xl p-5 border border-red-200 text-center animate-slide-up">
        <span class="material-symbols-outlined text-3xl text-red-400 mb-2">error</span>
        <p class="text-sm font-bold text-red-800">Tidak ada lokasi!</p>
        <p class="text-xs text-red-600 mt-1">Petugas ini belum memiliki tugas kunjungan perusahaan.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'

const router = useRouter()
const store = useRuteStore()

const selectedPetugas = ref('')
const startCoord = ref('-6.270080679426531, 107.1481756927926') // Default Kantor Samsat
const isCalculating = ref(false)
const hasCalculated = ref(false)

const resultRoute = ref()
const resultLink = ref('')

onMounted(() => {
  store.loadLokasi()
  store.loadPetugas()
})

// === ALGORITMA HAVERSINE DISTANCE ===
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// === ALGORITMA NEAREST NEIGHBOR ===
function kalkulasiRute() {
  if (!selectedPetugas.value || !startCoord.value.includes(',')) {
    alert("Format koordinat tidak valid atau petugas belum dipilih.")
    return
  }

  isCalculating.value = true
  hasCalculated.value = false

  setTimeout(() => {
    const startParts = startCoord.value.split(',')
    const sLat = parseFloat(startParts[0].trim())
    const sLng = parseFloat(startParts[1].trim())

    const unvisited = store.lokasiList.filter(l => l.petugas === selectedPetugas.value)

    if (unvisited.length === 0) {
      resultRoute.value = []
      resultLink.value = ''
      isCalculating.value = false
      hasCalculated.value = true
      return
    }

    let currentPos = { lat: sLat, lng: sLng }
    let sortedRoute = []

    while (unvisited.length > 0) {
      let nearestIndex = -1
      let minDistance = Infinity

      for (let i = 0; i < unvisited.length; i++) {
        let dist = getDistance(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng)
        if (dist < minDistance) {
          minDistance = dist
          nearestIndex = i
        }
      }

      let nextTarget = unvisited[nearestIndex]
      sortedRoute.push(nextTarget)
      currentPos = { lat: nextTarget.lat, lng: nextTarget.lng }
      unvisited.splice(nearestIndex, 1)
    }

    let mapUrl = `https://www.google.com/maps/dir/${sLat},${sLng}/`
    sortedRoute.forEach(loc => {
      mapUrl += `${loc.lat},${loc.lng}/`
    })

    resultRoute.value = sortedRoute
    resultLink.value = mapUrl
    isCalculating.value = false
    hasCalculated.value = true

    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Optimasi Rute Selesai!' } }))

  }, 800)
}

function bukaLinkMaps() {
  if (!resultLink.value) return
  // Langsung membuka link di tab/aplikasi baru
  window.open(resultLink.value, '_blank')
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
