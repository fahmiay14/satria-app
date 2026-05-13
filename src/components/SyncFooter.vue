<!-- src/components/SyncFooter.vue -->
<template>
  <div
    class="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[45] flex flex-col transition-transform duration-500 transform shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
    :class="store.sync.visible ? 'translate-y-0' : 'translate-y-full'"
  >
    <!-- Progress Bar Line -->
    <div class="h-1.5 w-full bg-gray-100 overflow-hidden">
      <div
        class="h-full transition-all duration-500 ease-out"
        :class="store.sync.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'"
        :style="{ width: store.sync.progress + '%' }"
      ></div>
    </div>
    
    <!-- Text & Icon -->
    <div class="flex justify-between items-center px-4 py-2">
      <span
        class="text-[11px] font-bold"
        :class="store.sync.color === 'blue' ? 'text-blue-600' : 'text-green-600'"
      >
        {{ store.sync.text }}
      </span>
      <span
        class="material-symbols-outlined text-[16px]"
        :class="[
          store.sync.color === 'blue' ? 'text-blue-500 animate-spin' : 'text-green-500'
        ]"
      >
        {{ store.sync.icon }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useArsipStore } from '../stores/arsip'

// Hubungkan dengan store arsip
const store = useArsipStore()
</script>