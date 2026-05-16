<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/laporan')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-semibold tracking-wide">
        {{ role === 'admin' ? 'Pantau Laporan Harian' : 'Laporan Harian' }}
      </h1>
    </div>

    <!-- KALENDER CARD -->
    <div class="bg-white rounded-b-3xl shadow-sm px-5 pt-4 pb-4 shrink-0 z-10 relative">
      <div class="flex justify-between items-center mb-4">
        <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"><span class="material-symbols-outlined">chevron_left</span></button>
        <h2 class="text-[#10499b] font-bold text-sm uppercase tracking-wide">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"><span class="material-symbols-outlined">chevron_right</span></button>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-1 text-center">
        <span v-for="day in dayNames" :key="day" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ day }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div v-for="blank in firstDayOfMonth" :key="'blank-' + blank" class="aspect-[4/3]"></div>

        <button
          v-for="day in daysInMonth"
          :key="day.date"
          @click="selectDate(day.fullDate)"
          class="aspect-[4/3] flex flex-col items-center justify-center relative rounded-xl transition-all duration-200"
          :class="[
            selectedDate === day.fullDate ? 'bg-[#10499b] text-white shadow-md transform scale-105' : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100',
            isToday(day.fullDate) && selectedDate !== day.fullDate ? 'border border-[#10499b] text-[#10499b] font-bold' : ''
          ]"
        >
          <span class="text-sm font-semibold relative z-10">{{ day.date }}</span>
          <div v-if="day.hasReport" class="absolute bottom-1 w-1.5 h-1.5 rounded-full" :class="selectedDate === day.fullDate ? 'bg-white' : 'bg-green-500'"></div>
        </button>
      </div>
    </div>

    <!-- DAFTAR LAPORAN HARIAN -->
    <div class="flex-1 overflow-y-auto px-5 pt-5 pb-24 relative bg-gray-50">

      <div class="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm py-2 z-10">
        <h3 class="font-bold text-gray-800 text-sm">
          Laporan: <span class="text-[#10499b]">{{ formatSelectedDate }}</span>
        </h3>
        <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">
          {{ reportsForSelectedDate.length }} Laporan
        </span>
      </div>

      <div v-if="reportsForSelectedDate.length > 0" class="space-y-3">
        <div
          v-for="item in reportsForSelectedDate"
          :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group"
        >
          <!-- Indikator Status Kiri -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="item.status === 'Telah Dikunjungi' ? 'bg-green-500' : 'bg-red-500'"></div>

          <div class="flex justify-between items-start mb-2">
            <div class="flex-1 min-w-0 pr-2">
              <h4 class="font-bold text-gray-800 text-sm truncate">{{ item.perusahaan }}</h4>
              <!-- Tampilkan nama petugas jika yang login adalah admin -->
              <p v-if="role === 'admin'" class="text-[10px] text-blue-600 font-bold mt-0.5 truncate flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">person</span> {{ item.petugas }}
              </p>
            </div>
            <span class="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 shrink-0 mt-0.5">
              {{ formatTime(item.timestamp) }}
            </span>
          </div>

          <p v-if="item.catatan" class="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg italic">"{{ item.catatan }}"</p>

          <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]" :class="item.status === 'Telah Dikunjungi' ? 'text-green-500' : 'text-red-500'">
                {{ item.status === 'Telah Dikunjungi' ? 'check_circle' : 'error' }}
              </span>
              <span class="text-[10px] font-bold" :class="item.status === 'Telah Dikunjungi' ? 'text-green-700' : 'text-red-700'">{{ item.status }}</span>
            </div>

            <div class="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-[9px] font-bold">
              <span class="material-symbols-outlined text-[12px]">my_location</span>
              Koordinat Disimpan
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-2">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
          <span class="material-symbols-outlined text-3xl">assignment</span>
        </div>
        <p class="text-gray-500 font-medium text-sm">Belum ada laporan</p>
        <p class="text-gray-400 text-xs mt-1">Belum ada riwayat pelaporan pada tanggal ini.</p>
      </div>

    </div>

    <!-- TOMBOL TAMBAH LAPORAN (Hanya untuk PETUGAS dan jika hari ini) -->
    <button
      v-if="role === 'petugas' && isToday(selectedDate)"
      @click="showModal = true"
      class="absolute bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add_location_alt</span>
    </button>

    <!-- TOMBOL INFO/REKAP LAPORAN (Hanya untuk ADMIN) -->
    <button
      v-if="role === 'admin'"
      @click="bukaAdminSummary"
      class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="text-3xl font-black mt-[-2px]">!</span>
    </button>

    <!-- MODAL REKAP ADMIN (Pop up List Petugas) -->
    <div v-if="showAdminSummaryModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showAdminSummaryModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-3xl shrink-0">
          <h3 class="text-lg font-bold text-blue-800 flex items-center gap-2">
            <span class="material-symbols-outlined">analytics</span> Rekap Laporan Bulanan
          </h3>
          <button @click="showAdminSummaryModal = false" class="text-blue-600 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <p class="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold border-b pb-2">
            Periode: {{ monthNames[currentMonth] }} {{ currentYear }}
          </p>

          <div class="space-y-3">
            <div v-if="adminSummaryStats.length === 0" class="text-center text-xs text-gray-400 py-4">
              Belum ada data petugas.
            </div>

            <div
              v-else
              v-for="(stat, index) in adminSummaryStats"
              :key="stat.id || index"
              class="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" :style="{ backgroundColor: stat.warna || '#10499b' }">
                  {{ stat.inisial }}
                </div>
                <span class="font-bold text-gray-700 text-sm">{{ stat.petugas }}</span>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="text-xs font-mono font-bold px-2 py-1.5 rounded-lg border"
                  :class="stat.reported >= stat.assigned && stat.assigned > 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-blue-700 bg-blue-50 border-blue-200'"
                >
                  {{ stat.reported }}/{{ stat.assigned }} Laporan
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL TAMBAH LAPORAN (Khusus Petugas) -->
    <div v-if="showModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50 rounded-t-3xl shrink-0">
          <h3 class="text-lg font-bold text-green-800 flex items-center gap-2">
            <span class="material-symbols-outlined">add_location_alt</span> Buat Laporan
          </h3>
          <button @click="showModal = false" class="text-green-600 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="kirimLaporan" class="space-y-4">

            <!-- Pilih Perusahaan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Pilih Lokasi Tujuan</label>
              <select v-model="formData.perusahaan" required class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white font-medium">
                <option value="" disabled>-- Pilih Perusahaan --</option>
                <option v-for="loc in assignedLocations" :key="loc.id" :value="loc.nama">{{ loc.nama }}</option>
              </select>
              <p v-if="assignedLocations.length === 0" class="text-[10px] text-red-500 mt-1">*Anda belum memiliki rute tugas perusahaan.</p>
            </div>

            <!-- Status Laporan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Status Kunjungan</label>
              <div class="grid grid-cols-2 gap-3">
                <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center" :class="formData.status === 'Telah Dikunjungi' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                  <input type="radio" v-model="formData.status" value="Telah Dikunjungi" class="hidden">
                  <span class="material-symbols-outlined">check_circle</span>
                  <span class="text-[10px]">Telah Dikunjungi</span>
                </label>
                <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center" :class="formData.status === 'Terjadi Masalah' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                  <input type="radio" v-model="formData.status" value="Terjadi Masalah" class="hidden">
                  <span class="material-symbols-outlined">error</span>
                  <span class="text-[10px]">Terjadi Masalah</span>
                </label>
              </div>
            </div>

            <!-- Catatan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Catatan Petugas (Opsional)</label>
              <textarea v-model="formData.catatan" rows="2" placeholder="Contoh: Bertemu dengan Bapak Budi bagian HRD..." class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"></textarea>
            </div>

            <!-- Tombol Laporkan (Mengambil GPS) -->
            <div class="pt-2">
              <button type="submit" :disabled="isLoadingGPS || !formData.perusahaan || !formData.status" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2">
                <span v-if="isLoadingGPS" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined text-[18px]">satellite_alt</span>
                {{ isLoadingGPS ? 'Mencari Kordinat GPS...' : 'Kirim Laporan (Auto GPS)' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLaporanStore } from '../stores/laporan'
import { useRuteStore } from '../stores/rute'
import { Geolocation } from '@capacitor/geolocation' // IMPORT PLUGIN NATIVE CAPACITOR

const router = useRouter()
const laporanStore = useLaporanStore()
const ruteStore = useRuteStore()

const currentUser = localStorage.getItem('nama') || 'PENGGUNA'
const role = localStorage.getItem('role') || 'petugas'

onMounted(() => {
  laporanStore.subscribeLaporan() // Aktifkan pendengar Real-time Laporan
  ruteStore.loadLokasi() // Load lokasi perusahaan untuk form pilihan & rekap
  ruteStore.loadPetugas() // Load data petugas untuk rekap di akun admin
})

onUnmounted(() => {
  laporanStore.unsubscribeLaporan() // Matikan pendengar saat pindah halaman
})

// Dapatkan lokasi/perusahaan yang di-assign ke user ini (Hanya relevan bagi Petugas)
const assignedLocations = computed(() => {
  return ruteStore.lokasiList.filter(l => l.petugas === currentUser)
})

// === LOGIKA KALENDER ===
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const formatDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const selectedDate = ref(formatDateStr(today))

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())
const daysInMonth = computed(() => {
  const count = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= count; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    // Admin melihat indikator laporan siapa saja, petugas hanya melihat miliknya
    const hasReport = role === 'admin'
      ? laporanStore.laporanList.some(r => r.date === fullDate)
      : laporanStore.laporanList.some(r => r.date === fullDate && r.petugas === currentUser)

    days.push({ date: i, fullDate, hasReport })
  }
  return days
})

