<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden relative">

    <!-- Header -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button
        @click="router.push('/dashboard')"
        class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>

      <h1 class="text-lg font-medium">
        Pusat Laporan
      </h1>
    </div>

    <!-- Body -->
    <div class="flex-1 px-5 mt-5 pb-5 overflow-y-auto">

      <div class="mb-6">
        <h2 class="text-xl font-black text-gray-800">Pilih Jenis Laporan</h2>
        <p class="text-xs text-gray-500 mt-1">Pantau aktivitas lapangan dan rekapitulasi data sistem.</p>
      </div>

      <div class="space-y-4">

        <!-- 1. Monitoring Peta (HANYA ADMIN) -->
        <button
          v-if="role === 'admin'"
          @click="goTo('/laporan/monitoring')"
          class="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition active:scale-95 flex items-center gap-4 group text-left relative overflow-hidden"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
          <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0 ml-2">
            <span class="material-symbols-outlined text-[28px]">map</span>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 text-base">Monitoring Lapangan</h4>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Pantau titik lokasi penugasan dan sebaran area setiap petugas via peta interaktif.
            </p>
          </div>
          <span class="material-symbols-outlined text-gray-300 group-hover:text-blue-500 transition-colors">chevron_right</span>
        </button>

        <!-- 2. Laporan Petugas (Kalender) -->
        <button
          @click="goTo('/laporan/harian')"
          class="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-green-300 transition active:scale-95 flex items-center gap-4 group text-left relative overflow-hidden"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-2xl"></div>
          <div class="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0 ml-2">
            <span class="material-symbols-outlined text-[28px]">edit_calendar</span>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 text-base">Laporan Petugas</h4>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Cek riwayat penugasan, progress lapangan, dan bukti kunjungan berdasarkan tanggal.
            </p>
          </div>
          <span class="material-symbols-outlined text-gray-300 group-hover:text-green-500 transition-colors">chevron_right</span>
        </button>

        <!-- 3. Statistik (HANYA ADMIN) -->
        <button
          v-if="role === 'admin'"
          @click="goTo('/laporan/statistik')"
          class="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition active:scale-95 flex items-center gap-4 group text-left relative overflow-hidden"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 rounded-l-2xl"></div>
          <div class="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 shrink-0 ml-2">
            <span class="material-symbols-outlined text-[28px]">pie_chart</span>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 text-base">Statistik & Angka</h4>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Lihat grafik, total arsip, capaian target bulanan, dan cetak laporan PDF.
            </p>
          </div>
          <span class="material-symbols-outlined text-gray-300 group-hover:text-orange-500 transition-colors">chevron_right</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const role = localStorage.getItem('role') || 'petugas'

function goTo(path) {
  router.push(path)
}
</script>
