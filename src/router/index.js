import { createRouter, createWebHistory } from 'vue-router'

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
  { path: '/', component: SplashView },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
  { path: '/profil', component: ProfileView },
  { path: '/arsip-menu', component: ArsipView },
  { path: '/data-box', component: BoxView },
  { path:'/data-arsip', component: DataArsipView },
  { path: '/jadwal', component: JadwalView},
  { path: '/rute', component: RuteMenuView},
  { path: '/rute/data', component: DataRuteView},
  { path: '/rute/perencanaan', component: PerencanaanRuteView},
  { path: '/rute/perencanaan-pribadi', component: PerencanaanPribadiView},
  { path: '/rute/perencanaan-perusahaan', component: PerencanaanPerusahaanView},
  { path: '/rute/tercepat', component: RuteTercepatView},
  { path: '/rute/tandai', component: TandaiLokasiView},
  { path: '/search-arsip', component: SearchView },
  { path: '/management-user', component: ManagementUserView },
  { path: '/pengumuman', component: PengumumanView },
  { path: '/laporan', component: LaporanView },
  { path: '/laporan/harian', component: LaporanPetugasView },
  { path: '/laporan/monitoring', component: MonitoringView },
  { path: '/laporan/statistik', component: LaporanStatistikView },
  { path: '/desktop/dashboard', component: DesktopAdminView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
