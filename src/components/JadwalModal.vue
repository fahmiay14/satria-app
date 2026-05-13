<template>
  <div
    v-if="modelValue"
    class="absolute inset-0 z-[60] bg-black/60 flex flex-col justify-end items-center transition-opacity"
    @click.self="close"
  >
    <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col max-h-[90vh] animate-slide-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 class="text-lg font-bold text-gray-800">
          {{ isEdit ? 'Edit Jadwal' : 'Tambah Jadwal' }}
        </h3>
        <button @click="close" class="text-gray-400 hover:text-red-500 transition">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body Form -->
      <div class="p-6 overflow-y-auto">
        <form @submit.prevent="submitForm" class="space-y-4">

          <!-- Judul Kegiatan -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Judul Kegiatan</label>
            <input
              type="text"
              v-model="formData.title"
              required
              placeholder="Contoh: Penelusuran Tambun"
              class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10499b] focus:outline-none transition text-sm font-medium"
            >
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Tanggal -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                v-model="formData.date"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10499b] focus:outline-none transition text-sm font-medium"
              >
            </div>
            <!-- Waktu -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Waktu</label>
              <input
                type="time"
                v-model="formData.time"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10499b] focus:outline-none transition text-sm font-medium"
              >
            </div>
          </div>

          <!-- Lokasi -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
            <input
              type="text"
              v-model="formData.location"
              required
              placeholder="Contoh: Perumahan Galaxy"
              class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#10499b] focus:outline-none transition text-sm font-medium"
            >
          </div>

          <!-- Tipe Kegiatan -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Kategori Kegiatan</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all"
                :class="formData.type === 'lapangan' ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
              >
                <input type="radio" v-model="formData.type" value="lapangan" class="hidden">
                <span class="material-symbols-outlined text-[18px]">two_wheeler</span> Lapangan
              </label>

              <label
                class="border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all"
                :class="formData.type === 'rapat' ? 'border-green-500 bg-green-50 text-green-600 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
              >
                <input type="radio" v-model="formData.type" value="rapat" class="hidden">
                <span class="material-symbols-outlined text-[18px]">groups</span> Rapat
              </label>
            </div>
          </div>

          <!-- Tombol Simpan -->
          <div class="pt-4 pb-2">
            <button
              type="submit"
              class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95 text-sm"
            >
              Simpan Jadwal
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  editData: Object,
  selectedDate: String // Tanggal yang sedang diklik di kalender
})
const emit = defineEmits(['update:modelValue', 'save'])

const formData = ref({
  id: null,
  title: '',
  date: '',
  time: '08:00',
  location: '',
  type: 'lapangan'
})

const isEdit = computed(() => !!props.editData)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editData) {
      formData.value = { ...props.editData }
    } else {
      formData.value = {
        id: null,
        title: '',
        date: props.selectedDate, // Otomatis isi dengan tanggal yang disorot
        time: '08:00',
        location: '',
        type: 'lapangan'
      }
    }
  }
})

function submitForm() {
  emit('save', { ...formData.value })
  close()
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
</style>
