<template>
  <div class="min-h-[100dvh] bg-gradient-to-br from-[#f0f4ff] to-white flex flex-col font-sans">

    <!-- ========================================= -->
    <!-- MAIN CONTAINER                            -->
    <!-- ========================================= -->
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8">

      <!-- ========================================= -->
      <!-- LOGO & BRAND SECTION                      -->
      <!-- ========================================= -->
      <div class="flex flex-col items-center mb-8 pt-4">
        <!-- Logo Container dengan efek glassmorphism -->
        <div class="w-28 h-28 bg-gradient-to-br from-[#10499b] to-[#1a5dc4] rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center mb-5 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <div class="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2">
            <img
              src="https://i.ibb.co.com/wN4sQBr5/logoo.png"
              alt="Satria Logo"
              class="w-full h-full object-contain brightness-0 invert"
            />
          </div>
        </div>

        <h1 class="text-3xl font-black text-[#10499b] tracking-wider mb-1">SATRIA</h1>
        <p class="text-xs text-gray-500 font-medium tracking-[0.2em] text-center leading-relaxed">
          System for Archive and Tracking<br>Route Integration Activity
        </p>
      </div>

      <!-- ========================================= -->
      <!-- LOGIN CARD                                -->
      <!-- ========================================= -->
      <div class="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-7 border border-gray-100">

        <!-- Welcome Text -->
        <div class="mb-7">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-1 bg-[#10499b] rounded-full"></div>
            <p class="text-gray-400 text-xs font-semibold tracking-widest uppercase">Welcome Back</p>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mt-2">Masuk ke Akun</h2>
          <p class="text-sm text-gray-500 mt-1.5">Silakan isi data diri Anda</p>
        </div>

        <!-- Notifikasi Error dari Auth Store -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-shake">
          <span class="material-symbols-outlined text-lg shrink-0">error</span>
          {{ authStore.error }}
        </div>

        <!-- Form Login -->
        <form @submit.prevent="login" class="space-y-5">

          <!-- Field NIK / NIP -->
          <div class="group">
            <label class="block text-gray-700 font-semibold text-[13px] mb-2 ml-1">
              NIK / NIP
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-focus-within:bg-[#10499b] transition-colors duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-lg transition-colors duration-300">badge</span>
                </div>
              </div>
              <input
                v-model="nik"
                type="text"
                required
                placeholder="Masukkan NIK atau NIP"
                class="w-full pl-16 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400 lowercase"
              />
            </div>
          </div>

          <!-- Field Password -->
          <div class="group">
            <label class="block text-gray-700 font-semibold text-[13px] mb-2 ml-1">
              Kata Sandi
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-focus-within:bg-[#10499b] transition-colors duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-lg transition-colors duration-300">lock</span>
                </div>
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Masukkan kata sandi"
                class="w-full pl-16 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
              >
                <span
                  class="material-symbols-outlined text-gray-400 hover:text-[#10499b] transition-colors duration-200 text-xl"
                >
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="flex justify-end">
            <a href="#" class="text-xs text-[#10499b] hover:text-blue-700 font-medium transition-colors">
              Lupa kata sandi?
            </a>
          </div>

          <!-- Tombol Masuk -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full bg-gradient-to-r from-[#10499b] to-[#1a5dc4] hover:from-[#0d3f85] hover:to-[#1550b0] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 active:scale-[0.98] text-base tracking-wide relative overflow-hidden group"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <template v-else>
                  Masuk
                  <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </template>
              </span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-3 bg-white text-gray-400">atau</span>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center space-y-3">
          <p class="text-xs text-gray-500">
            Butuh bantuan?
            <a href="#" class="text-[#10499b] font-semibold hover:underline">Hubungi Admin</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-6 text-center">
        <p class="text-xs text-gray-400">© 2025 Satria Mobile • v1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const nik = ref('')
const password = ref('')
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

// Terhubung dengan Firebase melalui Pinia Auth Store
async function login() {
  if (!nik.value || !password.value) {
    authStore.error = "NIK/NIP dan Password harus diisi."
    return
  }

  const success = await authStore.login(nik.value, password.value)

  if (success) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Selamat datang, ${localStorage.getItem('nama')}!` } }))
    router.push('/dashboard')
  }
}
</script>

<style scoped>
/* Animasi goyang saat error */
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
