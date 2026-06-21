<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden">

    <!-- Header -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button @click="router.push('/arsip-menu')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Pencarian Data Arsip</h1>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col overflow-y-auto">

      <!-- Plate Input -->
      <div class="p-5 pb-2 mt-2 shrink-0">
        <div class="bg-[#1a1a1a] rounded-xl border-4 border-gray-600 p-1 shadow-md">
          <div class="border border-gray-500 rounded-lg h-20 flex items-center justify-center px-4 gap-4 text-white">
            <input
              v-model="plat1"
              maxlength="2"
              placeholder="XX"
              class="w-16 bg-transparent text-center text-4xl font-bold uppercase outline-none border-b-2 border-transparent focus:border-white transition-colors"
            />
            <input
              v-model="plat2"
              maxlength="4"
              placeholder="XXXX"
              class="w-28 bg-transparent text-center text-4xl font-bold uppercase outline-none border-b-2 border-transparent focus:border-white transition-colors"
            />
            <input
              v-model="plat3"
              maxlength="3"
              placeholder="XXX"
              class="w-20 bg-transparent text-center text-4xl font-bold uppercase outline-none border-b-2 border-transparent focus:border-white transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Button -->
      <div class="px-5 mt-2 shrink-0">
        <button
          @click="searchData"
          class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95 flex justify-center items-center gap-2"
        >
          <span class="material-symbols-outlined">search</span>
          Cari Kendaraan
        </button>
      </div>

      <!-- Result -->
      <div class="px-5 mt-5 pb-8 flex-1">

        <!-- Empty / Idle -->
        <div v-if="!searched" class="h-full flex flex-col items-center justify-center text-center opacity-60 pt-10">
          <span class="material-symbols-outlined text-7xl text-gray-300 mb-3">manage_search</span>
          <p class="text-gray-500 font-bold">Ketik untuk Mencari</p>
          <p class="text-gray-400 text-xs mt-1">Belum ada data arsip yang dicari.<br />Ketikkan plat nomor kendaraan di atas.</p>
        </div>

        <!-- Loading -->
        <div v-else-if="store.loading" class="h-full flex flex-col items-center justify-center pt-10">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-blue-700 font-bold text-sm">Mencari arsip...</p>
        </div>

        <!-- Not Found -->
        <div v-else-if="results.length === 0" class="h-full flex flex-col items-center justify-center text-center pt-10">
          <span class="material-symbols-outlined text-7xl text-red-300 mb-3">search_off</span>
          <p class="text-gray-500">Kendaraan dengan plat<br />
            <b class="text-black text-lg">{{ fullPlate }}</b><br />
            tidak ditemukan.
          </p>
        </div>

        <!-- Found -->
        <div v-else class="space-y-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Pencarian:</span>
            <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md">
              {{ results.length }} ditemukan
            </span>
          </div>

          <div
            v-for="item in results"
            :key="item.id"
            class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden"
          >
            <!-- Indikator Warna Kiri -->
            <div
              class="absolute top-0 left-0 w-1.5 h-full"
              :class="item.status === 'Dipinjam' ? 'bg-amber-400' : 'bg-green-500'"
            ></div>

            <div class="flex justify-between items-start mb-3 pl-2">
              <div>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Plat Nomor</p>
                <!-- Menampilkan NO_POLISI sesuai ERD -->
                <h4 class="font-black text-xl text-[#10499b] tracking-wide">{{ item.no_polisi }}</h4>
              </div>

              <span
                class="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase"
                :class="item.status === 'Dipinjam' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
              >
                {{ item.status }}
              </span>
            </div>

            <div class="pl-2 border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
              <div>
                <p class="text-[10px] text-gray-400 font-medium mb-0.5">Nomor Surat</p>
                <!-- Menampilkan NO_SURAT sesuai ERD -->
                <p class="text-xs font-bold text-gray-700">{{ item.no_surat }}</p>
              </div>

              <div>
                <p class="text-[10px] text-gray-400 font-medium mb-0.5">Lokasi Penyimpanan</p>
                <!-- Menampilkan NAMA_BOX sesuai ERD -->
                <p class="text-xs font-bold text-gray-700">{{ item.box }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArsipStore } from '../stores/arsip' // Import Store

const router = useRouter()
const store = useArsipStore() // Inisialisasi Store

const plat1 = ref('B')
const plat2 = ref('')
const plat3 = ref('')

const searched = ref(false)
const results = ref([])

// Wajib memuat Arsip & Box agar fungsi pencocokan data dari ERD berjalan
onMounted(() => {
  store.loadArsip()
  store.loadBox()
})

// Menggabungkan 3 inputan plat menjadi 1 string
const fullPlate = computed(() =>
  `${plat1.value} ${plat2.value} ${plat3.value}`.trim().toUpperCase()
)

function searchData() {
  searched.value = true

  if (fullPlate.value.length < 3) return // Hindari pencarian kosong

  // 1. Cari arsip menggunakan fungsi dari store (mencocokkan no_polisi)
  const foundData = store.cariArsip(fullPlate.value)

  // 2. Petakan hasil pencarian dengan variabel ERD yang baru
  results.value = foundData.map(item => {
    return {
      ...item,
      no_surat: item.no_surat,
      no_polisi: item.no_polisi,
      // Prioritaskan nama_box jika sudah tersimpan, jika tidak cari melalui range
      box: item.nama_box || store.cariLokasiBox(item.no_surat)
    }
  })
}
</script>
```
