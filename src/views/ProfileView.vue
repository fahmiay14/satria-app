<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/dashboard')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium tracking-wide">Profil Akun</h1>
    </div>

    <!-- KONTEN UTAMA -->
    <div class="flex-1 overflow-y-auto relative">

      <!-- Background Dekoratif -->
      <div class="h-32 bg-[#10499b] rounded-b-[40px] absolute top-0 left-0 right-0 z-0"></div>

      <div class="px-5 pt-10 pb-24 relative z-10">

        <!-- Card Profil Utama -->
        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col items-center mb-6">

          <div class="w-24 h-24 bg-blue-50 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center -mt-14 mb-4">
            <span class="text-4xl font-black text-blue-600 uppercase">{{ getInitials(userData.nama) }}</span>
          </div>

          <h2 class="text-xl font-black text-gray-800 text-center">{{ userData.nama }}</h2>
          <span
            class="mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            :class="userData.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
          >
            {{ userData.role === 'admin' ? 'Administrator' : 'Petugas Lapangan' }}
          </span>
        </div>

        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">Informasi Detail</h3>

        <!-- List Informasi -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div class="flex items-center gap-4 p-4 border-b border-gray-50">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">NIK / NIP</p>
              <p class="text-sm font-bold text-gray-800 truncate">{{ userData.nik }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 border-b border-gray-50">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nama Lengkap</p>
              <p class="text-sm font-bold text-gray-800 truncate">{{ userData.nama }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Hak Akses Sistem</p>
              <p class="text-sm font-bold text-gray-800 truncate capitalize">{{ userData.role }}</p>
            </div>
          </div>

        </div>

        <!-- Tombol Logout -->
        <button
          @click="logout"
          class="w-full mt-8 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl shadow-sm transition active:scale-95 text-sm flex justify-center items-center gap-2 border border-red-100"
        >
          <span class="material-symbols-outlined text-[18px]">logout</span>
          Keluar dari Akun
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userData = reactive({
  nama: '',
  nik: '',
  role: ''
})

onMounted(() => {
  // Ambil data langsung dari localStorage (atau bisa dari store jika diretain)
  userData.nama = localStorage.getItem('nama') || 'Pengguna'
  userData.nik = localStorage.getItem('nik') || '-'
  userData.role = localStorage.getItem('role') || 'petugas'
})

// Mengambil 2 huruf pertama untuk avatar default
function getInitials(name) {
  if (!name) return 'U'
  const words = name.trim().split(' ')
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
