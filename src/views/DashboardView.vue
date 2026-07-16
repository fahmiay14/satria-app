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
        <p class="text-xs text-blue-200 mt-2">Versi Aplikasi : 2.0.0</p>
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

    <!-- MODAL PENGUMUMAN (TOP BANNER STYLE DINAMIS) -->
    <div v-if="showAnnouncementModal" class="absolute inset-0 z-[600] bg-black/50 backdrop-blur-sm transition-opacity flex flex-col">
      <!-- Banner Dropdown dengan warna dinamis (Merah untuk Penting, Biru untuk Biasa) -->
      <div :class="[
          'text-white pt-8 pb-8 px-5 rounded-b-[2rem] shadow-2xl animate-slide-down relative w-full border-b-[6px]',
          latestAnnouncement?.penting ? 'bg-red-600 border-red-800' : 'bg-blue-600 border-blue-800'
        ]">

        <div class="flex items-start gap-4 mb-5">
          <!-- Icon Animasi -->
          <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-pulse shrink-0 shadow-inner">
            <span class="material-symbols-outlined text-white text-3xl">
              {{ latestAnnouncement?.penting ? 'campaign' : 'info' }}
            </span>
          </div>

          <!-- Header Teks -->
          <div class="pt-1">
            <h3 class="text-xl font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
              {{ latestAnnouncement?.penting ? 'Pengumuman Penting!' : 'Informasi Baru' }}
            </h3>
            <p :class="[
                'text-[11px] mt-1 font-medium tracking-wide',
                latestAnnouncement?.penting ? 'text-red-200' : 'text-blue-200'
              ]">
              {{ latestAnnouncement?.penting ? 'Harap dibaca sebelum bekerja' : 'Sekilas info untuk Anda' }}
            </p>
          </div>
        </div>

        <!-- Isi Pengumuman -->
        <div :class="[
            'rounded-2xl p-4 mb-6 shadow-inner border',
            latestAnnouncement?.penting ? 'bg-red-700/50 border-red-500/50' : 'bg-blue-700/50 border-blue-500/50'
          ]">
          <h4 class="font-bold text-white text-base mb-1.5">{{ latestAnnouncement?.judul }}</h4>
          <div class="text-sm text-white/90 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto pr-1">
            {{ latestAnnouncement?.isi }}
          </div>
        </div>

        <!-- Tombol Tutup -->
        <button @click="closeAnnouncementModal" :class="[
            'w-full bg-white hover:bg-gray-100 font-black py-4 rounded-xl shadow-lg transition active:scale-95 text-sm uppercase tracking-widest border-2 border-transparent outline-none',
            latestAnnouncement?.penting ? 'text-red-700 focus:border-red-300' : 'text-blue-700 focus:border-blue-300'
          ]">
          SAYA MENGERTI
        </button>
      </div>

      <!-- Area Kosong Bawah untuk menutup Modal (Opsional) -->
      <div class="flex-1" @click="closeAnnouncementModal"></div>
    </div>

    <!-- MEMANGGIL KOMPONEN SIDEBAR -->
    <AppSidebar v-model="sidebarOpen" />

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import { usePengumumanStore } from '../stores/pengumuman'

const router = useRouter()
const sidebarOpen = ref(false)

const username = localStorage.getItem('nama') || 'PENGGUNA'
const role = localStorage.getItem('role') || 'petugas'

const roleLabel = computed(() =>
  role === 'admin' ? 'Administrator' : 'Petugas Penelusur'
)

// === LOGIKA POP-UP PENGUMUMAN ===
const pengumumanStore = usePengumumanStore()
const showAnnouncementModal = ref(false)
const latestAnnouncement = ref(null)

onMounted(async () => {
  // 1. Muat data pengumuman saat masuk dashboard
  await pengumumanStore.loadPengumuman()

  // 2. Cari semua pengumuman yang dibuat HARI INI
  const todayString = new Date().toDateString()
  const todaysAnnouncements = pengumumanStore.pengumumanList.filter(p => {
    const pDate = new Date(p.tanggal).toDateString()
    return pDate === todayString
  })

  // 3. Pisahkan antara yang penting dan tidak penting
  const importantToday = todaysAnnouncements.filter(p => p.penting)
  const nonImportantToday = todaysAnnouncements.filter(p => !p.penting)

  let announcementToShow = null

  // PRIORITAS 1: Cek pengumuman PENTING
  if (importantToday.length > 0) {
    const newestImportant = importantToday[0]
    // Gunakan sessionStorage (Hanya ditandai di sesi ini, muncul lagi jika app di-restart)
    if (!sessionStorage.getItem(`dismissed_announcement_${newestImportant.id}`)) {
      announcementToShow = newestImportant
    }
  }

  // PRIORITAS 2: Jika tidak ada pengumuman penting, cek pengumuman BIASA
  if (!announcementToShow && nonImportantToday.length > 0) {
    const newestNonImportant = nonImportantToday[0]
    // Gunakan localStorage (Ditandai permanen, hanya muncul 1x seumur hidup untuk id ini)
    if (!localStorage.getItem(`dismissed_announcement_${newestNonImportant.id}`)) {
      announcementToShow = newestNonImportant
    }
  }

  // Tampilkan modal jika ada pengumuman yang belum ditutup sesuai aturannya
  if (announcementToShow) {
    latestAnnouncement.value = announcementToShow
    showAnnouncementModal.value = true
  }
})

function closeAnnouncementModal() {
  if (latestAnnouncement.value) {
    if (latestAnnouncement.value.penting) {
      // Simpan di sessionStorage agar tidak muncul lagi SELAMA SESI INI
      sessionStorage.setItem(`dismissed_announcement_${latestAnnouncement.value.id}`, 'true')
    } else {
      // Simpan di localStorage agar tidak muncul lagi SELAMANYA
      localStorage.setItem(`dismissed_announcement_${latestAnnouncement.value.id}`, 'true')
    }
  }
  showAnnouncementModal.value = false
}

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

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Animasi khusus untuk Top Banner */
.animate-slide-down {
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideDown {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