function nextMonth() { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else { currentMonth.value++ } }
function prevMonth() { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else { currentMonth.value-- } }
function selectDate(dateStr) { selectedDate.value = dateStr }
function isToday(dateStr) { return dateStr === formatDateStr(new Date()) }

// Format waktu untuk list laporan
function formatTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatSelectedDate = computed(() => {
  const parts = selectedDate.value.split('-')
  return `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`
})

// === LOGIKA FILTER DAFTAR LAPORAN ===
const reportsForSelectedDate = computed(() => {
  // Jika admin, tampilkan laporan milik semua orang pada tanggal yang dipilih
  if (role === 'admin') {
    return laporanStore.laporanList.filter(r => r.date === selectedDate.value)
  }
  // Jika petugas, hanya tampilkan miliknya
  return laporanStore.laporanList.filter(r => r.date === selectedDate.value && r.petugas === currentUser)
})

// === LOGIKA MODAL REKAP ADMIN (Tanda !) ===
const showAdminSummaryModal = ref(false)

function bukaAdminSummary() {
  showAdminSummaryModal.value = true;
}

const adminSummaryStats = computed(() => {
  // Mengambil bulan dan tahun yang sedang dilihat di kalender format "YYYY-MM"
  const currentMonthStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`;

  return ruteStore.petugasList.map(p => {
    // Proteksi jika nama petugas kosong/undefined
    const namaPetugas = p.nama || 'Tanpa Nama'
    const inisial = namaPetugas !== 'Tanpa Nama' ? namaPetugas.charAt(0).toUpperCase() : '?'

    // 1. Total Lokasi yang Ditugaskan kepadanya
    const assigned = ruteStore.lokasiList.filter(l => l.petugas === namaPetugas).length;

    // 2. Total Laporan yang sudah dia kerjakan di BULAN tersebut
    const reported = laporanStore.laporanList.filter(r =>
      r.petugas === namaPetugas && r.date && r.date.startsWith(currentMonthStr)
    ).length;

    return {
      id: p.id,
      petugas: namaPetugas,
      inisial: inisial,
      warna: p.warna,
      assigned,
      reported
    }
  })
})

// === LOGIKA MODAL & SUBMIT LAPORAN DENGAN CAPACITOR GEOLOCATION ===
const showModal = ref(false)
const isLoadingGPS = ref(false)
const formData = ref({
  perusahaan: '',
  status: 'Telah Dikunjungi',
  catatan: ''
})

async function prosesPengirimanLaporan(lat, lng) {
  const payload = {
    perusahaan: formData.value.perusahaan,
    status: formData.value.status,
    catatan: formData.value.catatan,
    petugas: currentUser,
    date: selectedDate.value,
    lat: lat,
    lng: lng
  }

  await laporanStore.saveLaporan(payload)

  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Laporan dan Lokasi berhasil dikirim!', type: 'success' } }))

  isLoadingGPS.value = false
  showModal.value = false

  // Reset form
  formData.value = { perusahaan: '', status: 'Telah Dikunjungi', catatan: '' }
}

async function kirimLaporan() {
  isLoadingGPS.value = true

  try {
    // 1. Cek & Minta Izin Lokasi di Android
    const checkPerm = await Geolocation.checkPermissions()
    if (checkPerm.location !== 'granted') {
      const requestPerm = await Geolocation.requestPermissions()
      if (requestPerm.location !== 'granted') {
        throw new Error("Izin akses lokasi ditolak oleh pengguna.")
      }
    }

    // 2. Ambil Kordinat Secara Native
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    })

    // 3. Kirim ke Database
    await prosesPengirimanLaporan(position.coords.latitude, position.coords.longitude)

  } catch (error) {
    console.warn("Error GPS Capacitor:", error)

    // Fallback Darurat jika gagal ambil lokasi
    const gunakanFallback = confirm(
      `Gagal mengambil GPS: ${error.message}\n\nPastikan GPS di HP menyala.\n\nApakah Anda ingin melanjutkan pengiriman dengan koordinat simulasi (Default Samsat Bekasi)?`
    )

    if (gunakanFallback) {
      await prosesPengirimanLaporan(-6.2700806, 107.1481756)
    } else {
      isLoadingGPS.value = false
    }
  }
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
</style>
