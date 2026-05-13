<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-5"
      @click.self="closeModal"
    >
      <transition name="zoom">
        <div
          v-if="modelValue"
          class="bg-white p-6 rounded-2xl shadow-2xl text-center w-full max-w-[320px]"
        >
          <!-- Icon -->
          <div
            class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"
          >
            <span class="material-symbols-outlined text-4xl">
              warning
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-800 mb-1">
            Konfirmasi Hapus
          </h3>

          <!-- Text -->
          <p
            class="text-sm text-gray-500 mb-6 leading-relaxed"
          >
            Apakah Anda yakin ingin menghapus
            <br />

            <b class="text-gray-800">
              {{ label }}
            </b>

            <br />

            secara permanen?
          </p>

          <!-- Button -->
          <div class="flex gap-3">
            <button
              @click="closeModal"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition active:scale-95 text-sm"
            >
              Batal
            </button>

            <button
              @click="confirmDelete"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl shadow-md transition active:scale-95 text-sm"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  label: {
    type: String,
    default: 'data ini'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'confirm'
])

function closeModal() {
  emit('update:modelValue', false)
}

function confirmDelete() {
  emit('confirm')
  closeModal()
}
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

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.25s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>