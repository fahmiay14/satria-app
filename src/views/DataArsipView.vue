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
          placeholder="Cari Nopol Kendaraan..."
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
          <!-- Input File Tersembunyi untuk Import -->
          <input type="file" ref="fileInput" @change="importCSV" accept=".csv" class="hidden" />

          <button @click="triggerFileInput" class="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[16px]">upload_file</span> Import
          </button>

          <button @click="exportCSV" class="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-bold active:scale-95">
            <span class="material-symbols-outlined text-[16px]">download</span> Export
          </button>
        </div>
      </div>
    </div>

    <!-- DAFTAR ARSIP (SCROLLABLE AREA) -->
    <div class="flex-1 overflow-y-auto px-5 pb-24 pt-2 relative" id="scroll-container" @scroll="handleScroll">

      <!-- Loading Overlay -->
      <div v-if="store.loading" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center pt-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">Memproses data arsip...</p>
      </div>

      <div v-else-if="filteredArsip.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center mt-4">
        <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">inventory_2</span>
        <p class="text-gray-500 font-medium text-sm">Tidak ada data arsip</p>
        <p class="text-gray-400 text-xs mt-1">Gunakan tombol + atau Import untuk menambahkan arsip.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in displayedArsip" :key="item.id"
          class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition relative group"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0 pr-4">
              <!-- Nopol (Title) -->
              <h3 class="font-black text-[#10499b] text-base truncate tracking-wide">{{ item.nopol }}</h3>

              <!-- Nomor Surat -->
              <div class="flex items-center gap-1.5 mt-1 text-gray-500">
                <span class="material-symbols-outlined text-[14px]">tag</span>
                <p class="text-xs font-medium truncate">No. Surat: {{ item.noSurat }}</p>
              </div>

              <!-- Badge Status -->
              <div class="mt-2.5">
                <span
                  class="text-[10px] px-2 py-1 rounded-md font-bold uppercase shadow-sm border"
                  :class="item.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>

            <!-- Tombol Aksi (Edit & Hapus) -->
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

        <!-- Loading Paginasi / Infinite Scroll -->
        <div v-if="renderLimit < filteredArsip.length" class="p-4 text-center text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl animate-pulse">
          Memuat data lainnya... ({{ renderLimit }} / {{ filteredArsip.length }})
        </div>
      </div>
    </div>

    <!-- FAB (Floating Action Button) Tambah -->
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
import { db } from '../services/firebase'
import { writeBatch, doc } from 'firebase/firestore'

const router = useRouter()
const store = useArsipStore()

const showModal = ref(false)
const editData = ref(null)
const showDelete = ref(false)
const deleteId = ref(null)
const deleteLabel = ref('')
const fileInput = ref(null)

// === FITUR SEARCH & PAGINATION ===
const searchKeyword = ref('')
const renderLimit = ref(100) // Tampil awal 100 data

onMounted(() => {
  store.loadArsip()
})

// Menyaring data berdasarkan Nopol
const filteredArsip = computed(() => {
  let data = store.arsipList
  if (searchKeyword.value) {
    const key = searchKeyword.value.trim().toUpperCase()
    data = data.filter(item => item.nopol.toUpperCase().includes(key))
  }
  return data
})

// Membatasi jumlah render untuk performa
const displayedArsip = computed(() => {
  return filteredArsip.value.slice(0, renderLimit.value)
})

// Mengatur reset paginasi saat sedang mencari
watch(searchKeyword, () => {
  renderLimit.value = 100
  // Otomatis kembalikan scroll ke atas saat mengetik pencarian
  const container = document.getElementById('scroll-container')
  if (container) container.scrollTo({ top: 0 })
})

// === LOGIKA INFINITE SCROLL ===
let isScrolling = false
function handleScroll(e) {
  if (isScrolling) return

  const { scrollTop, clientHeight, scrollHeight } = e.target

  // Jika tersisa 50px jarak menuju paling bawah kontainer
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (renderLimit.value < filteredArsip.value.length) {
      isScrolling = true

      requestAnimationFrame(() => {
        renderLimit.value += 20 // Tambah 20 data selanjutnya sesuai instruksi

        setTimeout(() => {
          isScrolling = false
        }, 50)
      })
    }
  }
}

// === FUNGSI TOAST ===
function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
}

// === LOGIKA CRUD ===
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
  deleteLabel.value = `Arsip No. ${item.noSurat} (${item.nopol})`
  showDelete.value = true
}

async function eksekusiHapus() {
  await store.deleteArsip(deleteId.value)
  showToast('Data berhasil dihapus!')
}

// === LOGIKA EXPORT & IMPORT ===
function exportCSV() {
  if (store.arsipList.length === 0) return alert("Tidak ada data untuk diekspor")
  let csvContent = "Nomor Surat,Nopol,Status\n"
  store.arsipList.forEach(row => { csvContent += `"${row.noSurat}","${row.nopol}","${row.status}"\n` })
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.setAttribute("href", URL.createObjectURL(blob))
  link.setAttribute("download", `Data_Arsip_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showToast('Data CSV sedang diunduh', 'info')
}

function triggerFileInput() { fileInput.value.click() }

async function importCSV(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const rows = text.split(/\r?\n/).map(row => row.trim()).filter(row => row.length > 0)
    if (rows.length < 2) return showToast("File CSV kosong atau tidak valid", "error")
    store.loading = true
    try {
      let batch = writeBatch(db)
      let count = 0
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(col => col.replace(/(^"|"$)/g, '').trim())
        if (cols.length >= 2) {
          const id = "ARSIP-IMP-" + Date.now() + "-" + i
          const docRef = doc(db, 'artifacts', 'SatriaApp', 'public', 'data', 'arsip', id)
          batch.set(docRef, { noSurat: cols[0], nopol: cols[1].toUpperCase(), status: cols[2] || 'Tersedia' })
          count++
          if (count === 500) { await batch.commit(); batch = writeBatch(db); count = 0 }
        }
      }
      if (count > 0) await batch.commit()
      await store.loadArsip()
      showToast(`${rows.length - 1} data berhasil diimpor!`)
    } catch(err) {
      console.error(err)
      showToast("Terjadi error saat mengimpor CSV", "error")
    } finally {
      store.loading = false
      event.target.value = ''
    }
  }
  reader.readAsText(file)
}
</script>
