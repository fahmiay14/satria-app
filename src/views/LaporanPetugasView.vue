<template>
  <div class="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden font-sans relative">

    <!-- HEADER -->
    <div class="bg-[#10499b] text-white px-4 py-4 pt-6 flex items-center gap-4 shadow-md shrink-0 z-20">
      <button @click="router.push('/laporan')" class="p-1 hover:bg-white/10 rounded-full transition">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-lg font-semibold tracking-wide flex-1">
        {{ role === 'admin' ? 'Pantau Laporan Harian' : 'Laporan Harian' }}
      </h1>
      <!-- TOMBOL CETAK PDF -->
      <button @click="bukaOpsiCetakLaporan" class="p-2 hover:bg-white/20 rounded-full transition flex items-center justify-center bg-white/10">
        <span class="material-symbols-outlined">print</span>
      </button>
    </div>

    <!-- KALENDER CARD -->
    <div class="bg-white rounded-b-3xl shadow-sm px-5 pt-4 pb-4 shrink-0 z-10 relative">
      <div class="flex justify-between items-center mb-4">
        <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"><span class="material-symbols-outlined">chevron_left</span></button>
        <h2 class="text-[#10499b] font-bold text-sm uppercase tracking-wide">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
        <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition"><span class="material-symbols-outlined">chevron_right</span></button>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-1 text-center">
        <span v-for="day in dayNames" :key="day" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ day }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div v-for="blank in firstDayOfMonth" :key="'blank-' + blank" class="aspect-[4/3]"></div>

        <button
          v-for="day in daysInMonth"
          :key="day.date"
          @click="selectDate(day.fullDate)"
          class="aspect-[4/3] flex flex-col items-center justify-center relative rounded-xl transition-all duration-200"
          :class="[
            selectedDate === day.fullDate ? 'bg-[#10499b] text-white shadow-md transform scale-105' : 'text-gray-700 hover:bg-blue-50 active:bg-blue-100',
            isToday(day.fullDate) && selectedDate !== day.fullDate ? 'border border-[#10499b] text-[#10499b] font-bold' : ''
          ]"
        >
          <span class="text-sm font-semibold relative z-10">{{ day.date }}</span>
          <div v-if="day.hasReport" class="absolute bottom-1 w-1.5 h-1.5 rounded-full" :class="selectedDate === day.fullDate ? 'bg-white' : 'bg-green-500'"></div>
        </button>
      </div>
    </div>

    <!-- DAFTAR LAPORAN HARIAN -->
    <div class="flex-1 overflow-y-auto px-5 pt-5 pb-24 relative bg-gray-50">

      <!-- STICKY HEADER & FILTER VERIFIKASI -->
      <div class="sticky top-0 bg-gray-50/95 backdrop-blur-sm pt-2 pb-3 z-10 border-b border-gray-100 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-800 text-sm">
            Laporan: <span class="text-[#10499b]">{{ formatSelectedDate }}</span>
          </h3>
          <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg">
            {{ reportsForSelectedDate.length }} Laporan
          </span>
        </div>

        <!-- TAB FILTER STATUS VERIFIKASI -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button @click="filterVerifikasi = 'Semua'" :class="filterVerifikasi === 'Semua' ? 'bg-[#10499b] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'" class="px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition">Semua</button>
          <button @click="filterVerifikasi = 'Belum'" :class="filterVerifikasi === 'Belum' ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'" class="px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition">Belum Diverifikasi</button>
          <button @click="filterVerifikasi = 'Disetujui'" :class="filterVerifikasi === 'Disetujui' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'" class="px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition">Disetujui</button>
          <button @click="filterVerifikasi = 'Ditolak'" :class="filterVerifikasi === 'Ditolak' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'" class="px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition">Ditolak</button>
        </div>
      </div>

      <div v-if="reportsForSelectedDate.length > 0" class="space-y-4">
        <div
          v-for="item in reportsForSelectedDate"
          :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group"
        >
          <!-- Indikator Kunjungan Kiri -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="item.status === 'Telah Dikunjungi' ? 'bg-green-500' : 'bg-red-500'"></div>

          <!-- Badge Status Verifikasi di Kanan Atas -->
          <div class="absolute top-0 right-0 px-2.5 py-1 text-[9px] font-bold uppercase rounded-bl-xl shadow-sm flex items-center gap-1 z-10"
               :class="item.verifikasi === 'Disetujui' ? 'bg-green-500 text-white' : item.verifikasi === 'Ditolak' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'">
            <span class="material-symbols-outlined text-[12px]">
              {{ item.verifikasi === 'Disetujui' ? 'verified' : item.verifikasi === 'Ditolak' ? 'cancel' : 'pending' }}
            </span>
            {{ item.verifikasi === 'Disetujui' ? 'Disetujui' : item.verifikasi === 'Ditolak' ? 'Ditolak' : 'Belum Verifikasi' }}
          </div>

          <div class="flex justify-between items-start mb-2 mt-1">
            <div class="flex-1 min-w-0 pr-24">
              <h4 class="font-bold text-gray-800 text-sm truncate">{{ item.perusahaan }}</h4>
              <!-- Tampilkan nama petugas jika yang login adalah admin -->
              <p v-if="role === 'admin'" class="text-[10px] text-blue-600 font-bold mt-0.5 truncate flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">person</span> {{ item.petugas }}
              </p>
            </div>
          </div>

          <p v-if="item.catatan" class="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg italic">"{{ item.catatan }}"</p>

          <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 flex-wrap gap-2">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]" :class="item.status === 'Telah Dikunjungi' ? 'text-green-500' : 'text-red-500'">
                {{ item.status === 'Telah Dikunjungi' ? 'check_circle' : 'error' }}
              </span>
              <span class="text-[10px] font-bold" :class="item.status === 'Telah Dikunjungi' ? 'text-green-700' : 'text-red-700'">{{ item.status }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[9px] text-gray-400 font-mono font-bold">{{ formatTime(item.timestamp) }}</span>
              <div class="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-[9px] font-bold">
                <span class="material-symbols-outlined text-[12px]">my_location</span>
                GPS Disimpan
              </div>
            </div>

            <!-- ALASAN PENOLAKAN DITAMPILKAN DI SINI JIKA DITOLAK -->
            <div v-if="item.verifikasi === 'Ditolak' && item.alasan_tolak" class="w-full mt-1 bg-red-50 border border-red-100 p-2.5 rounded-xl">
              <p class="text-[9px] font-bold text-red-800 uppercase tracking-wider mb-0.5">Alasan Penolakan:</p>
              <p class="text-xs text-red-600 italic">"{{ item.alasan_tolak }}"</p>
            </div>
          </div>

          <!-- AKSI VERIFIKASI (KHUSUS ADMIN) -->
          <div v-if="role === 'admin' && (!item.verifikasi || item.verifikasi === 'Belum Verifikasi' || item.verifikasi === 'Belum')" class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 bg-gray-50/50 -mx-4 -mb-4 px-4 pb-4">
            <p class="text-[10px] text-gray-500 font-bold flex-1 uppercase tracking-wider">Aksi Verifikasi:</p>
            <button
              @click="prosesVerifikasi(item, 'Disetujui')"
              :disabled="verifyingId === item.id || item.verifikasi === 'Disetujui'"
              class="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:pointer-events-none px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
            >
              <span v-if="verifyingId === item.id" class="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-[14px]">check</span>
              {{ verifyingId === item.id ? 'Memproses...' : 'Setujui' }}
            </button>
            <button
              @click="openRejectModal(item)"
              :disabled="verifyingId === item.id || item.verifikasi === 'Ditolak'"
              class="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:pointer-events-none px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
            >
              <span v-if="verifyingId === item.id" class="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-[14px]">close</span>
              {{ verifyingId === item.id ? 'Memproses...' : 'Tolak' }}
            </button>
          </div>

        </div>
      </div>

      <div v-else class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-2">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
          <span class="material-symbols-outlined text-3xl">assignment</span>
        </div>
        <p class="text-gray-500 font-medium text-sm">Tidak ada laporan</p>
        <p class="text-gray-400 text-xs mt-1">Sesuai dengan filter dan tanggal yang dipilih.</p>
      </div>

    </div>

    <!-- TOMBOL TAMBAH LAPORAN (Hanya untuk PETUGAS dan jika hari ini) -->
    <button
      v-if="role === 'petugas' && isToday(selectedDate)"
      @click="showModal = true"
      class="absolute bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="material-symbols-outlined text-3xl">add_location_alt</span>
    </button>

    <!-- TOMBOL INFO/REKAP LAPORAN (Hanya untuk ADMIN) -->
    <button
      v-if="role === 'admin'"
      @click="bukaAdminSummary"
      class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition active:scale-90 z-30"
    >
      <span class="text-3xl font-black mt-[-2px]">!</span>
    </button>

    <!-- MODAL REKAP ADMIN (Pop up List Petugas) -->
    <div v-if="showAdminSummaryModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showAdminSummaryModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-3xl shrink-0">
          <h3 class="text-lg font-bold text-blue-800 flex items-center gap-2">
            <span class="material-symbols-outlined">analytics</span> Rekap Laporan Bulanan
          </h3>
          <button @click="showAdminSummaryModal = false" class="text-blue-600 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <p class="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold border-b pb-2">
            Periode: {{ monthNames[currentMonth] }} {{ currentYear }}
          </p>

          <div class="space-y-3">
            <div v-if="adminSummaryStats.length === 0" class="text-center text-xs text-gray-400 py-4">
              Belum ada data petugas.
            </div>

            <div
              v-else
              v-for="(stat, index) in adminSummaryStats"
              :key="stat.id || index"
              class="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" :style="{ backgroundColor: stat.warna || '#10499b' }">
                  {{ stat.inisial }}
                </div>
                <span class="font-bold text-gray-700 text-sm">{{ stat.petugas }}</span>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="text-xs font-mono font-bold px-2 py-1.5 rounded-lg border"
                  :class="stat.reported >= stat.assigned && stat.assigned > 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-blue-700 bg-blue-50 border-blue-200'"
                >
                  {{ stat.reported }}/{{ stat.assigned }} Laporan
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL TAMBAH LAPORAN (Khusus Petugas) -->
    <div v-if="showModal" class="absolute inset-0 z-[600] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50 rounded-t-3xl shrink-0">
          <h3 class="text-lg font-bold text-green-800 flex items-center gap-2">
            <span class="material-symbols-outlined">add_location_alt</span> Buat Laporan
          </h3>
          <button @click="showModal = false" class="text-green-600 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="kirimLaporan" class="space-y-4">

            <!-- Pilih Perusahaan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Pilih Lokasi Tujuan</label>
              <select v-model="formData.perusahaan" required class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white font-medium">
                <option value="" disabled>-- Pilih Perusahaan --</option>
                <option v-for="loc in assignedLocations" :key="loc.id" :value="loc.nama">{{ loc.nama }}</option>
              </select>
              <p v-if="assignedLocations.length === 0" class="text-[10px] text-red-500 mt-1">*Anda belum memiliki rute tugas perusahaan.</p>
            </div>

            <!-- Status Laporan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Status Kunjungan</label>
              <div class="grid grid-cols-2 gap-3">
                <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center" :class="formData.status === 'Telah Dikunjungi' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                  <input type="radio" v-model="formData.status" value="Telah Dikunjungi" class="hidden">
                  <span class="material-symbols-outlined">check_circle</span>
                  <span class="text-[10px]">Telah Dikunjungi</span>
                </label>
                <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center" :class="formData.status === 'Terjadi Masalah' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'">
                  <input type="radio" v-model="formData.status" value="Terjadi Masalah" class="hidden">
                  <span class="material-symbols-outlined">error</span>
                  <span class="text-[10px]">Terjadi Masalah</span>
                </label>
              </div>
            </div>

            <!-- Catatan -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Catatan Petugas (Opsional)</label>
              <textarea v-model="formData.catatan" rows="2" placeholder="Contoh: Bertemu dengan Bapak Budi bagian HRD..." class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"></textarea>
            </div>

            <!-- Tombol Laporkan (Mengambil GPS) -->
            <div class="pt-2">
              <button type="submit" :disabled="isLoadingGPS || !formData.perusahaan || !formData.status" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2">
                <span v-if="isLoadingGPS" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined text-[18px]">satellite_alt</span>
                {{ isLoadingGPS ? 'Mencari Kordinat GPS...' : 'Kirim Laporan (Auto GPS)' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL PENOLAKAN LAPORAN (Khusus Admin) -->
    <div v-if="showRejectModal" class="absolute inset-0 z-[700] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showRejectModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50 rounded-t-3xl shrink-0">
          <h3 class="text-lg font-bold text-red-800 flex items-center gap-2">
            <span class="material-symbols-outlined">cancel</span> Tolak Laporan
          </h3>
          <button @click="showRejectModal = false" class="text-red-400 hover:text-red-600 transition"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">Berikan alasan Anda menolak laporan ini agar petugas dapat memperbaikinya.</p>
          <textarea
            v-model="rejectReason"
            rows="3"
            placeholder="Contoh: Bukti GPS tidak akurat / salah lokasi..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none mb-4"
          ></textarea>

          <div class="flex gap-3">
            <button @click="showRejectModal = false" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition text-sm">Batal</button>
            <button
              @click="submitReject"
              :disabled="!rejectReason.trim() || verifyingId === laporanToReject?.id"
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              <span v-if="verifyingId === laporanToReject?.id" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ verifyingId === laporanToReject?.id ? 'Memproses...' : 'Kirim Penolakan' }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL GPS FALLBACK (Pengganti Confirm Bawaan Browser) -->
    <div v-if="showGpsModal" class="absolute inset-0 z-[700] bg-black/60 flex flex-col justify-end items-center transition-opacity" @click.self="showGpsModal = false">
      <div class="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl">location_off</span>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Gagal Mendapatkan GPS</h3>
          <p class="text-sm text-gray-600 mb-6">{{ gpsErrorMsg }}</p>
          <p class="text-xs text-gray-500 mb-6 border border-gray-200 p-3 rounded-lg bg-gray-50">Apakah Anda ingin melanjutkan pengiriman dengan koordinat simulasi (Default Samsat Bekasi)?</p>

          <div class="flex gap-3">
            <button @click="batalkanGPS" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition text-sm">Batal</button>
            <button @click="gunakanFallbackGPS" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md transition text-sm">Gunakan Fallback</button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- MODAL OPSI CETAK LAPORAN -->
<div
  v-if="showPrintOptionModal"
  class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4"
>
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800">Opsi Cetak Laporan</h3>
      <button
        @click="showPrintOptionModal = false"
        class="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      Pilih laporan yang ingin dicetak untuk periode
      <b>{{ monthNames[currentMonth] }} {{ currentYear }}</b>.
    </p>

    <div class="space-y-3">
      <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          value="semua"
          v-model="printMode"
          class="w-4 h-4"
        >
        <div>
          <p class="font-semibold text-gray-800">Print Semua Petugas</p>
          <p class="text-xs text-gray-500">Mencetak semua laporan petugas pada bulan ini.</p>
        </div>
      </label>

      <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          value="petugas"
          v-model="printMode"
          class="w-4 h-4"
        >
        <div>
          <p class="font-semibold text-gray-800">Pilih Petugas</p>
          <p class="text-xs text-gray-500">Mencetak laporan berdasarkan petugas tertentu.</p>
        </div>
      </label>

      <select
        v-if="printMode === 'petugas'"
        v-model="selectedPrintPetugas"
        class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Pilih Petugas --</option>
        <option
          v-for="petugas in daftarPetugasLaporanBulanIni"
          :key="petugas"
          :value="petugas"
        >
          {{ petugas }}
        </option>
      </select>
    </div>

    <div class="flex justify-end gap-2 mt-5">
      <button
        @click="showPrintOptionModal = false"
        class="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
      >
        Batal
      </button>

      <button
        @click="konfirmasiCetakLaporan"
        class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
      >
        Cetak
      </button>
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLaporanStore } from '../stores/laporan'
import { useRuteStore } from '../stores/rute'
import { Geolocation } from '@capacitor/geolocation' // IMPORT PLUGIN NATIVE CAPACITOR
import jsPDF from 'jspdf' // IMPORT JSPDF
import autoTable from 'jspdf-autotable'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'


// FUNGSI FIREBASE (Untuk update status verifikasi admin)
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

const router = useRouter()
const laporanStore = useLaporanStore()
const ruteStore = useRuteStore()

const currentUser = localStorage.getItem('nama') || 'PENGGUNA'
const role = localStorage.getItem('role') || 'petugas'

// STATE FILTER VERIFIKASI
const filterVerifikasi = ref('Semua')

const showPrintOptionModal = ref(false)
const printMode = ref('semua')
const selectedPrintPetugas = ref('')

const daftarPetugasLaporanBulanIni = computed(() => {
  const currentMonthStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`

  const list = laporanStore.laporanList
    .filter(r => r.date && r.date.startsWith(currentMonthStr))
    .map(r => r.petugas)
    .filter(Boolean)

  return [...new Set(list)]
})

function bukaOpsiCetakLaporan() {
  if (role === 'admin') {
    printMode.value = 'semua'
    selectedPrintPetugas.value = ''
    showPrintOptionModal.value = true
    return
  }

  cetakLaporanBulanan()
}

async function konfirmasiCetakLaporan() {
  if (printMode.value === 'petugas' && !selectedPrintPetugas.value) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Silakan pilih petugas terlebih dahulu.', type: 'error' }
    }))
    return
  }

  showPrintOptionModal.value = false

  await cetakLaporanBulanan(
    printMode.value === 'semua' ? 'semua' : selectedPrintPetugas.value
  )
}

onMounted(() => {
  laporanStore.subscribeLaporan() // Aktifkan pendengar Real-time Laporan
  ruteStore.loadLokasi() // Load lokasi perusahaan untuk form pilihan & rekap
  ruteStore.loadPetugas() // Load data petugas untuk rekap di akun admin
})

onUnmounted(() => {
  laporanStore.unsubscribeLaporan() // Matikan pendengar saat pindah halaman
})

// Dapatkan lokasi/perusahaan yang di-assign ke user ini (Hanya relevan bagi Petugas)
const assignedLocations = computed(() => {
  return ruteStore.lokasiList.filter(l => {
    const isPetugasIni = l.petugas === currentUser
    const isPerusahaan = String(l.kategori || '').toLowerCase() === 'perusahaan'

    return isPetugasIni && isPerusahaan
  })
})

// === LOGIKA KALENDER ===
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const formatDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const selectedDate = ref(formatDateStr(today))

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())
const daysInMonth = computed(() => {
  const count = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= count; i++) {
    const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    // Admin melihat indikator laporan siapa saja, petugas hanya melihat miliknya
    const hasReport = role === 'admin'
      ? laporanStore.laporanList.some(r => r.date === fullDate)
      : laporanStore.laporanList.some(r => r.date === fullDate && r.petugas === currentUser)

    days.push({ date: i, fullDate, hasReport })
  }
  return days
})

function nextMonth() { if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ } else { currentMonth.value++ } }
function prevMonth() { if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- } else { currentMonth.value-- } }
function selectDate(dateStr) { selectedDate.value = dateStr }
function isToday(dateStr) { return dateStr === formatDateStr(new Date()) }

// Format waktu untuk list laporan
function formatTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatSelectedDate = computed(() => {
  const parts = selectedDate.value.split('-')
  return `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`
})

// === LOGIKA FILTER DAFTAR LAPORAN (Menyesuaikan dengan Filter Verifikasi) ===
const reportsForSelectedDate = computed(() => {
  let list = laporanStore.laporanList.filter(r => r.date === selectedDate.value)

  // Jika petugas, hanya tampilkan miliknya
  if (role !== 'admin') {
    list = list.filter(r => r.petugas === currentUser)
  }

  // Filter berdasarkan tab Verifikasi yang aktif
  if (filterVerifikasi.value === 'Belum') {
    list = list.filter(r => !r.verifikasi || r.verifikasi === 'Belum')
  } else if (filterVerifikasi.value === 'Disetujui') {
    list = list.filter(r => r.verifikasi === 'Disetujui')
  } else if (filterVerifikasi.value === 'Ditolak') {
    list = list.filter(r => r.verifikasi === 'Ditolak')
  }

  return list
})

// === FUNGSI VERIFIKASI & PENOLAKAN (ADMIN) ===
const showRejectModal = ref(false)
const rejectReason = ref('')
const laporanToReject = ref(null)
const verifyingId = ref(null)

function openRejectModal(item) {
  laporanToReject.value = item
  rejectReason.value = item.alasan_tolak || ''
  showRejectModal.value = true
}

async function submitReject() {
  if (!rejectReason.value.trim() || !laporanToReject.value) return
  await prosesVerifikasi(laporanToReject.value, 'Ditolak', rejectReason.value.trim())
}

function updateLaporanLokal(id, patch) {
  const index = laporanStore.laporanList.findIndex(r => r.id === id)
  if (index === -1) return

  // Gunakan replace object agar Vue/Pinia pasti mendeteksi perubahan tampilan.
  laporanStore.laporanList.splice(index, 1, {
    ...laporanStore.laporanList[index],
    ...patch
  })
}

async function prosesVerifikasi(item, status, alasan = '') {
  if (!item?.id || verifyingId.value === item.id) return

  const previousData = { ...item }
  const payload = {
    verifikasi: status,
    alasan_tolak: status === 'Ditolak' ? alasan : '',
    diverifikasi_oleh: currentUser,
    diverifikasi_pada: new Date().toISOString()
  }

  try {
    const docRef = doc(db, 'artifacts', 'SatriaApp', 'public', 'data', 'laporan', item.id)

    verifyingId.value = item.id

    // Optimistic update: tampilan berubah dulu, Firebase menyusul.
    updateLaporanLokal(item.id, payload)

    // Tutup modal lebih cepat agar perubahan status langsung terlihat.
    if (status === 'Ditolak') {
      showRejectModal.value = false
    }

    await updateDoc(docRef, payload)

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Laporan berhasil ${status.toLowerCase()}!`, type: 'success' }
    }))
  } catch (error) {
    console.error('Error verifikasi:', error)

    // Jika Firebase gagal, kembalikan tampilan seperti semula.
    updateLaporanLokal(item.id, previousData)

    if (status === 'Ditolak') {
      showRejectModal.value = true
    }

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Gagal memverifikasi laporan. Pastikan koneksi internet stabil.', type: 'error' }
    }))
  } finally {
    verifyingId.value = null
    laporanToReject.value = null
    rejectReason.value = ''
  }
}

