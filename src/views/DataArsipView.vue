<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/arsip-menu')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Data Arsip</h1>
    </div>

    <!-- PENCARIAN & INFO -->
    <div class="px-5 pt-5 pb-2 shrink-0">
      <div class="relative mb-4">
        <span class="material-symbols-outlined absolute left-4 top-2.5 text-gray-400 pointer-events-none">search</span>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Cari No Polisi Kendaraan..."
          class="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
      </div>

      <!-- Tombol Aksi Import & Export & Info Arsip -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-3">
        <div class="flex gap-3 text-[11px] font-bold text-gray-600 px-1">
          <span>Total: <span class="text-blue-600">{{ store.totalArsip }}</span></span>
          <span class="text-gray-300">|</span>
          <span>Tersedia: <span class="text-green-600">{{ store.arsipTersedia }}</span></span>
          <span class="text-gray-300">|</span>
          <span>Dipinjam: <span class="text-amber-600">{{ store.arsipDipinjam }}</span></span>
        </div>

        <div class="flex gap-2">
          <input type="file" ref="fileInput" @change="importExcel" accept=".xlsx,.xls" class="hidden" />
          <button @click="triggerFileInput" class="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[16px]">upload_file</span> Import
          </button>
          <button @click="exportExcel" class="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[16px]">download</span> Export
          </button>
        </div>
      </div>
    </div>

    <!-- DAFTAR ARSIP -->
    <div class="flex-1 overflow-y-auto px-5 pb-24 pt-2 relative" id="scroll-container" @scroll="handleScroll">

      <!-- Loading -->
      <div v-if="store.loading" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center pt-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">Memproses data arsip...</p>
      </div>

      <div v-else-if="filteredArsip.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center mt-4">
        <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">inventory_2</span>
        <p class="text-gray-500 font-medium text-sm">Tidak ada data arsip</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in displayedArsip" :key="item.id"
          class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition relative group"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0 pr-4">
              <!-- Nopol -->
              <h3 class="font-black text-[#10499b] text-base truncate tracking-wide">{{ item.no_polisi }}</h3>

              <!-- Nomor Surat -->
              <div class="flex items-center gap-1.5 mt-1 text-gray-500">
                <span class="material-symbols-outlined text-[14px]">tag</span>
                <p class="text-xs font-medium truncate">No. Surat: {{ item.no_surat }}</p>
              </div>

              <!-- Badge Status -->
              <div class="mt-2.5">
                <span
                  class="text-[10px] px-2 py-1 rounded-md font-bold uppercase shadow-sm border"
                  :class="item.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'"
                >
                  {{ item.status }}
                </span>
                <span v-if="item.nama_box" class="ml-2 text-[10px] text-gray-400 font-medium">Box: {{ item.nama_box }}</span>
              </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="flex flex-col gap-1.5 shrink-0">
              <button @click="openEdit(item)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition active:scale-95">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button @click="siapkanHapus(item)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition active:scale-95">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="renderLimit < filteredArsip.length" class="p-4 text-center text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl animate-pulse">
          Memuat data lainnya... ({{ renderLimit }} / {{ filteredArsip.length }})
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      @click="openTambah"
      class="absolute bottom-6 right-6 w-14 h-14 bg-[#10499b] hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- Modals -->
    <ArsipModal v-model="showModal" :editData="editData" @save="simpan" />
    <DeleteModal v-model="showDelete" :label="deleteLabel" @confirm="eksekusiHapus" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useArsipStore } from '../stores/arsip'
import ArsipModal from '../components/ArsipModal.vue'
import DeleteModal from '../components/DeleteModal.vue'

const router = useRouter()
const store = useArsipStore()

const showModal = ref(false)
const editData = ref(null)
const showDelete = ref(false)
const deleteId = ref(null)
const deleteLabel = ref('')
const fileInput = ref(null)

const searchKeyword = ref('')
const renderLimit = ref(100)

onMounted(() => {
  store.loadArsip()
})

const filteredArsip = computed(() => {
  let data = store.arsipList
  if (searchKeyword.value) {
    const key = searchKeyword.value.trim().toUpperCase()
    data = data.filter(item => item.no_polisi.toUpperCase().includes(key))
  }
  return data
})

const displayedArsip = computed(() => {
  return filteredArsip.value.slice(0, renderLimit.value)
})

watch(searchKeyword, () => {
  renderLimit.value = 100
  const container = document.getElementById('scroll-container')
  if (container) container.scrollTo({ top: 0 })
})

let isScrolling = false
function handleScroll(e) {
  if (isScrolling) return
  const { scrollTop, clientHeight, scrollHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (renderLimit.value < filteredArsip.value.length) {
      isScrolling = true
      requestAnimationFrame(() => {
        renderLimit.value += 20
        setTimeout(() => { isScrolling = false }, 50)
      })
    }
  }
}

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
}

function openTambah() {
  editData.value = null
  showModal.value = true
}

function openEdit(data) {
  editData.value = data
  showModal.value = true
}

async function simpan(data) {
  const isEdit = !!editData.value
  await store.saveArsip(data)
  showToast(isEdit ? 'Data arsip berhasil diubah!' : 'Data arsip berhasil ditambahkan!')
  if (!isEdit) {
    searchKeyword.value = ''
    document.getElementById('scroll-container').scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function siapkanHapus(item) {
  deleteId.value = item.id
  deleteLabel.value = `Arsip No. ${item.no_surat} (${item.no_polisi})`
  showDelete.value = true
}

async function eksekusiHapus() {
  await store.deleteArsip(deleteId.value)
  showToast('Data berhasil dihapus!')
}

// === EXPORT KE EXCEL (.xlsx) ===
// Logic pembuatan file (styling, lebar kolom, dst) ada di store supaya
// hasilnya identik dengan yang di-export dari desktop admin.
async function exportExcel() {
  try {
    await store.exportArsipToExcel()
    showToast('File Excel sedang diunduh', 'info')
  } catch (err) {
    showToast(err.message || 'Gagal mengekspor data', 'error')
  }
}

function triggerFileInput() { fileInput.value.click() }

// === IMPORT DARI EXCEL (.xlsx / .xls) ===
// Hanya mengambil kolom A (Nomor Surat) & kolom B (No Polisi), baris 1
// dianggap header. Validasi & penulisan ke Firestore ditangani store
// (importArsipFromExcel) supaya perilakunya sama persis dengan desktop admin.
async function importExcel(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const result = await store.importArsipFromExcel(file)
    if (result.errors.length > 0) {
      console.warn('Baris yang dilewati saat import:\n' + result.errors.join('\n'))
      showToast(`${result.imported} data berhasil diimpor, ${result.errors.length} baris dilewati (detail di console)`, 'info')
    } else {
      showToast(`${result.imported} data berhasil diimpor!`)
    }
  } catch (err) {
    console.error(err)
    if (err.details && err.details.length > 0) {
      console.warn('Detail baris ditolak:\n' + err.details.join('\n'))
    }
    showToast(err.message || 'Terjadi error saat mengimpor Excel', 'error')
  } finally {
    event.target.value = ''
  }
}
</script>
