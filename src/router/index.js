import { createRouter, createWebHistory } from 'vue-router'

// Import semua halaman yang ada di aplikasi Anda
import SplashView from '../views/SplashView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ArsipView from '../views/ArsipView.vue'
import BoxView from '../views/BoxView.vue'
import SearchView from '../views/SearchView.vue'
import DataArsipView from '../views/DataArsipView.vue'
import JadwalView from '../views/JadwalView.vue'
import RuteMenuView from '../views/RuteMenuView.vue'
import DataRuteView from '../views/DataRuteView.vue'
import PerencanaanRuteView from '../views/PerencanaanRuteView.vue'
import PerencanaanPribadiView from '../views/PerencanaanPribadiView.vue'
import PerencanaanPerusahaanView from '../views/PerencanaanPerusahaanView.vue'
import RuteTercepatView from '../views/RuteTercepatView.vue'
import TandaiLokasiView from '../views/TandaiLokasiView.vue'
import ManagementUserView from '../views/ManagementUserView.vue'
import PengumumanView from '../views/PengumumanView.vue'
import ProfileView from '../views/ProfileView.vue'
import LaporanView from '../views/LaporanView.vue'
import LaporanPetugasView from '../views/LaporanPetugasView.vue'
import MonitoringView from '../views/MonitoringView.vue'
import LaporanStatistikView from '../views/LaporanStatistikView.vue'
import DesktopAdminView from '../views/DesktopAdminView.vue'

const routes = [
  // === HALAMAN PUBLIK ===
  { path: '/', component: SplashView },
  { path: '/login', component: LoginView },

  // === HALAMAN UMUM (Bisa diakses Admin & Petugas) ===
  // Ditambahkan meta: { requiresAuth: true } agar wajib login
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/profil', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/jadwal', component: JadwalView, meta: { requiresAuth: true } },
  { path: '/pengumuman', component: PengumumanView, meta: { requiresAuth: true } },
  { path: '/rute', component: RuteMenuView, meta: { requiresAuth: true } },
  { path: '/rute/data', component: DataRuteView, meta: { requiresAuth: true } },
  { path: '/rute/perencanaan', component: PerencanaanRuteView, meta: { requiresAuth: true } },
  { path: '/rute/perencanaan-pribadi', component: PerencanaanPribadiView, meta: { requiresAuth: true } },
  { path: '/rute/perencanaan-perusahaan', component: PerencanaanPerusahaanView, meta: { requiresAuth: true } },
  { path: '/rute/tercepat', component: RuteTercepatView, meta: { requiresAuth: true } },
  { path: '/rute/tandai', component: TandaiLokasiView, meta: { requiresAuth: true } },
  { path: '/laporan', component: LaporanView, meta: { requiresAuth: true } },
  { path: '/laporan/harian', component: LaporanPetugasView, meta: { requiresAuth: true } },

  // === HALAMAN KHUSUS ADMIN ===
  // Ditambahkan meta: { requiresAuth: true, requiresAdmin: true }
  { path: '/arsip-menu', component: ArsipView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/data-box', component: BoxView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/data-arsip', component: DataArsipView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/search-arsip', component: SearchView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/management-user', component: ManagementUserView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/laporan/monitoring', component: MonitoringView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/laporan/statistik', component: LaporanStatistikView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/desktop/dashboard', component: DesktopAdminView, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==========================================
// ROUTE GUARD (SATPAM KEAMANAN APLIKASI)
// ==========================================
router.beforeEach((to, from, next) => {
  // 1. Ambil status login dan role dari penyimpanan lokal
  const isAuthenticated = !!localStorage.getItem('userId')
  const userRole = localStorage.getItem('role')

  // 2. Blokir akses ke halaman dalam jika belum login
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Tampilkan notifikasi toast (opsional)
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Sesi habis, silakan login kembali.', type: 'error' }
    }))
    next('/login')
  }

  // 3. Blokir petugas mengakses halaman khusus Admin
  else if (to.meta.requiresAdmin && userRole !== 'admin') {
    // Tampilkan notifikasi peringatan
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Akses Ditolak! Halaman khusus Administrator.', type: 'error' }
    }))
    // Lempar kembali ke dashboard
    next('/dashboard')
  }

  // 4. Cegah user yang sudah login untuk kembali ke halaman Login/Splash
  else if ((to.path === '/login' || to.path === '/') && isAuthenticated) {
    next('/dashboard')
  }

  // 5. Aman, izinkan lewat
  else {
    next()
  }
})

export default router
