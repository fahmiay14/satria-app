<template>
  <div
    v-if="modelValue"
    class="absolute inset-0 z-[60] bg-black/60 flex flex-col justify-end items-center transition-opacity"
    @click.self="close"
  >
    <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-[#10499b]">
          {{ isEdit ? 'Edit Data Box' : 'Tambah Box Baru' }}
        </h3>
        <button @click="close" class="text-gray-400 hover:text-red-500 transition">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body Form -->
      <div class="p-6">
        <form @submit.prevent="submitForm" class="space-y-4">

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Box</label>
            <input
              type="text"
              v-model="formData.nama_box"
              required
              placeholder="Contoh: BOX A-01"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm font-medium"
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Range Isi (Nomor Surat)</label>
            <div class="flex items-center gap-3">
              <input
                type="number"
                v-model="formData.range_awal"
                required
                placeholder="Dari"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm font-medium text-center"
              >
              <span class="font-bold text-gray-400">-</span>
              <input
                type="number"
                v-model="formData.range_akhir"
                required
                placeholder="Sampai"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm font-medium text-center"
              >
            </div>
            <p class="text-[10px] text-gray-500 mt-1.5">*Arsip dengan nomor surat di antara range ini akan otomatis dianggap masuk ke box ini.</p>
          </div>

          <div class="pt-4 pb-2">
            <button
              type="submit"
              class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm"
            >
              Simpan Data Box
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
  editData: Object
})
const emit = defineEmits(['update:modelValue', 'save'])

const formData = ref({
  id: null,
  nama_box: '',
  range_awal: '',
  range_akhir: '',
  created_at: null
})

const isEdit = computed(() => !!props.editData)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editData) {
      formData.value = { ...props.editData }
    } else {
      formData.value = {
        id: null,
        nama_box: '',
        range_awal: '',
        range_akhir: '',
        created_at: null
      }
    }
  }
})

function submitForm() {
  if (parseInt(formData.value.range_awal) > parseInt(formData.value.range_akhir)) {
    alert("Range Awal tidak boleh lebih besar dari Range Akhir!")
    return
  }

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
