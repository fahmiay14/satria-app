<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center"
      @click.self="closeModal"
    >
      <transition name="sheet">
        <div
          v-if="modelValue"
          class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0"
          >
            <h3 class="text-lg font-bold text-gray-800">
              {{ isEdit ? 'Edit Data Box' : 'Tambah Data Box' }}
            </h3>

            <button
              @click="closeModal"
              class="text-gray-400 hover:text-red-500 transition"
            >
              <span class="material-symbols-outlined">
                close
              </span>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto">
            <form
              class="space-y-4"
              @submit.prevent="saveData"
            >
              <!-- Nama Box -->
              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Nama Box
                </label>

                <input
                  v-model="form.nama"
                  type="text"
                  placeholder="Contoh: BOX-A05"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition uppercase text-sm"
                />
              </div>

              <!-- Range -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Range Awal
                  </label>

                  <input
                    v-model="form.awal"
                    type="number"
                    placeholder="1124"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Range Akhir
                  </label>

                  <input
                    v-model="form.akhir"
                    type="number"
                    placeholder="2212"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition text-sm"
                  />
                </div>
              </div>

              <!-- Button -->
              <div class="pt-4 pb-2">
                <button
                  type="submit"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95 text-sm"
                >
                  Simpan Data Box
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update:modelValue',
  'save'
])

const form = reactive({
  id: null,
  nama: '',
  awal: '',
  akhir: ''
})

const isEdit = computed(() => !!props.editData)

watch(
  () => props.modelValue,
  value => {
    if (value) {
      fillForm()
    }
  }
)

function fillForm() {
  if (props.editData) {
    const range =
      props.editData.range.split('-')

    form.id = props.editData.id
    form.nama = props.editData.nama
    form.awal = range[0]?.trim() || ''
    form.akhir = range[1]?.trim() || ''
  } else {
    form.id = null
    form.nama = ''
    form.awal = ''
    form.akhir = ''
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

function saveData() {
  emit('save', {
    id: form.id || Date.now(),
    nama: form.nama.toUpperCase(),
    range: `${form.awal} - ${form.akhir}`
  })

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

.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
