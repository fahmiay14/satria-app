<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button @click="router.push('/rute')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Data Rute & Lokasi</h1>
    </div>

    <!-- PENCARIAN & INFO -->
    <div class="px-5 pt-5 pb-2 shrink-0">

      <!-- TAB KATEGORI (Perusahaan vs Pribadi) -->
      <div class="flex bg-gray-200/80 p-1.5 rounded-xl mb-4">
        <button
          @click="activeTab = 'Perusahaan'"
          class="flex-1 py-2 text-[11px] font-bold rounded-lg transition uppercase tracking-wide flex justify-center items-center gap-1.5"
          :class="activeTab === 'Perusahaan' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="material-symbols-outlined text-[16px]">domain</span> Perusahaan
        </button>
        <button
          @click="activeTab = 'Pribadi'"
          class="flex-1 py-2 text-[11px] font-bold rounded-lg transition uppercase tracking-wide flex justify-center items-center gap-1.5"
          :class="activeTab === 'Pribadi' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="material-symbols-outlined text-[16px]">person_pin_circle</span> Pribadi
        </button>
      </div>

      <div class="relative mb-4">
        <span class="material-symbols-outlined absolute left-4 top-2.5 text-gray-400 pointer-events-none">search</span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="`Cari nama ${activeTab.toLowerCase()} atau petugas...`"
          class="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
      </div>

      <!-- Tombol Aksi Import & Export -->
      <div class="flex justify-between items-center mb-1">
        <div class="text-xs font-bold text-gray-600 px-1">
          <span>Total {{ activeTab }}: <span class="text-blue-600">{{ filteredLokasi.length }}</span></span>
        </div>

        <!-- Disembunyikan khusus untuk role Petugas -->
        <div v-if="role === 'admin'" class="flex gap-2">
          <!-- Input File Tersembunyi untuk Import -->
          <input type="file" ref="fileInput" @change="handleImportCSV" accept=".csv" class="hidden" />

          <button @click="triggerImport" class="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[14px]">upload_file</span> Import
          </button>

          <button @click="exportCSV" class="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[14px]">download</span> Export
          </button>
        </div>
      </div>
    </div>

    <!-- DAFTAR LOKASI (SCROLLABLE) -->
    <div class="flex-1 overflow-y-auto px-5 pb-24 pt-2 relative">

      <!-- Loading Overlay -->
      <div v-if="store.loading || isImporting" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center pt-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">{{ isImporting ? 'Sedang mengimpor data...' : 'Memuat data lokasi...' }}</p>
      </div>

      <div v-else-if="filteredLokasi.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center mt-4">
        <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">location_off</span>
        <p class="text-gray-500 font-medium text-sm">Tidak ada data rute {{ activeTab }}</p>
        <p v-if="role === 'admin'" class="text-gray-400 text-xs mt-1">Gunakan tombol + untuk menambahkan lokasi.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in filteredLokasi" :key="item.id"
          class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition relative group"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0 pr-4">
              <h3 class="font-bold text-gray-800 text-sm truncate">{{ item.nama }}</h3>

              <div class="flex items-center gap-1.5 mt-1.5 text-gray-500">
                <span class="material-symbols-outlined text-[14px]">map</span>
                <p class="text-[11px] truncate font-mono">{{ item.lat }}, {{ item.lng }}</p>
              </div>

              <div class="flex items-center gap-1.5 mt-1 text-gray-500">
                <span class="material-symbols-outlined text-[14px]">person</span>
                <p class="text-[11px] truncate font-medium" :class="item.petugas ? 'text-blue-600' : 'text-orange-500 italic'">
                  {{ item.petugas || 'Belum ditugaskan' }}
                </p>
              </div>
            </div>

            <!-- Tombol Aksi (Edit & Hapus) Disembunyikan khusus untuk role Petugas -->
            <div v-if="role === 'admin'" class="flex flex-col gap-1.5 shrink-0">
              <button @click="openEdit(item)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition active:scale-95">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button @click="hapusLokasi(item)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition active:scale-95">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB (Floating Action Button) Tambah (Hanya Admin) -->
    <button
      v-if="role === 'admin'"
      @click="openTambah"
      class="absolute bottom-6 right-6 w-14 h-14 bg-[#10499b] hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- MODAL FORM LOKASI -->
    <div v-if="showModal" class="absolute inset-0 z-50 bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="closeModal">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">{{ isEdit ? 'Edit Lokasi' : 'Tambah Lokasi Rute' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="simpanLokasi" class="space-y-4">

            <!-- Hidden Input for Kategori -->
            <input type="hidden" v-model="formData.kategori">

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Nama Lokasi ({{ formData.kategori }})</label>
              <input v-model="formData.nama" type="text" required placeholder="Contoh: PT. Maju Bersama" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                <input v-model="formData.lat" type="number" step="any" required placeholder="-6.2345" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                <input v-model="formData.lng" type="number" step="any" required placeholder="107.1234" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Pilih Petugas (Opsional)</label>
              <select v-model="formData.petugas" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                <option value="">-- Belum Ditugaskan --</option>
                <option v-for="petugas in store.petugasList" :key="petugas.id" :value="petugas.nama">
                  {{ petugas.nama }}
                </option>
              </select>
            </div>

            <div class="pt-4">
              <button type="submit" class="w-full bg-[#10499b] text-white font-bold py-3 rounded-xl shadow transition active:scale-95 text-sm">
                Simpan Lokasi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'

const router = useRouter()
const store = useRuteStore()
const role = localStorage.getItem('role') || 'petugas'

// State
const activeTab = ref('Perusahaan') // Default Tab
const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({ id: null, nama: '', lat: '', lng: '', petugas: '', kategori: 'Perusahaan' })
const isImporting = ref(false)
const fileInput = ref(null)

// Load Data
onMounted(() => {
  store.loadLokasi()
  store.loadPetugas()
})

// Filter Data berdasarkan Tab (Kategori) dan Pencarian
const filteredLokasi = computed(() => {
  const query = searchQuery.value.toLowerCase()

  return store.lokasiList.filter(item => {
    // Tentukan kategori default jika data lama tidak punya atribut kategori
    const kat = item.kategori || 'Perusahaan'

    // Filter berdasarkan tab yang aktif
    if (kat !== activeTab.value) return false

    // Filter berdasarkan teks pencarian
    return item.nama.toLowerCase().includes(query) ||
          (item.petugas && item.petugas.toLowerCase().includes(query))
  })
})

// === LOGIKA CRUD ===
function openTambah() {
  isEdit.value = false
  // Set kategori form otomatis menyesuaikan tab yang sedang dibuka
  formData.value = { id: null, nama: '', lat: '', lng: '', petugas: '', kategori: activeTab.value }
  showModal.value = true
}

function openEdit(item) {
  isEdit.value = true
  formData.value = { ...item, kategori: item.kategori || 'Perusahaan' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function simpanLokasi() {
  await store.saveLokasi(formData.value)
  closeModal()
}

async function hapusLokasi(item) {
  if(confirm(`Yakin ingin menghapus ${item.nama}?`)) {
    await store.deleteLokasi(item.id)
  }
}

// === LOGIKA EXPORT & IMPORT CSV ===
function triggerImport() {
  fileInput.value.click()
}

function parseCSV(str) {
  const arr = []
  let quote = false
  let col = -1, row = 0

  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c+1]
    arr[row] = arr[row] || []
    arr[row][col = col === -1 ? 0 : col] = arr[row][col] || ''

    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = -1; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = -1; continue; }
    if (cc === '\r' && !quote) { ++row; col = -1; continue; }

    arr[row][col] += cc
  }
  return arr
}

async function handleImportCSV(event) {
  const file = event.target.files[0]
  if (!file) return

  isImporting.value = true

  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const rows = parseCSV(text)

    let importedCount = 0

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length < 3) continue

      const nama = row[1] ? row[1].trim() : ''
      const koordinatRaw = row[2] ? row[2].trim() : ''
      const petugas = row[3] ? row[3].trim() : ''

      if (!nama || !koordinatRaw) continue

      const coords = koordinatRaw.split(',')
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0].trim())
        const lng = parseFloat(coords[1].trim())

        if (!isNaN(lat) && !isNaN(lng)) {
          // Import otomatis mengikuti tab yang sedang dibuka
          await store.saveLokasi({
            nama: nama,
            lat: lat,
            lng: lng,
            petugas: petugas,
            kategori: activeTab.value
          })
          importedCount++
        }
      }
    }

    isImporting.value = false
    alert(`Berhasil mengimpor ${importedCount} lokasi ke kategori ${activeTab.value}!`)
    event.target.value = ''
  }

  reader.onerror = () => {
    alert("Gagal membaca file CSV.")
    isImporting.value = false
  }

  reader.readAsText(file)
}

function exportCSV() {
  const data = filteredLokasi.value // Hanya mengeskpor tab yang sedang dilihat
  if (data.length === 0) return alert(`Tidak ada data ${activeTab.value} untuk diekspor.`)

  let csvContent = "ID,Nama Perusahaan,Koordinat,Petugas\n"

  data.forEach((loc, index) => {
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return ''
      const stringified = String(str)
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`
      }
      return stringified
    }

    const id = index + 1
    const nama = escapeCSV(loc.nama)
    const koordinat = `"${loc.lat},${loc.lng}"`
    const petugas = escapeCSV(loc.petugas || '')

    csvContent += `${id},${nama},${koordinat},${petugas}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `Data_Rute_${activeTab.value}_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)

  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
</style>
