<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/dashboard')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium tracking-wide">Papan Pengumuman</h1>
    </div>

    <!-- KONTEN UTAMA -->
    <div class="flex-1 overflow-y-auto px-5 pt-6 pb-24 relative">

      <div class="mb-6 flex justify-between items-end">
        <div>
          <h2 class="text-xl font-black text-gray-800">Informasi Terbaru</h2>
          <p class="text-xs text-gray-500 mt-1">Pembaruan dan instruksi untuk petugas.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">Memuat pengumuman...</p>
      </div>

      <!-- State Kosong -->
      <div v-else-if="store.pengumumanList.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-2">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
          <span class="material-symbols-outlined text-3xl">campaign</span>
        </div>
        <p class="text-gray-500 font-medium text-sm">Belum ada pengumuman</p>
        <p v-if="role === 'admin'" class="text-gray-400 text-xs mt-1">Gunakan tombol + untuk membuat pengumuman baru.</p>
      </div>

      <!-- Daftar Pengumuman -->
      <div v-else class="space-y-4">
        <div
          v-for="item in store.pengumumanList" :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden transition hover:shadow-md"
        >
          <!-- Indikator Penting -->
          <div v-if="item.penting" class="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">error</span> Penting
          </div>

          <!-- Header Card -->
          <h3 class="font-bold text-gray-800 text-base mb-1 pr-16 leading-snug">{{ item.judul }}</h3>

          <div class="flex items-center gap-3 text-[10px] text-gray-400 font-medium mb-3">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">calendar_today</span> {{ formatTanggal(item.tanggal) }}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">person</span> {{ item.pembuat }}</span>
          </div>

          <!-- Isi Pengumuman -->
          <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-50 pt-3">
            {{ item.isi }}
          </div>

          <!-- Tombol Aksi (Hanya untuk Admin) -->
          <div v-if="role === 'admin'" class="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
            <button @click="openEdit(item)" class="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition active:scale-95 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">edit</span> Edit
            </button>
            <button @click="hapus(item)" class="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition active:scale-95 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">delete</span> Hapus
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- FLOATING ACTION BUTTON (Khusus Admin) -->
    <button
      v-if="role === 'admin'"
      @click="openTambah"
      class="absolute bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <!-- MODAL FORM PENGUMUMAN -->
    <div v-if="showModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-gray-800">{{ isEdit ? 'Edit Pengumuman' : 'Buat Pengumuman' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-red-500 transition"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="simpan" class="space-y-4">

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Judul Pengumuman</label>
              <input
                v-model="formData.judul"
                type="text"
                required
                placeholder="Contoh: Pembaruan Jadwal Lapangan"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#10499b] outline-none text-sm font-medium"
              >
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Isi Pengumuman</label>
              <textarea
                v-model="formData.isi"
                required
                rows="5"
                placeholder="Tulis pesan Anda di sini..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#10499b] outline-none text-sm font-medium resize-none"
              ></textarea>
            </div>

            <!-- Checkbox Penting -->
            <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition" :class="formData.penting ? 'bg-red-50 border-red-200' : ''">
              <div class="relative flex items-center justify-center">
                <input type="checkbox" v-model="formData.penting" class="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-red-500 checked:bg-red-500 checked:border-red-500 transition">
                <span class="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
              </div>
              <div>
                <span class="text-sm font-bold block" :class="formData.penting ? 'text-red-700' : 'text-gray-700'">Tandai sebagai Penting</span>
                <span class="text-[10px] text-gray-500">Akan diberikan warna merah menyala agar segera dibaca.</span>
              </div>
            </label>

            <div class="pt-4 pb-2">
              <button
                type="submit"
                class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm"
              >
                Kirim Pengumuman
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePengumumanStore } from '../stores/pengumuman'

const router = useRouter()
const store = usePengumumanStore()
const role = localStorage.getItem('role') || 'petugas'

const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  judul: '',
  isi: '',
  penting: false
})

onMounted(() => {
  store.loadPengumuman()
})

// Utilities Date Format
function formatTanggal(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Logika Modal
function openTambah() {
  isEdit.value = false
  formData.value = { id: null, judul: '', isi: '', penting: false }
  showModal.value = true
}

function openEdit(item) {
  isEdit.value = true
  formData.value = { ...item }
  showModal.value = true
}

async function simpan() {
  await store.savePengumuman(formData.value)
  showModal.value = false
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pengumuman berhasil disiarkan!` } }))
}

async function hapus(item) {
  if (confirm(`Hapus pengumuman "${item.judul}"?`)) {
    await store.deletePengumuman(item.id)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pengumuman dihapus!` } }))
  }
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
</style>
