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

const routes = [
  { path: '/', component: SplashView },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
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
  { path: '/search-arsip', component: SearchView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
