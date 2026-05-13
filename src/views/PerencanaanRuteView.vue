<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center shadow-md pt-6 shrink-0 z-20 gap-4">
      <button @click="router.push('/rute')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Menu Perencanaan</h1>
    </div>

    <!-- BODY -->
    <div class="flex-1 px-5 pt-10 pb-4 overflow-y-auto">

      <div class="mb-8 text-center">
        <h2 class="text-xl font-black text-[#10499b] tracking-wide mb-2">Pilih Kategori Rute</h2>
        <p class="text-sm text-gray-500 font-medium leading-relaxed">Tentukan data rute lokasi mana yang ingin Anda petakan dan tugaskan kepada petugas.</p>
      </div>

      <div class="flex flex-col gap-5">

        <!-- CARD PERUSAHAAN -->
        <button
          @click="router.push('/rute/perencanaan-perusahaan')"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition active:scale-95 flex flex-col items-center text-center gap-4 relative overflow-hidden group"
        >
          <div class="absolute inset-0 bg-blue-50 transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></div>
          <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center relative z-10 shadow-inner">
            <span class="material-symbols-outlined text-[32px]">domain</span>
          </div>
          <div class="relative z-10">
            <h3 class="text-lg font-black text-gray-800 mb-1">Rute Perusahaan</h3>
            <p class="text-xs text-gray-500 px-4">Kelola dan petakan lokasi perusahaan resmi dari database terpusat.</p>
          </div>
        </button>

        <!-- CARD PRIBADI -->
        <button
          @click="router.push('/rute/perencanaan-pribadi')"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition active:scale-95 flex flex-col items-center text-center gap-4 relative overflow-hidden group"
        >
          <div class="absolute inset-0 bg-green-50 transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></div>
          <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center relative z-10 shadow-inner">
            <span class="material-symbols-outlined text-[32px]">person_pin_circle</span>
          </div>
          <div class="relative z-10">
            <h3 class="text-lg font-black text-gray-800 mb-1">Rute Pribadi</h3>
            <p class="text-xs text-gray-500 px-4">Kelola dan petakan titik lokasi yang Anda tandai sendiri dari lapangan.</p>
          </div>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
