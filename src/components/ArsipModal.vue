<template>
  <!-- Overlay -->
  <div
    v-if="modelValue"
    class="absolute inset-0 z-[60] bg-black/60 flex flex-col justify-end items-center transition-opacity"
    @click.self="close"
  >
    <!-- Modal Content -->
    <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col max-h-[90vh] animate-slide-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 class="text-lg font-bold text-gray-800">
          {{ isEdit ? 'Edit Data Arsip' : 'Tambah Data Arsip' }}
        </h3>
        <button @click="close" class="text-gray-400 hover:text-red-500 transition">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body Form -->
      <div class="p-6 overflow-y-auto">
        <form @submit.prevent="submitForm" class="space-y-4">

          <!-- NOMOR SURAT -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nomor Surat</label>
            <input
              type="number"
              v-model="formData.no_surat"
              :readonly="!isEdit"
              :class="[
                'w-full border border-gray-300 rounded-lg px-4 py-3 transition text-sm font-medium',
                !isEdit
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed focus:outline-none'
                  : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
              ]"
            >
            <p v-if="!isEdit" class="text-[10px] text-gray-500 mt-1">*Nomor terisi otomatis dan tidak dapat diubah saat penambahan.</p>
          </div>

          <!-- NOPOL KENDARAAN -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">No Polisi Kendaraan</label>
            <div class="flex gap-2">
              <!-- Kolom 1: Huruf -->
              <input
                ref="nopol1Ref"
                type="text"
                v-model="formData.nopol1"
                @input="handleNopol1"
                maxlength="2"
                required
                class="w-16 border border-gray-300 rounded-lg px-2 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase text-center text-sm font-bold"
              >

              <!-- Kolom 2: Wajib Angka & Auto Pindah -->
              <input
                ref="nopol2Ref"
                type="text"
                v-model="formData.nopol2"
                @input="handleNopol2"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="4"
                placeholder="XXXX"
                required
                class="flex-1 border border-gray-300 rounded-lg px-2 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase text-center text-sm font-bold"
              >

              <!-- Kolom 3: Huruf -->
              <input
                ref="nopol3Ref"
                type="text"
                v-model="formData.nopol3"
                @input="handleNopol3"
                maxlength="3"
                required
                class="w-20 border border-gray-300 rounded-lg px-2 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase text-center text-sm font-bold"
              >
            </div>
          </div>

          <!-- STATUS ARSIP -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Status Arsip</label>
            <div class="relative">
              <select
                v-model="formData.status"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition appearance-none text-sm font-bold text-gray-700"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Dipinjam">Dipinjam</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          <!-- TOMBOL SIMPAN -->
          <div class="pt-4 pb-2">
            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95 text-sm"
            >
              Simpan Data Arsip
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useArsipStore } from '../stores/arsip'

const props = defineProps({
  modelValue: Boolean,
  editData: Object
})
const emit = defineEmits(['update:modelValue', 'save'])

const store = useArsipStore()

const formData = ref({
  id: null,
  no_surat: '',
  nopol1: 'B',
  nopol2: '',
  nopol3: '',
  status: 'Tersedia',
  created_at: null
})

const isEdit = computed(() => !!props.editData)

// Referensi DOM untuk memindahkan fokus
const nopol1Ref = ref(null)
const nopol2Ref = ref(null)
const nopol3Ref = ref(null)

// Mengisi Form saat Modal Terbuka
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editData) {
      // MODE EDIT
      formData.value.id = props.editData.id
      formData.value.no_surat = props.editData.no_surat
      formData.value.created_at = props.editData.created_at

      const parts = props.editData.no_polisi.split(' ')
      formData.value.nopol1 = parts[0] || 'B'
      formData.value.nopol2 = parts[1] || ''
      formData.value.nopol3 = parts[2] || ''

      formData.value.status = props.editData.status
    } else {
      // MODE TAMBAH
      formData.value.id = null
      formData.value.nopol1 = 'B'
      formData.value.nopol2 = ''
      formData.value.nopol3 = ''
      formData.value.status = 'Tersedia'
      formData.value.created_at = null

      // Mencari Nomor Surat Terakhir di Database
      const semuaNomor = store.arsipList
        .map(item => parseInt(item.no_surat))
        .filter(num => !isNaN(num))

      const maxNoSurat = semuaNomor.length > 0 ? Math.max(...semuaNomor) : 0
      formData.value.no_surat = (maxNoSurat + 1).toString()
    }
  }
})

function handleNopol1() {
  formData.value.nopol1 = formData.value.nopol1.replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (formData.value.nopol1.length === 2) nopol2Ref.value?.focus()
}

function handleNopol2() {
  formData.value.nopol2 = formData.value.nopol2.replace(/\D/g, '')
  if (formData.value.nopol2.length === 4) nopol3Ref.value?.focus()
}

function handleNopol3() {
  formData.value.nopol3 = formData.value.nopol3.replace(/[^a-zA-Z]/g, '').toUpperCase()
}

function submitForm() {
  const nopolGabungan = `${formData.value.nopol1} ${formData.value.nopol2} ${formData.value.nopol3}`.trim()

  // Mencari apakah nomor surat ini masuk ke box mana
  const namaBoxTerkait = store.cariLokasiBox(formData.value.no_surat)

  emit('save', {
    id: formData.value.id,
    no_surat: parseInt(formData.value.no_surat),
    no_polisi: nopolGabungan,
    status: formData.value.status,
    nama_box: namaBoxTerkait !== 'Belum masuk box' ? namaBoxTerkait : '',
    created_at: formData.value.created_at
  })

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
