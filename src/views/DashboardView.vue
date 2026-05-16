<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden relative">

    <!-- Header -->
    <div class="bg-[#10499b] text-white pt-6 pb-12 px-5 rounded-b-[2rem] shadow-md relative z-10 w-full">
      <div class="flex items-center justify-between mb-6 mt-2">
        <button
          @click="sidebarOpen = true"
          class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>

      <div>
        <h2 class="text-lg font-bold mb-1">
          Wilujeng Sumping,
          <span>{{ username }}</span> 👋
        </h2>
        <p class="text-sm text-blue-100">Selamat Bekerja</p>
        <p class="text-xs text-blue-200 mt-2">Versi Aplikasi : 3.0.0 (Vue)</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-5 -mt-6 relative z-20 pb-5 overflow-y-auto">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-full">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-blue-500">category</span>
          <h3 class="font-bold text-gray-800">
            Menu {{ roleLabel }}
          </h3>
        </div>

        <!-- Render Menu Dinamis Menggunakan v-for -->
        <div class="space-y-4">
          <button
            v-for="(menu, index) in activeMenus"
            :key="index"
            @click="goTo(menu.path)"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition active:scale-95 border-b border-transparent hover:border-gray-100"
          >
            <div class="flex items-center gap-4">
              <div
                :class="`w-12 h-12 rounded-full flex items-center justify-center ${menu.bgColor} ${menu.textColor}`"
              >
                <span class="material-symbols-outlined">{{ menu.icon }}</span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">{{ menu.title }}</h4>
                <p class="text-xs text-gray-500 mt-1">{{ menu.desc }}</p>
              </div>
            </div>

            <span class="material-symbols-outlined text-gray-400">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MEMANGGIL KOMPONEN SIDEBAR -->
    <AppSidebar v-model="sidebarOpen" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'

const router = useRouter()
const sidebarOpen = ref(false)

const username = localStorage.getItem('nama') || 'PENGGUNA'
const role = localStorage.getItem('role') || 'petugas'

const roleLabel = computed(() =>
  role === 'admin' ? 'Administrator' : 'Petugas Penelusur'
)

// === KONFIGURASI MENU DINAMIS (DASHBOARD) ===
const menuConfig = {
  admin: [
    { title: 'Manajemen Pengguna', desc: 'Atur akun petugas dan admin', icon: 'admin_panel_settings', path: '/management-user', bgColor: 'bg-red-50', textColor: 'text-red-500' },
    { title: 'Menu Jadwal', desc: 'Kelola jadwal penugasan', icon: 'calendar_month', path: '/jadwal', bgColor: 'bg-green-50', textColor: 'text-green-500' },
    { title: 'Menu Arsip', desc: 'Kelola dan lihat data arsip', icon: 'folder_open', path: '/arsip-menu', bgColor: 'bg-blue-50', textColor: 'text-blue-500' },
    { title: 'Optimasi Rute', desc: 'Pengaturan rute penelusuran', icon: 'route', path: '/rute', bgColor: 'bg-purple-50', textColor: 'text-purple-500' },
    { title: 'Pengumuman', desc: 'Kelola informasi dan pengumuman', icon: 'campaign', path: '/pengumuman', bgColor: 'bg-yellow-50', textColor: 'text-yellow-500' },
    { title: 'Laporan', desc: 'Rekapitulasi laporan sistem', icon: 'analytics', path: '/laporan', bgColor: 'bg-orange-50', textColor: 'text-orange-500' }
  ],
  petugas: [
    { title: 'Menu Jadwal', desc: 'Lihat jadwal penugasan harian', icon: 'calendar_month', path: '/jadwal', bgColor: 'bg-green-50', textColor: 'text-green-500' },
    // Menu Arsip Dihapus dari Petugas
    { title: 'Pengumuman', desc: 'Informasi dari pusat', icon: 'campaign', path: '/pengumuman', bgColor: 'bg-yellow-50', textColor: 'text-yellow-500' },
    { title: 'Optimasi Rute', desc: 'Panduan rute penelusuran', icon: 'route', path: '/rute', bgColor: 'bg-purple-50', textColor: 'text-purple-500' },
    { title: 'Laporan', desc: 'Laporan hasil di lapangan', icon: 'analytics', path: '/laporan', bgColor: 'bg-orange-50', textColor: 'text-orange-500' }
  ]
}

const activeMenus = computed(() => menuConfig[role] || menuConfig['petugas'])

function goTo(path) {
  router.push(path)
}
</script>
