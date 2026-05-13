<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <!-- Header -->
    <div
      class="bg-[#10499b] text-white px-4 py-4 flex items-center gap-4 shadow-md pt-6 shrink-0"
    >
      <button
        @click="router.push('/dashboard')"
        class="p-1 hover:bg-white/10 rounded-full transition flex items-center justify-center"
      >
        <span class="material-symbols-outlined">
          arrow_back
        </span>
      </button>

      <h1 class="text-lg font-medium">
        Menu Arsip
      </h1>
    </div>

    <!-- Body -->
    <div class="flex-1 px-5 mt-5 pb-5 overflow-y-auto">
      <div
        class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-full"
      >
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-blue-500">
            folder_open
          </span>

          <h3 class="font-bold text-gray-800">
            Kategori Arsip
          </h3>
        </div>

        <div class="space-y-4">
          <!-- Data Arsip -->
          <button
            @click="router.push('/data-arsip')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"
              >
                <span class="material-symbols-outlined">
                  inventory
                </span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Data Arsip
                </h4>

                <p class="text-xs text-gray-500 mt-1">
                  Kelola seluruh data arsip
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">
              chevron_right
            </span>
          </button>

          <hr class="border-gray-100" />

          <!-- Data Box -->
          <button
            @click="router.push('/data-box')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500"
              >
                <span class="material-symbols-outlined">
                  inventory_2
                </span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Data Box
                </h4>

                <p class="text-xs text-gray-500 mt-1">
                  Manajemen penyimpanan box
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">
              chevron_right
            </span>
          </button>

          <hr class="border-gray-100" />

          <!-- Search -->
          <button
            @click="router.push('/search-arsip')"
            class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500"
              >
                <span class="material-symbols-outlined">
                  search
                </span>
              </div>

              <div class="text-left">
                <h4 class="font-bold text-sm text-gray-800">
                  Pencarian Arsip
                </h4>

                <p class="text-xs text-gray-500 mt-1">
                  Cari arsip berdasarkan nopol
                </p>
              </div>
            </div>

            <span class="material-symbols-outlined text-blue-600">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>