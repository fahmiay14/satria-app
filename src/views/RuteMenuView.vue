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
        Menu Optimasi Rute
      </h1>
    </div>

    <!-- Body -->
    <div class="flex-1 px-5 mt-5 pb-5 overflow-y-auto">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-full">

        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-blue-500">route</span>
          <h3 class="font-bold text-gray-800">
            Manajemen Lokasi
          </h3>
        </div>

        <div class="space-y-4">

          <!-- 1. Data Rute -->
          <button
            @click="goTo('/rute/data')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                <span class="material-symbols-outlined">list_alt</span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Data Rute
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  Kelola daftar lokasi/perusahaan yang sering dikunjungi.
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">chevron_right</span>
          </button>

          <hr class="border-gray-100" />

          <!-- 2. Perencanaan Rute (Map) -->
          <button
            @click="goTo('/rute/perencanaan')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 shrink-0">
                <span class="material-symbols-outlined">map</span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Perencanaan Rute
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  Pemetaan lokasi dan pembagian rute untuk setiap tim petugas.
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">chevron_right</span>
          </button>

          <hr class="border-gray-100" />

          <!-- 3. Rute Tercepat (Optimasi) -->
          <button
            @click="goTo('/rute/tercepat')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                <span class="material-symbols-outlined">route</span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Rute Tercepat
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  Kalkulasi algoritma terdekat & buat link Google Maps.
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">chevron_right</span>
          </button>

          <hr class="border-gray-100" />

          <!-- 4. Menandai Lokasi -->
          <button
            @click="goTo('/rute/tandai')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                <span class="material-symbols-outlined">add_location_alt</span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Menandai Lokasi
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  Tandai dan simpan koordinat lokasi baru di lapangan.
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">chevron_right</span>
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  // Mengaktifkan navigasi halaman secara nyata
  router.push(path)
}
</script>
