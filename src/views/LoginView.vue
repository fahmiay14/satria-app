<template>
  <div class="h-[100dvh] flex flex-col bg-white overflow-y-auto font-sans">

    <!-- ========================================= -->
    <!-- HEADER AREA (LENGKUNGAN BIRU BESAR)       -->
    <!-- ========================================= -->
    <div class="w-full bg-[#10499b] pt-14 pb-6 flex flex-col items-center shrink-0 header-curve shadow-md relative">
      <h1 class="text-white text-[2.5rem] font-bold tracking-widest leading-none mb-2 drop-shadow-md">
        SATRIA
      </h1>
      <p class="text-white text-xs font-normal px-8 text-center tracking-wide mb-4">
        System for Archive and Tracking Route Integration Activity
      </p>

      <!-- Gambar Siluet Motor (logo-ss.png) -->
      <div class="w-150 h-40 relative flex items-center justify-center">
        <!-- Pastikan gambar logo-ss.png ada di dalam folder 'public' -->
        <img
          src="https://i.ibb.co.com/wN4sQBr5/logoo.png"
          alt="Siluet Motor Satria"
          class="w-full h-full object-contain"
        />
      </div>
    </div>

    <!-- ========================================= -->
    <!-- MAIN CONTENT & FORM LOGIN                 -->
    <!-- ========================================= -->
    <!-- pt-8 diubah menjadi pt-5 agar lebih naik ke atas -->
    <div class="flex-1 flex flex-col px-7 pt-5 pb-4">

      <!-- Welcome Text -->
      <!-- mb-8 diubah menjadi mb-5 agar jarak ke form lebih rapat -->
      <div class="mb-5">
        <p class="text-gray-800 text-[15px] mb-1">Selamat Datang ...</p>
        <h2 class="text-[22px] font-extrabold text-black tracking-tight">
          di Satria Mobile
        </h2>
      </div>

      <!-- Form Login -->
      <!-- space-y-5 diubah menjadi space-y-4 agar jarak antar input lebih rapat -->
      <form @submit.prevent="login" class="space-y-4">

        <!-- Field Username -->
        <div>
          <!-- mb-2 diubah menjadi mb-1.5 -->
          <label class="block text-[#1a365d] font-bold text-sm mb-1.5">
            Username
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-gray-400 text-xl">person</span>
            </div>
            <input
              v-model="username"
              type="text"
              required
              placeholder="Gunakan 'admin' atau 'petugas'"
              class="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0051d4] focus:ring-1 focus:ring-[#0051d4] transition text-sm font-medium text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Field Password -->
        <div>
          <!-- mb-2 diubah menjadi mb-1.5 -->
          <label class="block text-[#1a365d] font-bold text-sm mb-1.5">
            Kata sandi
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-gray-400 text-xl">key</span>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Masukan Kata Sandi Anda"
              class="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0051d4] focus:ring-1 focus:ring-[#0051d4] transition text-sm font-medium text-gray-800 placeholder-gray-400"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <span class="material-symbols-outlined text-gray-400 hover:text-gray-600 transition text-xl">
                {{ showPassword ? 'visibility' : 'visibility_off' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Tombol Masuk -->
        <!-- pt-6 diubah menjadi pt-4 agar tombol lebih dekat dengan input password -->
        <div class="pt-4">
          <button
            type="submit"
            class="w-full bg-[#10499b] hover:bg-[#0040a8] text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 text-base tracking-wide"
          >
            Masuk
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function login() {
  const role = username.value.toLowerCase().includes('admin')
    ? 'admin'
    : 'petugas'

  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('username', username.value.toUpperCase())
  localStorage.setItem('role', role)

  router.push('/dashboard')
}
</script>

<style scoped>
/* CSS kustom untuk membuat lengkungan ekstrem yang mulus di bagian bawah header biru */
.header-curve {
  border-radius: 0 0 50% 50% / 0 0 15% 15%;
}
</style>
