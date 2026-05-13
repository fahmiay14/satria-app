<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="item in toasts" :key="item.id"
        class="text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
        :class="toastColor(item.type)"
      >
        <span class="material-symbols-outlined text-lg">{{ toastIcon(item.type) }}</span>
        <p class="text-sm font-medium flex-1">{{ item.message }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const toasts = ref([])

function toastColor(type) {
  if (type === 'success') return 'bg-green-600'
  if (type === 'error') return 'bg-red-600'
  return 'bg-blue-600'
}

function toastIcon(type) {
  if (type === 'success') return 'check_circle'
  if (type === 'error') return 'error'
  return 'info'
}

function show(message, type = 'success') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => { remove(id) }, 3000)
}

function remove(id) {
  toasts.value = toasts.value.filter(item => item.id !== id)
}

// === TAMBAHAN: Pendengar Event Global ===
// Agar komponen lain cukup memanggil: 
// window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '...', type: 'success' } }))
function handleGlobalToast(e) {
  show(e.detail.message, e.detail.type)
}

onMounted(() => {
  window.addEventListener('show-toast', handleGlobalToast)
})

onUnmounted(() => {
  window.removeEventListener('show-toast', handleGlobalToast)
})

defineExpose({ show })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-20px); }
.toast-move { transition: all 0.3s ease; }
</style>