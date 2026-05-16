<template>
  <!-- Wrapper Utama: Mengunci area klik agar sidebar tidak tertimpa elemen lain -->
  <div
    class="absolute inset-0 z-[999] transition-all"
    :class="modelValue ? 'pointer-events-auto' : 'pointer-events-none'"
  >

    <!-- Overlay Gelap (Backdrop) -->
    <transition name="fade">
      <div
        v-if="modelValue"
        @click="closeSidebar"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
      ></div>
    </transition>

    <!-- Kotak Sidebar -->
    <div
      class="absolute top-0 left-0 h-full w-[80%] max-w-[300px] bg-white flex flex-col shadow-2xl rounded-r-3xl transition-transform duration-300"
      :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
    >

      <!-- HEADER PROFIL -->
      <div class="bg-[#10499b] text-white p-6 rounded-tr-3xl pb-8 pt-8 shrink-0">
        <div class="w-20 h-20 bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden mb-4 flex items-center justify-center">
          <!-- Menampilkan inisial nama secara dinamis -->
          <span class="text-3xl font-black text-[#10499b] uppercase">
            {{ getInitials(username) }}
          </span>
        </div>

        <h2 class="text-lg font-bold mb-1 truncate">{{ username }}</h2>
        <div class="text-xs text-blue-100 space-y-1">
          <p>Status: <span class="text-green-300 font-bold">Online</span></p>
          <p class="font-medium text-white mt-1 uppercase tracking-wider">{{ roleText }}</p>
        </div>
      </div>

      <!-- MENU NAVIGASI (Hanya 3 Menu Sesuai Permintaan) -->
      <div class="flex-1 py-4 overflow-y-auto">
        <button
          v-for="menu in menuItems"
          :key="menu.path"
          type="button"
          @click="navigateTo(menu.path)"
          class="w-full flex items-center px-6 py-4 transition relative cursor-pointer group"
          :class="isMenuMatch(menu.path) ? 'bg-blue-50/50' : 'hover:bg-gray-50 active:bg-gray-100'"
        >
          <!-- Indikator Garis Biru Aktif -->
          <div
            v-if="isMenuMatch(menu.path)"
            class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10499b] rounded-r-md pointer-events-none"
          ></div>

          <!-- Ikon Menu -->
          <span
            class="material-symbols-outlined mr-4 transition-colors pointer-events-none"
            :class="isMenuMatch(menu.path) ? 'text-[#10499b]' : 'text-gray-400 group-hover:text-blue-400'"
          >
            {{ menu.icon }}
          </span>

          <!-- Label Menu -->
          <span
            class="font-medium transition-colors pointer-events-none"
            :class="isMenuMatch(menu.path) ? 'text-[#10499b] font-bold' : 'text-gray-600 group-hover:text-gray-900'"
          >
            {{ menu.label }}
          </span>
        </button>
      </div>

      <!-- FOOTER / LOGOUT -->
      <div class="p-6 border-t border-gray-100 shrink-0">
        <button
          type="button"
          @click="logout"
          class="w-full flex items-center px-4 py-3 gap-4 hover:bg-red-50 active:bg-red-100 rounded-xl transition cursor-pointer group"
        >
          <span class="material-symbols-outlined text-red-400 group-hover:text-red-600 transition-colors pointer-events-none">
            logout
          </span>
          <span class="text-red-500 font-bold group-hover:text-red-700 transition-colors pointer-events-none">
            Keluar Aplikasi
          </span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const route = useRoute()

const username = ref('PENGGUNA')
const role = ref('petugas')

onMounted(() => {
  username.value = localStorage.getItem('nama') || 'PENGGUNA'
  role.value = localStorage.getItem('role') || 'petugas'
})

function getInitials(name) {
  if (!name || name === 'PENGGUNA') return 'U'
  const words = name.trim().split(' ')
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const roleText = computed(() =>
  role.value === 'admin' ? 'Administrator' : 'Petugas Lapangan'
)

// DAFTAR MENU BERSIH (Pengumuman Dihapus)
const menuItems = computed(() => {
  return [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/profil', icon: 'manage_accounts', label: 'Profil Saya' }
  ]
})

function isMenuMatch(menuPath) {
  return route.path === menuPath
}

function closeSidebar() {
  emit('update:modelValue', false)
}

function navigateTo(path) {
  router.push(path)
  closeSidebar()
}

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
    localStorage.clear()
    router.push('/login')
    closeSidebar()
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