// === LOGIKA MODAL REKAP ADMIN (Tanda !) ===
const showAdminSummaryModal = ref(false)

function bukaAdminSummary() {
  showAdminSummaryModal.value = true;
}

const adminSummaryStats = computed(() => {
  // Mengambil bulan dan tahun yang sedang dilihat di kalender format "YYYY-MM"
  const currentMonthStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`;

  return ruteStore.petugasList.map(p => {
    // Proteksi jika nama petugas kosong/undefined
    const namaPetugas = p.nama || 'Tanpa Nama'
    const inisial = namaPetugas !== 'Tanpa Nama' ? namaPetugas.charAt(0).toUpperCase() : '?'

    // 1. Total Lokasi yang Ditugaskan kepadanya
    const assigned = ruteStore.lokasiList.filter(l => l.petugas === namaPetugas).length;

    // 2. Total Laporan yang sudah dia kerjakan di BULAN tersebut
    const reported = laporanStore.laporanList.filter(r =>
      r.petugas === namaPetugas && r.date && r.date.startsWith(currentMonthStr)
    ).length;

    return {
      id: p.id,
      petugas: namaPetugas,
      inisial: inisial,
      warna: p.warna,
      assigned,
      reported
    }
  })
})

// === LOGIKA MODAL & SUBMIT LAPORAN DENGAN CAPACITOR GEOLOCATION ===
const showModal = ref(false)
const isLoadingGPS = ref(false)
const formData = ref({
  perusahaan: '',
  status: 'Telah Dikunjungi',
  catatan: ''
})

// State untuk Fallback GPS (Mengganti fungsi window.confirm)
const showGpsModal = ref(false)
const gpsErrorMsg = ref('')

async function prosesPengirimanLaporan(lat, lng) {
  const payload = {
    perusahaan: formData.value.perusahaan,
    status: formData.value.status,
    catatan: formData.value.catatan,
    petugas: currentUser,
    date: selectedDate.value,
    verifikasi: 'Belum', // Default saat laporan baru masuk
    lat: lat,
    lng: lng
  }

  await laporanStore.saveLaporan(payload)

  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Laporan dan Lokasi berhasil dikirim!', type: 'success' } }))

  isLoadingGPS.value = false
  showModal.value = false
  showGpsModal.value = false

  // Reset form
  formData.value = { perusahaan: '', status: 'Telah Dikunjungi', catatan: '' }
}

async function kirimLaporan() {
  isLoadingGPS.value = true

  try {
    // 1. Cek & Minta Izin Lokasi di Android
    const checkPerm = await Geolocation.checkPermissions()
    if (checkPerm.location !== 'granted') {
      const requestPerm = await Geolocation.requestPermissions()
      if (requestPerm.location !== 'granted') {
        throw new Error("Izin akses lokasi ditolak oleh pengguna.")
      }
    }

    // 2. Ambil Kordinat Secara Native
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    })

    // 3. Kirim ke Database
    await prosesPengirimanLaporan(position.coords.latitude, position.coords.longitude)

  } catch (error) {
    console.warn("Error GPS Capacitor:", error)

    // Munculkan Modal Fallback Custom (Pengganti Confirm Darurat)
    gpsErrorMsg.value = error.message
    showGpsModal.value = true
  }
}

function batalkanGPS() {
  showGpsModal.value = false
  isLoadingGPS.value = false
}

async function gunakanFallbackGPS() {
  await prosesPengirimanLaporan(-6.2700806, 107.1481756)
}

// === LOGIKA CETAK PDF ===
async function cetakLaporanBulanan(targetPetugas = null) {
  try {
    // 1. Ambil data laporan sesuai bulan dan tahun yang aktif di kalender
    const currentMonthStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`;

    let laporanBulanIni = laporanStore.laporanList.filter(r =>
      r.date && r.date.startsWith(currentMonthStr)
    );

    // Jika yang login petugas, filter hanya laporannya sendiri.
    if (role === 'petugas') {
      laporanBulanIni = laporanBulanIni.filter(r => r.petugas === currentUser)
    }

    // Jika admin memilih Print Semua, cetak laporan dipisah per petugas
    if (role === 'admin' && targetPetugas === 'semua') {
      await cetakSemuaPetugasPerNama(laporanBulanIni)
      return
    }

    // Jika admin memilih petugas tertentu
    if (role === 'admin' && targetPetugas && targetPetugas !== 'semua') {
      laporanBulanIni = laporanBulanIni.filter(r => r.petugas === targetPetugas)
    }

    if (laporanBulanIni.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Tidak ada laporan pada bulan ${monthNames[currentMonth.value]} ${currentYear.value} untuk dicetak.`, type: 'error' } }))
      return;
    }

    // 2. Inisialisasi jsPDF
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const periode = `${monthNames[currentMonth.value]} ${currentYear.value}`;

    // Hitung Statistik
    const totalObjek = laporanBulanIni.length;
    let unitRusak = 0;
    let unitTidakBerfungsi = 0;

    // Format Data Tabel & Pemindaian Catatan
    const tableData = laporanBulanIni.map((item, index) => {
      let kondisiMeter = "Berfungsi dengan baik";

      if (item.catatan) {
          kondisiMeter = item.catatan;
          const catatanLower = item.catatan.toLowerCase();
          // Cerdas mendeteksi status dari teks catatan
          if (catatanLower.includes('rusak')) {
              unitRusak++;
          } else if (catatanLower.includes('tidak berfungsi')) {
              unitTidakBerfungsi++;
          }
      } else if (item.status === 'Terjadi Masalah') {
          kondisiMeter = "Water meter bermasalah / Perlu Pengecekan";
          unitTidakBerfungsi++; // Default fallback
      }

      const valStatus = item.status === 'Telah Dikunjungi' ? 'Telah dikunjungi' : item.status;
      let verif = item.verifikasi || 'Belum Verifikasi';

      // Sisipkan Alasan Penolakan ke Hasil Cetak PDF
      if (item.verifikasi === 'Ditolak' && item.alasan_tolak) {
        verif = `Ditolak\n(Alasan: ${item.alasan_tolak})`;
      }

      return [
        index + 1,
        item.perusahaan,
        `${valStatus}\n[${verif}]`,
        kondisiMeter
      ];
    });

    const laporanBermasalah = unitRusak + unitTidakBerfungsi;
    const laporanBagus = totalObjek - laporanBermasalah;

    // --- MULAI PENULISAN PDF (GAYA FORMAL DOCX) ---

    // Judul Header
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN PETUGAS PENELUSURAN", pageWidth / 2, 20, { align: 'center' });
    doc.text("PAJAK METER AIR PERMUKAAN", pageWidth / 2, 26, { align: 'center' });

    // Info Ringkasan (Dibuat sejajar titik duanya)
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    const startYInfo = 40;
    const lineHeight = 6;

    // Koordinat X untuk membuat rata kiri titik dua (:)
    const col1X = margin;
    const col2X = 45;
    const col3X = 48;

    doc.text("Jenis Laporan", col1X, startYInfo);
    doc.text(":", col2X, startYInfo);
    doc.text("Penelusuran dan evaluasi kondisi water meter", col3X, startYInfo);

    doc.text("Objek", col1X, startYInfo + lineHeight);
    doc.text(":", col2X, startYInfo + lineHeight);
    doc.text("Perusahaan/PDAM", col3X, startYInfo + lineHeight);

    doc.text("Periode", col1X, startYInfo + lineHeight * 2);
    doc.text(":", col2X, startYInfo + lineHeight * 2);
    doc.text(periode, col3X, startYInfo + lineHeight * 2);

    doc.text("Total Objek", col1X, startYInfo + lineHeight * 3);
    doc.text(":", col2X, startYInfo + lineHeight * 3);
    doc.text(`${totalObjek} Perusahaan`, col3X, startYInfo + lineHeight * 3);

    // Pembuatan Tabel yang bergaya dokumen formal (Abu-abu / Hitam Putih)
    autoTable(doc, {
      startY: startYInfo + lineHeight * 4,
      head: [['No', 'Nama Perusahaan', 'Status', 'Kondisi Water Meter']],
      body: tableData,
      theme: 'grid',
      // Style tabel disesuaikan layaknya Microsoft Word
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', font: 'times', lineColor: [0, 0, 0], lineWidth: 0.1 },
      bodyStyles: { textColor: [0, 0, 0], font: 'times', lineColor: [0, 0, 0], lineWidth: 0.1 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' }
      }
    });

    // Merangkai kalimat rincian rusak / tidak berfungsi
    let rincianBermasalah = "";
    if (laporanBermasalah > 0) {
        if (unitRusak > 0 && unitTidakBerfungsi > 0) {
            rincianBermasalah = `, terdiri dari ${unitRusak} unit rusak dan ${unitTidakBerfungsi} unit tidak berfungsi`;
        } else if (unitRusak > 0) {
            rincianBermasalah = `, terdiri dari ${unitRusak} unit rusak`;
        } else if (unitTidakBerfungsi > 0) {
            rincianBermasalah = `, terdiri dari ${unitTidakBerfungsi} unit tidak berfungsi`;
        }
    }

    // Penulisan Kesimpulan
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("times", "bold");
    doc.text("Kesimpulan", margin, finalY);

    doc.setFont("times", "normal");
    const kesimpulanTeks = `Berdasarkan hasil penelusuran, petugas telah melakukan kunjungan ke ${totalObjek} perusahaan yang telah ditugaskan. Seluruh objek tercatat telah dikunjungi. Dari hasil pemeriksaan kondisi water meter, terdapat ${laporanBagus} water meter berfungsi dengan baik dan ${laporanBermasalah} water meter memerlukan tindak lanjut${rincianBermasalah}.`;

    const kesimpulanTeks2 = `Pelaksanaan kunjungan berjalan tanpa kendala berarti. Namun, objek dengan water meter rusak atau tidak berfungsi perlu menjadi prioritas evaluasi, terutama untuk memastikan validitas data pengukuran dan keberlanjutan pemantauan pajak meter air permukaan.`;

    // Auto wrap text
    const splitText1 = doc.splitTextToSize(kesimpulanTeks, pageWidth - (margin * 2));
    doc.text(splitText1, margin, finalY + 6);

    const finalY2 = finalY + 6 + (splitText1.length * 5);
    const splitText2 = doc.splitTextToSize(kesimpulanTeks2, pageWidth - (margin * 2));
    doc.text(splitText2, margin, finalY2);

    // Penulisan Tanda Tangan (Merata Kanan)
    const signatureY = finalY2 + (splitText2.length * 5) + 15;
    doc.text("Petugas Penelusuran,", pageWidth - margin, signatureY, { align: 'right' });

    doc.setFont("times", "bold");
    const namaPenandatangan =
      role === 'admin' && targetPetugas && targetPetugas !== 'semua'
        ? targetPetugas
        : currentUser

    doc.text(namaPenandatangan, pageWidth - margin, signatureY + 25, { align: 'right' });

    // 3. Download / Simpan File
    const suffixPetugas =
      role === 'admin' && targetPetugas && targetPetugas !== 'semua'
        ? `_${targetPetugas.replace(/\s+/g, '_')}`
        : '_Semua_Petugas'

    const namaFile = `Laporan_Penelusuran_${monthNames[currentMonth.value]}_${currentYear.value}${suffixPetugas}.pdf`;
    await simpanAtauSharePdf(doc, namaFile);

  } catch (error) {
    console.error("Gagal membuat PDF:", error);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Terjadi kesalahan saat memproses laporan PDF.`, type: 'error' } }))
  }
}

