<template>
  <div class="fixed inset-0 z-[100] bg-[#10499b] flex flex-col justify-center items-center overflow-hidden">

    <!-- Logo -->
    <div class="flex flex-col items-center animate-pulse">
      <div class="relative w-60 h-60 mb-2 flex items-center justify-center">
        <img
          src="https://i.ibb.co.com/wN4sQBr5/logoo.png"
          alt="Logo Bapenda"
          class="w-full h-full object-contain drop-shadow-2xl"
          @error="$event.target.src='https://via.placeholder.com/150?text=Logo+Error'"
        />
      </div>
      <h1 class="text-3xl font-black tracking-widest text-white mt-2 drop-shadow-lg">SATRIA</h1>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-10 text-center w-full px-4">
      <p class="text-xs text-blue-200 mb-1 font-medium tracking-wide">Dipersembahkan oleh</p>
      <div class="flex items-center justify-center gap-1 mb-4">
        <span class="font-black text-white text-2xl tracking-tighter drop-shadow-md">
          bap<span class="text-blue-300">e</span>nda
        </span>
      </div>
      <p class="text-[10px] text-blue-200/60 font-bold tracking-[0.2em] uppercase">Versi Aplikasi : 3.0.0 (Vue)</p>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    // CEK SESI LOGIN DI SINI
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')

    if (userId && role) {
      // Jika sudah pernah login, langsung lempar ke Dashboard
      router.push('/dashboard')
    } else {
      // Jika belum, lempar ke halaman Login
      router.push('/login')
    }
  }, 4000) // Waktu splash screen sedikit dipersingkat jadi 2.5 detik
})
</script>
