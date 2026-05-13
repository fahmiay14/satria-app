<template>
  <div
    class="bg-[#10499b] flex h-screen flex-col justify-center items-center relative overflow-hidden"
  >
    <!-- Logo -->
    <div class="flex flex-col items-center">
      <div class="relative w-60 h-60 mb-2 flex items-center justify-center">
        <img
          src="https://i.ibb.co.com/wN4sQBr5/logoo.png"
          alt="Logo Bapenda"
          class="w-full h-full object-contain drop-shadow-md"
          @error="$event.target.src='https://via.placeholder.com/150?text=Logo+Error'"
        />
      </div>

      <h1 class="text-2xl font-bold tracking-widest text-white">
        SATRIA
      </h1>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-10 text-center w-full px-4">
      <p class="text-xs text-white mb-1">Dipersembahkan oleh</p>

      <div class="flex items-center justify-center gap-1 mb-2">
        <span class="font-bold text-white text-xl tracking-tighter">
          bap<span class="text-white">e</span>nda
        </span>
      </div>

      <p class="text-xs text-white">
        Versi Aplikasi : 3.0.0 (Vue)
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/login')
  }, 3000)
})
</script>
