<template>
  <!-- h-[100dvh] memastikan tinggi layar pas 100%, mencegah body scrolling -->
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- ========================================= -->
    <!-- HEADER AREA (FIXED)                       -->
    <!-- ========================================= -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/dashboard')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-semibold tracking-wide">Jadwal Penugasan</h1>
    </div>

    <!-- ========================================= -->
    <!-- KALENDER CARD (FIXED)                     -->
    <!-- ========================================= -->
    <div class="bg-white rounded-b-3xl shadow-sm px-5 pt-4 pb-4 shrink-0 z-10 relative">

      <!-- Navigasi & Filter Bulan/Tahun -->
      <div class="flex justify-between items-center mb-4">
        <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition active:scale-95">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <!-- Dropdown Filter Bulan & Tahun -->
        <div class="flex gap-2">
          <div class="relative">
            <select
              v-model="currentMonth"
              class="appearance-none bg-blue-50 text-[#10499b] font-bold text-sm py-1.5 pl-3 pr-7 rounded-lg border-none focus:ring-2 focus:ring-[#10499b] cursor-pointer"
            >
              <option v-for="(month, index) in monthNames" :key="month" :value="index">
                {{ month }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-1.5 top-1.5 text-[#10499b] pointer-events-none text-lg">arrow_drop_down</span>
          </div>

          <div class="relative">
            <select
              v-model="currentYear"
              class="appearance-none bg-blue-50 text-[#10499b] font-bold text-sm py-1.5 pl-3 pr-7 rounded-lg border-none focus:ring-2 focus:ring-[#10499b] cursor-pointer"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-1.5 top-1.5 text-[#10499b] pointer-events-none text-lg">arrow_drop_down</span>
          </div>
        </div>

        <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition active:scale-95">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <!-- Hari dalam Seminggu -->
      <div class="grid grid-cols-7 gap-1 mb-1 text-center">
        <span v-for="day in dayNames" :key="day" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {{ day }}
        </span>
      </div>

      <!-- Grid Tanggal -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Slot Kosong untuk awal bulan -->
        <div v-for="blank in firstDayOfMonth" :key="'blank-' + blank" class="aspect-[4/3]"></div>

        <!-- Tanggal Kalender -->
        <button
          v-for="day in daysInMonth"
          :key="day.date"
          @click="selectDate(day.fullDate)"
          class="aspect-[4/3] flex flex-col items-center justify-center relative rounded-xl transition-all duration-200"
          :class="[
            selectedDate === day.fullDate
              ? 'bg-[#10499b] text-white shadow-md transform scale-105'
              : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100',
            isToday(day.fullDate) && selectedDate !== day.fullDate ? 'border border-[#10499b] text-[#10499b] font-bold' : ''
          ]"
        >
          <span class="text-sm font-semibold relative z-10">{{ day.date }}</span>

          <!-- Indikator Jadwal (Ikon/Dot) -->
          <div v-if="day.hasSchedule" class="absolute bottom-1 flex gap-0.5">
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="selectedDate === day.fullDate ? 'bg-white' : 'bg-orange-500'"
            ></span>
          </div>
        </button>
      </div>
    </div>

    <!-- ========================================= -->
    <!-- DAFTAR JADWAL HARIAN (SCROLLABLE AREA)    -->
    <!-- ========================================= -->
    <div class="flex-1 flex flex-col overflow-hidden min-h-0 relative bg-gray-50">

      <!-- Gradient shadow untuk transisi mulus dari kalender ke daftar -->
      <div class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent z-10 pointer-events-none"></div>

      <!-- Area Scroll Daftar Kegiatan -->
      <div class="flex-1 overflow-y-auto px-5 pt-5 pb-24">

        <div class="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/90 backdrop-blur-sm py-2 z-10">
          <h3 class="font-bold text-gray-800 text-sm">
            Jadwal: <span class="text-[#10499b]">{{ formatSelectedDate }}</span>
          </h3>
          <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">
            {{ schedulesForSelectedDate.length }} Kegiatan
          </span>
        </div>

        <!-- Jika Ada Jadwal -->
        <div v-if="schedulesForSelectedDate.length > 0" class="space-y-3">
          <div
            v-for="item in schedulesForSelectedDate"
            :key="item.id"
            class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center relative overflow-hidden transition hover:shadow-md"
          >
            <!-- Garis warna kiri -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="item.type === 'lapangan' ? 'bg-orange-500' : 'bg-green-500'"></div>

            <div class="flex flex-col items-center justify-center shrink-0 w-12 border-r border-gray-100 pr-3">
              <span class="text-lg font-black text-gray-800">{{ item.time.split(':')[0] }}</span>
              <span class="text-[10px] font-bold text-gray-400 -mt-1">{{ item.time.split(':')[1] }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-800 text-sm leading-tight truncate">{{ item.title }}</h4>
              <div class="flex items-center gap-1 mt-1 text-gray-500">
                <span class="material-symbols-outlined text-[12px]">location_on</span>
                <p class="text-[11px] font-medium truncate">{{ item.location }}</p>
              </div>
            </div>

            <!-- Tombol Aksi Admin -->
            <div v-if="role === 'admin'" class="flex flex-col gap-1 shrink-0 ml-1">
              <button @click="openEdit(item)" class="bg-blue-50 text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition active:scale-90">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button @click="siapkanHapus(item)" class="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition active:scale-90">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
            <!-- Ikon Biasa untuk Petugas -->
            <div v-else class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="item.type === 'lapangan' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'">
              <span class="material-symbols-outlined text-[16px]">
                {{ item.type === 'lapangan' ? 'two_wheeler' : 'groups' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Jika Kosong -->
        <div v-else class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-2">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
            <span class="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <p class="text-gray-500 font-medium text-sm">Tidak ada jadwal</p>
          <p class="text-gray-400 text-xs mt-1">Belum ada penugasan di tanggal ini.</p>
        </div>

      </div>
    </div>

    <!-- FLOATING ACTION BUTTON (Khusus Admin) -->
    <button
      v-if="role === 'admin'"
      @click="openTambah"
      class="absolute bottom-6 right-6 w-14 h-14 bg-[#10499b] hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- Modals -->
    <JadwalModal v-model="showModal" :editData="editData" :selectedDate="selectedDate" @save="simpanJadwal" />
    <DeleteModal v-model="showDelete" :label="deleteLabel" @confirm="eksekusiHapus" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJadwalStore } from '../stores/jadwal'
import JadwalModal from '../components/JadwalModal.vue'
import DeleteModal from '../components/DeleteModal.vue'

const router = useRouter()
const store = useJadwalStore()
const role = localStorage.getItem('role') || 'petugas'

onMounted(() => {
  store.loadJadwal() // Panggil data asli dari Firebase
})

// === SETUP KALENDER ===
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

// Membuat opsi tahun (5 tahun ke belakang, 5 tahun ke depan)
const yearOptions = computed(() => {
  const currentY = new Date().getFullYear()
  const years = []
  for (let i = currentY - 5; i <= currentY + 5; i++) {
    years.push(i)
  }
  return years
})

const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const selectedDate = ref(formatDateStr(today))
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())
const daysInMonth = computed(() => {
  const count = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []

  for (let i = 1; i <= count; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    // Cek dengan data asli dari database
    const hasSchedule = store.jadwalList.some(s => s.date === fullDate)

    days.push({ date: i, fullDate, hasSchedule })
  }
  return days
})

// Update selected date saat bulan/tahun diubah lewat dropdown agar kalender merefresh fokusnya
watch([currentMonth, currentYear], ([newMonth, newYear]) => {
  // Coba cek apakah bulan dan tahun sama dengan hari ini
  if (newMonth === today.getMonth() && newYear === today.getFullYear()) {
     selectedDate.value = formatDateStr(today)
  } else {
     // Jika tidak, pilih tanggal 1 di bulan yang dipilih
     selectedDate.value = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-01`
  }
})

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else { currentMonth.value++ }
}
function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else { currentMonth.value-- }
}
function selectDate(dateStr) { selectedDate.value = dateStr }
function isToday(dateStr) { return dateStr === formatDateStr(new Date()) }

// Data Harian yang Ditampilkan
const schedulesForSelectedDate = computed(() => {
  return store.jadwalList
    .filter(s => s.date === selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

const formatSelectedDate = computed(() => {
  const parts = selectedDate.value.split('-')
  return `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`
})

// === LOGIKA CRUD ADMIN ===
const showModal = ref(false)
const editData = ref(null)
const showDelete = ref(false)
const deleteId = ref(null)
const deleteLabel = ref('')

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
}

function openTambah() {
  editData.value = null
  showModal.value = true
}

function openEdit(item) {
  editData.value = item
  showModal.value = true
}

async function simpanJadwal(data) {
  const isEdit = !!editData.value
  await store.saveJadwal(data)
  showToast(isEdit ? 'Jadwal berhasil diubah!' : 'Jadwal baru ditambahkan!')
}

function siapkanHapus(item) {
  deleteId.value = item.id
  deleteLabel.value = `Kegiatan: ${item.title}`
  showDelete.value = true
}

async function eksekusiHapus() {
  await store.deleteJadwal(deleteId.value)
  showToast('Jadwal berhasil dihapus!')
}
</script>
