<template>
  <!-- Ganti min-h-screen menjadi h-[100dvh] dan tambahkan overflow-hidden -->
  <div class="bg-gray-300 h-[100dvh] w-full flex justify-center overflow-hidden">
    <!-- Ganti min-h-screen menjadi h-full -->
    <div class="w-full max-w-[450px] h-full bg-white shadow-xl relative overflow-hidden flex flex-col">
      
      <!-- Tambahkan overflow-hidden di sini agar membatasi halaman di dalamnya -->
      <router-view class="flex-1 overflow-hidden flex flex-col" />

      <SyncFooter />
      <AppToast />
      
    </div>
  </div>
</template>

<script setup>
import SyncFooter from './components/SyncFooter.vue'
import AppToast from './components/AppToast.vue'
</script>