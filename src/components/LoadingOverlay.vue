<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"
    >
      <!-- Spinner -->
      <div
        class="w-12 h-12 border-4 border-[#10499b] border-t-transparent rounded-full animate-spin mb-4 shadow-lg"
      ></div>

      <!-- Text -->
      <p
        class="text-[#10499b] font-bold tracking-wider animate-pulse"
      >
        {{ message }}
      </p>

      <p class="text-[10px] text-gray-400 mt-2">
        Mohon tunggu sebentar
      </p>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Memproses...'
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>