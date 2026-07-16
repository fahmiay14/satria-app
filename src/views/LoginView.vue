<template>
  <!-- ========================================= -->
  <!-- 1. TAMPILAN DESKTOP (SELARAS DENGAN MOBILE) -->
  <!-- ========================================= -->
  <div v-if="isDesktop" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] via-white to-[#e8f0fe] overflow-hidden z-[100] font-sans">

    <!-- Dekorasi Latar Belakang Elegan -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/60 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>

    <!-- Main Card -->
    <div class="w-[1000px] max-w-[95%] h-[600px] bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 flex relative overflow-hidden z-10 border border-gray-100">

      <!-- Sisi Kiri: Branding Modern -->
      <div class="w-[42%] h-full bg-gradient-to-br from-[#10499b] to-[#1a5dc4] relative overflow-hidden flex flex-col items-center justify-center p-10">

        <!-- Pattern Background -->
        <div class="absolute inset-0 opacity-[0.05]">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle, white 2px, transparent 2px); background-size: 30px 30px;"></div>
        </div>

        <!-- Blob Dekoratif -->
        <div class="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>

        <!-- Konten Branding -->
        <div class="relative z-10 flex flex-col items-center text-center text-white">
          <!-- Logo Container -->
          <div class="w-36 h-36 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center p-4 mb-8 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
            <img
              src="https://i.ibb.co.com/wN4sQBr5/logoo.png"
              alt="Satria Logo"
              class="w-full h-full object-contain brightness-0 invert"
            />
          </div>

          <!-- Judul -->
          <h1 class="text-4xl font-black tracking-[0.15em] mb-3 drop-shadow-lg">SATRIA</h1>

          <!-- Subtitle -->
          <p class="text-sm text-blue-100 font-bold tracking-[0.2em] leading-relaxed mb-6 uppercase opacity-90">
            System for Archive and Tracking<br>Route Integration Activity
          </p>

          <!-- Divider -->
          <div class="flex items-center gap-3 mb-6">
            <div class="h-px w-10 bg-blue-400/30"></div>
            <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
            <div class="h-px w-10 bg-blue-400/30"></div>
          </div>

          <!-- Deskripsi -->
          <p class="text-xs text-blue-100/70 font-medium leading-relaxed max-w-[280px]">
            Platform operasional terpadu untuk monitoring petugas lapangan, pengelolaan arsip BPKB, dan optimasi rute secara real-time.
          </p>

          <!-- Features Badge -->
          <div class="flex flex-wrap gap-2 justify-center mt-8">
            <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[11px] font-semibold text-blue-50 border border-white/10">
              🗺️ Real-time Tracking
            </span>
            <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[11px] font-semibold text-blue-50 border border-white/10">
              📋 Arsip Digital
            </span>
            <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[11px] font-semibold text-blue-50 border border-white/10">
              📊 Live Dashboard
            </span>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: Form Login -->
      <div class="flex-1 h-full p-12 lg:px-16 flex flex-col justify-center bg-white">

        <!-- Welcome Section -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-1 bg-gradient-to-r from-[#10499b] to-[#1a5dc4] rounded-full"></div>
            <p class="text-gray-400 text-[11px] font-semibold tracking-[0.2em] uppercase">Welcome Back</p>
          </div>
          <h2 class="text-[32px] font-bold text-gray-900 mt-2 leading-tight">Masuk ke Akun</h2>
          <p class="text-sm text-gray-500 mt-2">
            Belum memiliki akun?
            <a href="#" class="text-[#10499b] font-semibold hover:underline">Hubungi Administrator</a>
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm font-semibold flex items-start gap-3 animate-shake">
          <span class="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
          <div>
            <p class="font-bold mb-0.5">Gagal Masuk</p>
            <p class="text-red-600">{{ authStore.error }}</p>
          </div>
        </div>

        <!-- Form Login -->
        <form @submit.prevent="login" class="space-y-5">

          <!-- Input NIK -->
          <div class="group">
            <label class="block text-gray-700 font-semibold text-sm mb-2.5 ml-1">
              NIK / NIP
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center group-focus-within:bg-[#10499b] group-focus-within:shadow-lg group-focus-within:shadow-blue-500/20 transition-all duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-xl transition-colors duration-300">badge</span>
                </div>
              </div>
              <input
                v-model="nik"
                type="text"
                required
                placeholder="Masukkan NIK atau NIP Anda"
                class="w-full pl-[4.25rem] pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Input Password -->
          <div class="group">
            <label class="block text-gray-700 font-semibold text-sm mb-2.5 ml-1">
              Kata Sandi
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center group-focus-within:bg-[#10499b] group-focus-within:shadow-lg group-focus-within:shadow-blue-500/20 transition-all duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-xl transition-colors duration-300">lock</span>
                </div>
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Masukkan kata sandi Anda"
                class="w-full pl-[4.25rem] pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center z-10 group/btn"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-gray-400 group-hover/btn:text-[#10499b] transition-colors duration-200 text-xl">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <a href="#" @click.prevent="openForgotModal" class="text-xs font-semibold text-[#10499b] hover:text-blue-700 transition-colors">
              Lupa kata sandi?
            </a>
          </div>

          <!-- Submit Button -->
          <div class="pt-3">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full bg-gradient-to-r from-[#10499b] to-[#1a5dc4] hover:from-[#0d3f85] hover:to-[#1550b0] disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:from-[#10499b] disabled:hover:to-[#1a5dc4] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98] text-base tracking-wide relative overflow-hidden group/btn"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <template v-else>
                  Masuk ke Sistem
                  <span class="material-symbols-outlined text-lg group-hover/btn:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
                </template>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </form>

        <!-- Footer Form -->
        <div class="mt-8 pt-6 border-t border-gray-100">
          <p class="text-center text-xs text-gray-400">
            Butuh bantuan? Hubungi
            <a href="tel:+6281234567890" class="text-[#10499b] font-semibold hover:underline">whatsapp admin</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer Absolute -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <p class="text-xs text-gray-500 font-medium">System Online • v2.0.0</p>
      </div>
    </div>
  </div>

  <!-- ========================================= -->
  <!-- 2. TAMPILAN MOBILE -->
  <!-- ========================================= -->
  <div v-else class="flex-1 flex flex-col bg-gradient-to-br from-[#f0f4ff] to-white font-sans overflow-y-auto">
    <div class="flex-1 flex flex-col w-full px-5 py-8 pb-10">

      <!-- LOGO MOBILE -->
      <div class="flex flex-col items-center mb-8 pt-4">
        <div class="w-28 h-28 bg-gradient-to-br from-[#10499b] to-[#1a5dc4] rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center mb-5 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <div class="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2">
            <img src="https://i.ibb.co.com/wN4sQBr5/logoo.png" alt="Satria Logo" class="w-full h-full object-contain brightness-0 invert" />
          </div>
        </div>
        <h1 class="text-3xl font-black text-[#10499b] tracking-wider mb-1">SATRIA</h1>
        <p class="text-xs text-gray-500 font-medium tracking-[0.2em] text-center leading-relaxed">
          System for Archive and Tracking<br>Route Integration Activity
        </p>
      </div>

      <!-- FORM MOBILE -->
      <div class="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-7 border border-gray-100 relative">
        <div class="mb-7">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-1 bg-[#10499b] rounded-full"></div>
            <p class="text-gray-400 text-xs font-semibold tracking-widest uppercase">Welcome Back</p>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mt-2">Masuk ke Akun</h2>
          <p class="text-sm text-gray-500 mt-1.5">Silakan isi NIK dan kata sandi Anda</p>
        </div>

        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-shake">
          <span class="material-symbols-outlined text-lg shrink-0">error</span>
          {{ authStore.error }}
        </div>

        <form @submit.prevent="login" class="space-y-5">
          <!-- NIK -->
          <div>
            <label class="block text-gray-700 font-semibold text-[13px] mb-2 ml-1">NIK / NIP</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-focus-within:bg-[#10499b] transition-colors duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-lg transition-colors duration-300">badge</span>
                </div>
              </div>
              <input v-model="nik" type="text" required placeholder="Masukkan NIK atau NIP" class="w-full pl-16 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400 lowercase" />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-gray-700 font-semibold text-[13px] mb-2 ml-1">Kata Sandi</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-focus-within:bg-[#10499b] transition-colors duration-300">
                  <span class="material-symbols-outlined text-[#10499b] group-focus-within:text-white text-lg transition-colors duration-300">lock</span>
                </div>
              </div>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="Masukkan kata sandi" class="w-full pl-16 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#10499b] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium text-gray-800 placeholder-gray-400" />
              <button type="button" @click="togglePassword" class="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
                <span class="material-symbols-outlined text-gray-400 hover:text-[#10499b] transition-colors duration-200 text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <a href="#" @click.prevent="openForgotModal" class="text-xs text-[#10499b] hover:text-blue-700 font-medium transition-colors">Lupa kata sandi?</a>
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="authStore.loading" class="w-full bg-gradient-to-r from-[#10499b] to-[#1a5dc4] hover:from-[#0d3f85] hover:to-[#1550b0] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 active:scale-[0.98] text-base tracking-wide relative overflow-hidden group">
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <template v-else>
                  Masuk ke Sistem <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </template>
              </span>
            </button>
          </div>
        </form>
      </div>

      <div class="mt-auto pt-6 text-center">
        <p class="text-xs text-gray-400 font-medium">© 2026 Satria Mobile • v1.0.0</p>
      </div>

    </div>
  </div>

  <!-- ========================================= -->
  <!-- 3. MODAL LUPA KATA SANDI -->
  <!-- ========================================= -->
  <div v-if="showForgotModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity font-sans">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
      <div class="px-6 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-[#10499b] flex items-center gap-2">
          <span class="material-symbols-outlined">lock_reset</span> Reset Sandi
        </h3>
        <button @click="closeForgotModal" class="text-blue-400 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-4">Masukkan NIK atau NIP Anda yang terdaftar untuk meminta reset kata sandi ke Administrator.</p>
        <form @submit.prevent="sendToWhatsapp">
          <div class="mb-5">
            <label class="block text-gray-700 font-semibold text-[13px] mb-2 ml-1">NIK / NIP</label>
            <input
              v-model="forgotNik"
              type="text"
              required
              placeholder="Masukkan NIK/NIP"
              class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#10499b] focus:bg-white transition-all text-sm font-medium"
            />
          </div>
          <button type="submit" class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">chat</span>
            Kirim via WhatsApp
          </button>
        </form>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const nik = ref('')
const password = ref('')
const showPassword = ref(false)

// Variabel dan Fungsi untuk Modal Lupa Kata Sandi
const showForgotModal = ref(false)
const forgotNik = ref('')

const isDesktop = ref(window.innerWidth >= 1024)

function handleResize() {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function togglePassword() {
  showPassword.value = !showPassword.value
}

// Fitur Buka Modal
function openForgotModal() {
  forgotNik.value = ''
  showForgotModal.value = true
}

// Fitur Tutup Modal
function closeForgotModal() {
  showForgotModal.value = false
}

// Fitur Kirim WhatsApp
function sendToWhatsapp() {
  if (!forgotNik.value) return

  const phoneNumber = '6283116447281'
  const message = encodeURIComponent(`Halo Admin, saya ingin mereset kata sandi untuk akun dengan NIK/NIP: ${forgotNik.value}. Mohon bantuannya.`)
  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`

  window.open(waUrl, '_blank')
  closeForgotModal()
}

async function login() {
  if (!nik.value || !password.value) {
    authStore.error = "NIK/NIP dan Password harus diisi."
    return
  }

  const success = await authStore.login(nik.value, password.value)

  if (success) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Selamat datang, ${localStorage.getItem('nama')}!` } }))

    if (isDesktop.value) {
      router.push('/desktop/dashboard')
    } else {
      router.push('/dashboard')
    }
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

/* Animasi slide up untuk modal popup */
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
