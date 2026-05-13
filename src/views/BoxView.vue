<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
    <!-- Header -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button
        @click="router.push('/arsip-menu')"
        class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>

      <h1 class="text-lg font-medium">Data Box</h1>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-50">

      <!-- Info Header -->
      <div class="px-5 pt-5 pb-2 shrink-0">
        <div class="flex justify-between items-center text-[11px] font-bold text-gray-600 px-1 mb-2">
          <span>Total Box: <span class="text-blue-600">{{ store.boxList.length }}</span></span>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="store.loading" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center pt-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">Memproses data box...</p>
      </div>

      <!-- Scrollable Content (Cards) -->
      <div v-else class="flex-1 overflow-y-auto px-5 pb-24 pt-2">

        <!-- State Kosong -->
        <div v-if="store.boxList.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center mt-4">
          <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">inventory_2</span>
          <p class="text-gray-500 font-medium text-sm">Tidak ada data box</p>
          <p class="text-gray-400 text-xs mt-1">Gunakan tombol + untuk menambahkan box.</p>
        </div>

        <!-- Looping Data (Card Layout) -->
        <div v-else class="space-y-3">
          <div
            v-for="item in store.boxList" :key="item.id"
            class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition relative group"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 pr-4">
                <!-- Nama Box -->
                <h3 class="font-black text-[#10499b] text-base truncate tracking-wide">{{ item.nama }}</h3>

                <!-- Range Nomor Surat -->
                <div class="flex items-center gap-1.5 mt-1 text-gray-500">
                  <span class="material-symbols-outlined text-[14px]">format_list_numbered</span>
                  <p class="text-xs font-medium truncate">Range: <span class="text-gray-800 font-bold">{{ item.range }}</span></p>
                </div>
              </div>

              <!-- Tombol Aksi (Edit & Hapus) -->
              <div class="flex flex-col gap-1.5 shrink-0">
                <button @click="openEdit(item)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition active:scale-95">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button @click="hapus(item.id)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition active:scale-95">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
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

    <!-- Gunakan Komponen Modal Terpisah -->
    <BoxModal
      v-model="showModal"
      :editData="editData"
      @save="simpan"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArsipStore } from '../stores/arsip'
import BoxModal from '../components/BoxModal.vue' // Import Modal

const router = useRouter()
const store = useArsipStore() // Panggil Pinia Store

const showModal = ref(false)
const editData = ref(null)

// Load data saat halaman dibuka
onMounted(() => {
  store.loadBox()
})

// Fungsi buka modal tambah
function openTambah() {
  editData.value = null
  showModal.value = true
}

// Fungsi buka modal edit dengan membawa data
function openEdit(data) {
  editData.value = data
  showModal.value = true
}

// Menangkap event @save dari BoxModal dan meneruskannya ke Store
async function simpan(data) {
  await store.saveBox(data)
}

// Fungsi Hapus Data
async function hapus(id) {
  const ok = confirm('Apakah Anda yakin ingin menghapus data box ini secara permanen?')
  if (ok) {
    await store.deleteBox(id)
  }
}
</script>