async function cetakSemuaPetugasPerNama(laporanBulanIni) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    const periode = `${monthNames[currentMonth.value]} ${currentYear.value}`

    const grupPetugas = laporanBulanIni.reduce((result, item) => {
      const namaPetugas = item.petugas || 'Tanpa Nama Petugas'

      if (!result[namaPetugas]) {
        result[namaPetugas] = []
      }

      result[namaPetugas].push(item)
      return result
    }, {})

    const daftarGrup = Object.entries(grupPetugas)

    daftarGrup.forEach(([namaPetugas, daftarLaporan], groupIndex) => {
      if (groupIndex > 0) {
        doc.addPage()
      }

      const totalObjek = daftarLaporan.length
      let unitRusak = 0
      let unitTidakBerfungsi = 0

      const tableData = daftarLaporan.map((item, index) => {
        let kondisiMeter = 'Berfungsi dengan baik'

        if (item.catatan) {
          kondisiMeter = item.catatan
          const catatanLower = item.catatan.toLowerCase()

          if (catatanLower.includes('rusak')) {
            unitRusak++
          } else if (catatanLower.includes('tidak berfungsi')) {
            unitTidakBerfungsi++
          }
        } else if (item.status === 'Terjadi Masalah') {
          kondisiMeter = 'Water meter bermasalah / Perlu Pengecekan'
          unitTidakBerfungsi++
        }

        const valStatus = item.status === 'Telah Dikunjungi'
          ? 'Telah dikunjungi'
          : item.status

        let verif = item.verifikasi || 'Belum Verifikasi'

        if (item.verifikasi === 'Ditolak' && item.alasan_tolak) {
          verif = `Ditolak\n(Alasan: ${item.alasan_tolak})`
        }

        return [
          index + 1,
          item.perusahaan,
          `${valStatus}\n[${verif}]`,
          kondisiMeter
        ]
      })

      const laporanBermasalah = unitRusak + unitTidakBerfungsi
      const laporanBagus = totalObjek - laporanBermasalah

      doc.setFont('times', 'bold')
      doc.setFontSize(12)
      doc.text('LAPORAN PETUGAS PENELUSURAN', pageWidth / 2, 20, { align: 'center' })
      doc.text('PAJAK METER AIR PERMUKAAN', pageWidth / 2, 26, { align: 'center' })

      doc.setFontSize(11)
      doc.setFont('times', 'normal')

      const startYInfo = 40
      const lineHeight = 6
      const col1X = margin
      const col2X = 45
      const col3X = 48

      doc.text('Jenis Laporan', col1X, startYInfo)
      doc.text(':', col2X, startYInfo)
      doc.text('Penelusuran dan evaluasi kondisi water meter', col3X, startYInfo)

      doc.text('Objek', col1X, startYInfo + lineHeight)
      doc.text(':', col2X, startYInfo + lineHeight)
      doc.text('Perusahaan/PDAM', col3X, startYInfo + lineHeight)

      doc.text('Periode', col1X, startYInfo + lineHeight * 2)
      doc.text(':', col2X, startYInfo + lineHeight * 2)
      doc.text(periode, col3X, startYInfo + lineHeight * 2)

      doc.text('Petugas', col1X, startYInfo + lineHeight * 3)
      doc.text(':', col2X, startYInfo + lineHeight * 3)
      doc.text(namaPetugas, col3X, startYInfo + lineHeight * 3)

      doc.text('Total Objek', col1X, startYInfo + lineHeight * 4)
      doc.text(':', col2X, startYInfo + lineHeight * 4)
      doc.text(`${totalObjek} Perusahaan`, col3X, startYInfo + lineHeight * 4)

      autoTable(doc, {
        startY: startYInfo + lineHeight * 5,
        head: [['No', 'Nama Perusahaan', 'Status', 'Kondisi Water Meter']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          font: 'times',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          font: 'times',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { cellWidth: 65 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        }
      })

      let rincianBermasalah = ''

      if (laporanBermasalah > 0) {
        if (unitRusak > 0 && unitTidakBerfungsi > 0) {
          rincianBermasalah = `, terdiri dari ${unitRusak} unit rusak dan ${unitTidakBerfungsi} unit tidak berfungsi`
        } else if (unitRusak > 0) {
          rincianBermasalah = `, terdiri dari ${unitRusak} unit rusak`
        } else if (unitTidakBerfungsi > 0) {
          rincianBermasalah = `, terdiri dari ${unitTidakBerfungsi} unit tidak berfungsi`
        }
      }

      const finalY = doc.lastAutoTable.finalY + 10

      doc.setFont('times', 'bold')
      doc.text('Kesimpulan', margin, finalY)

      doc.setFont('times', 'normal')

      const kesimpulanTeks = `Berdasarkan hasil penelusuran, petugas ${namaPetugas} telah melakukan kunjungan ke ${totalObjek} perusahaan yang telah ditugaskan. Dari hasil pemeriksaan kondisi water meter, terdapat ${laporanBagus} water meter berfungsi dengan baik dan ${laporanBermasalah} water meter memerlukan tindak lanjut${rincianBermasalah}.`

      const kesimpulanTeks2 = `Objek dengan water meter rusak atau tidak berfungsi perlu menjadi prioritas evaluasi, terutama untuk memastikan validitas data pengukuran dan keberlanjutan pemantauan pajak meter air permukaan.`

      const splitText1 = doc.splitTextToSize(kesimpulanTeks, pageWidth - margin * 2)
      doc.text(splitText1, margin, finalY + 6)

      const finalY2 = finalY + 6 + splitText1.length * 5
      const splitText2 = doc.splitTextToSize(kesimpulanTeks2, pageWidth - margin * 2)
      doc.text(splitText2, margin, finalY2)

      const signatureY = finalY2 + splitText2.length * 5 + 15

      doc.text('Petugas Penelusuran,', pageWidth - margin, signatureY, { align: 'right' })

      doc.setFont('times', 'bold')
      doc.text(namaPetugas, pageWidth - margin, signatureY + 25, { align: 'right' })
    })

    const namaFile = `Laporan_Penelusuran_${monthNames[currentMonth.value]}_${currentYear.value}_Semua_Petugas.pdf`

    await simpanAtauSharePdf(doc, namaFile)
  } catch (error) {
    console.error('Gagal membuat laporan semua petugas:', error)

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: 'Terjadi kesalahan saat mencetak laporan semua petugas.',
        type: 'error'
      }
    }))
  }
}

async function simpanAtauSharePdf(doc, namaFile) {
  // Kalau dibuka di browser/laptop, tetap download seperti biasa
  if (!Capacitor.isNativePlatform()) {
    doc.save(namaFile)
    return
  }

  // Kalau APK Android, simpan ke cache lalu buka menu share/cetak
  const base64Pdf = doc.output('datauristring').split(',')[1]

  await Filesystem.writeFile({
    path: namaFile,
    data: base64Pdf,
    directory: Directory.Cache
  })

  const fileUri = await Filesystem.getUri({
    path: namaFile,
    directory: Directory.Cache
  })

  await Share.share({
    title: 'Laporan Petugas',
    text: 'File laporan petugas dalam bentuk PDF.',
    files: [fileUri.uri],
    dialogTitle: 'Bagikan / Cetak Laporan'
  })
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }

/* CSS untuk menyembunyikan scrollbar di tab verifikasi horizontal */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
