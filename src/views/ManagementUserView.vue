<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0 z-20">
      <button @click="router.push('/dashboard')" class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-medium">Manajemen Pengguna</h1>
    </div>

    <!-- KONTEN UTAMA -->
    <div class="flex-1 overflow-y-auto px-5 py-6">

      <button
        @click="openTambahModal"
        class="w-full bg-[#10499b] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2 mb-6"
      >
        <span class="material-symbols-outlined">person_add</span>
        Tambah Pengguna Baru
      </button>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-10">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-blue-700 font-bold text-sm">Memuat data pengguna...</p>
      </div>

      <!-- State Kosong -->
      <div v-else-if="usersList.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
        <p class="text-gray-500 font-medium text-sm">Belum ada pengguna terdaftar.</p>
      </div>

      <!-- Daftar Pengguna -->
      <div v-else class="space-y-3">
        <div
          v-for="user in usersList" :key="user.id"
          class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative group flex items-center justify-between"
        >
          <div class="flex items-center gap-4 min-w-0">
            <!-- Avatar Inisial dengan Warna User -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 uppercase text-white shadow-inner border border-black/5"
              :style="{ backgroundColor: user.warna || '#94a3b8' }"
            >
              {{ getInitials(user.nama_lengkap) }}
            </div>

            <div class="min-w-0 pr-4">
              <h3 class="font-bold text-gray-800 text-base truncate">{{ user.nama_lengkap }}</h3>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                <p class="text-[11px] text-gray-500 font-mono">NIK: {{ user.nik }}</p>
                <!-- Badge Role -->
                <span
                  class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max"
                  :class="user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'"
                >
                  {{ user.role === 'admin' ? 'Administrator' : 'Petugas' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex gap-2 shrink-0">
            <button @click="openEditModal(user)" class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition active:scale-95">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button @click="hapusUser(user)" class="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition active:scale-95">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- BOTTOM SHEET / MODAL (Tambah/Edit User) -->
    <div v-if="showModal" class="absolute inset-0 z-50 bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up">

        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-black text-[#10499b]">{{ isEdit ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-red-500 bg-gray-100 p-1 rounded-full"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <form @submit.prevent="simpanUser" class="space-y-4">

            <!-- Input Nama Lengkap -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input
                v-model="formData.nama_lengkap"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <!-- Input NIK / NIP -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">NIK / NIP</label>
                <input
                  v-model="formData.nik"
                  type="text"
                  required
                  placeholder="Contoh: 1122"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium lowercase"
                >
              </div>

              <!-- Input Warna Penanda -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Warna Pin</label>
                <div class="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition">
                  <input
                    v-model="formData.warna"
                    type="color"
                    required
                    class="w-10 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  >
                  <span class="text-xs font-mono font-medium text-gray-600 uppercase flex-1 text-center">{{ formData.warna }}</span>
                </div>
              </div>
            </div>

            <!-- Input Password -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                {{ isEdit ? 'Password Baru (Kosongkan jika tak diubah)' : 'Password' }}
              </label>
              <input
                v-model="formData.password"
                type="text"
                :required="!isEdit"
                placeholder="Masukkan password"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              >
            </div>

            <!-- Pilihan Role -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Hak Akses</label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  class="flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition active:scale-95"
                  :class="formData.role === 'petugas' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                >
                  <input type="radio" v-model="formData.role" value="petugas" class="hidden">
                  <span class="material-symbols-outlined text-[18px]">person</span>
                  <span class="text-[11px] font-bold uppercase tracking-wide">Petugas</span>
                </label>

                <label
                  class="flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition active:scale-95"
                  :class="formData.role === 'admin' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                >
                  <input type="radio" v-model="formData.role" value="admin" class="hidden">
                  <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span class="text-[11px] font-bold uppercase tracking-wide">Admin</span>
                </label>
              </div>
            </div>

            <!-- Tombol Simpan -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="isSaving"
                class="w-full bg-[#10499b] hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2"
              >
                <span v-if="isSaving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined text-[18px]">save</span>
                {{ isSaving ? 'Menyimpan...' : 'Simpan Pengguna' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../services/firebase'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'

const router = useRouter()

// === STATE ===
const usersList = ref([])
const isLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const isSaving = ref(false)

const formData = ref({
  id: null,
  nama_lengkap: '',
  nik: '',
  password: '',
  role: 'petugas',
  warna: '#10499b' // Default warna
})

const usersPath = ['artifacts', 'SatriaApp', 'public', 'data', 'users_account']

onMounted(() => {
  loadUsers()
})

function getInitials(name) {
  if (!name) return 'U'
  const words = name.trim().split(' ')
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

// Generate Warna Random Hexadecimal untuk User Baru
function generateRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
}

async function loadUsers() {
  isLoading.value = true
  try {
    const snapshot = await getDocs(collection(db, ...usersPath))
    usersList.value = snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() }))
  } catch (error) {
    console.error("Gagal memuat pengguna:", error)
  } finally {
    isLoading.value = false
  }
}

function openTambahModal() {
  isEdit.value = false
  formData.value = {
    id: null,
    nama_lengkap: '',
    nik: '',
    password: '',
    role: 'petugas',
    warna: generateRandomColor() // Buatkan warna random saat tambah baru
  }
  showModal.value = true
}

function openEditModal(user) {
  isEdit.value = true
  formData.value = {
    ...user,
    warna: user.warna || generateRandomColor(), // Pertahankan warna lama, jika null beri random
    password: '' // Kosongkan password di form edit
  }
  showModal.value = true
}

async function simpanUser() {
  const nikBersih = formData.value.nik.trim().toLowerCase().replace(/\s+/g, '')
  if (!nikBersih) {
    alert("NIK / NIP tidak valid!")
    return
  }

  isSaving.value = true

  try {
    // PAYLOAD BERSIH (nama_lengkap, nik, role, warna)
    const payload = {
      nama_lengkap: formData.value.nama_lengkap,
      nik: nikBersih,
      role: formData.value.role,
      warna: formData.value.warna,
      updatedAt: new Date().toISOString()
    }

    let docId = formData.value.id

    if (!isEdit.value) {
      docId = `USER-${Date.now()}`
      payload.password = formData.value.password
      payload.createdAt = new Date().toISOString()
    } else {
      if (formData.value.password) {
        payload.password = formData.value.password
      }
    }

    await setDoc(doc(db, ...usersPath, docId), payload, { merge: true })

    await loadUsers()
    showModal.value = false

    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pengguna ${payload.nama_lengkap} berhasil disimpan!` } }))

  } catch (error) {
    console.error("Gagal menyimpan pengguna:", error)
    alert("Terjadi kesalahan saat menyimpan pengguna.")
  } finally {
    isSaving.value = false
  }
}

async function hapusUser(user) {
  const currentLogin = localStorage.getItem('nik')
  if (user.nik === currentLogin) {
    alert("Anda tidak bisa menghapus akun Anda sendiri saat sedang login!")
    return
  }

  if(confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus akun '${user.nama_lengkap}' secara permanen?`)) {
    try {
      await deleteDoc(doc(db, ...usersPath, user.id))
      await loadUsers()
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Akun berhasil dihapus!` } }))
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error)
    }
  }
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

/* Mempercantik input type color */
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>
