<template>
  <div>
    <!-- Overlay dengan z-index [990] agar di atas segalanya -->
    <transition name="fade">
      <div
        v-if="modelValue"
        @click="closeSidebar"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[990]"
      ></div>
    </transition>

    <!-- Sidebar dengan z-index [999] -->
    <div
      class="fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white z-[999] flex flex-col shadow-2xl rounded-r-3xl transition-transform duration-300"
      :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Header -->
      <div
        class="bg-[#10499b] text-white p-6 rounded-tr-3xl pb-8 pt-8"
      >
        <!-- Avatar -->
        <div
          class="w-20 h-20 bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden mb-4 flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-5xl text-blue-500">
            person
          </span>
        </div>

        <!-- User -->
        <h2 class="text-lg font-bold mb-1">
          {{ username }}
        </h2>

        <div class="text-xs text-blue-100 space-y-1">
          <p>
            Status:
            <span class="text-green-300 font-bold">
              Online
            </span>
          </p>

          <p class="font-medium text-white mt-1">
            {{ roleText }}
          </p>
        </div>
      </div>

      <!-- Menu -->
      <div class="flex-1 py-4">

        <!-- Menu Dashboard -->
        <button
          @click="goDashboard"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
        >
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-blue-500">
              dashboard
            </span>
            <span class="text-gray-700 font-medium">
              Dashboard
            </span>
          </div>
          <span class="material-symbols-outlined text-blue-600">
            chevron_right
          </span>
        </button>

        <!-- Menu Profil -->
        <button
          @click="goProfile"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
        >
          <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium">
              Profil
            </span>
          </div>
          <span class="material-symbols-outlined text-blue-600">
            chevron_right
          </span>
        </button>

      </div>

      <!-- Logout -->
      <div class="p-6 border-t border-gray-100">
        <button
          @click="logout"
          class="w-full flex items-center gap-4 hover:bg-red-50 p-3 rounded-xl transition"
        >
          <span class="material-symbols-outlined text-red-500">
            logout
          </span>

          <span class="text-red-500 font-medium">
            Keluar
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits([
  'update:modelValue'
])

const router = useRouter()

const username =
  localStorage.getItem('username') ||
  'PENGGUNA'

const role =
  localStorage.getItem('role') ||
  'petugas'

const roleText = computed(() =>
  role === 'admin'
    ? 'Administrator'
    : 'Petugas Penelusur'
)

function closeSidebar() {
  emit('update:modelValue', false)
}

function goDashboard() {
  closeSidebar()
  router.push('/dashboard')
}

function goProfile() {
  closeSidebar()
  // router.push('/profil') // Aktifkan jika sudah ada halamannya
}

function logout() {
  localStorage.clear()
  closeSidebar()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
