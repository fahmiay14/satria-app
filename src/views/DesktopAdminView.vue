<template>
  <div :class="{ 'dark': isDarkMode }">
    <!-- LAYOUT UTAMA DESKTOP -->
    <div class="fixed inset-0 flex flex-row font-sans overflow-hidden z-[100] transition-colors duration-300" :class="theme.appBg">

      <!-- WRAPPER PANEL KIRI (SIDEBAR + KONTEN) BISA DI-TOGGLE -->
      <div
        class="flex flex-row shrink-0 overflow-hidden transition-all duration-300 ease-in-out z-20 shadow-2xl"
        :class="isPanelOpen ? 'w-[706px]' : 'w-0'"
      >
        <!-- STREAMING_CHUNK:Rendering Sidebar Kiri... -->
        <!-- SIDEBAR KIRI: NAVIGASI UTAMA DESKTOP -->
        <div class="w-64 border-r flex flex-col justify-between shrink-0 transition-colors duration-300" :class="theme.sidebarBg">
          <div>
            <!-- Logo & Nama Aplikasi -->
            <div class="p-6 border-b flex items-center gap-3 transition-colors duration-300" :class="theme.border">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span class="material-symbols-outlined text-white text-2xl">monitoring</span>
              </div>
              <div>
                <h1 class="font-black text-sm tracking-wider uppercase transition-colors" :class="theme.textMain">Satria App</h1>
                <p class="text-[10px] font-bold transition-colors" :class="theme.textMuted">COMMAND CENTER</p>
              </div>
            </div>

            <!-- Menu Pilihan -->
            <div class="p-4 space-y-1.5 flex flex-col h-full">
              <p class="text-[10px] font-bold uppercase tracking-widest px-3 mb-2 transition-colors" :class="theme.textSub">Menu Utama</p>

              <button
                @click="activeMenu = 'monitoring'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition"
                :class="activeMenu === 'monitoring' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : theme.menuBtn"
              >
                <span class="material-symbols-outlined">map</span> Monitoring Lapangan
              </button>

              <button
                @click="activeMenu = 'arsip'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition"
                :class="activeMenu === 'arsip' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : theme.menuBtn"
              >
                <span class="material-symbols-outlined">folder_open</span> Data Arsip Surat
              </button>

              <button
                @click="activeMenu = 'statistik'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition mb-4"
                :class="activeMenu === 'statistik' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : theme.menuBtn"
              >
                <span class="material-symbols-outlined">analytics</span> Statistik & Rekap
              </button>

              <div class="mt-4 border-t pt-4 transition-colors" :class="theme.border">
                <p class="text-[10px] font-bold uppercase tracking-widest px-3 mb-2 transition-colors" :class="theme.textSub">Tampilan</p>
                <!-- TOMBOL TOGGLE THEME -->
                <button
                  @click="toggleTheme"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition"
                  :class="theme.menuBtn"
                >
                  <span class="material-symbols-outlined">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
                  {{ isDarkMode ? 'Mode Terang' : 'Mode Gelap' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Profil Akun & Logout -->
          <div class="p-4 border-t transition-colors duration-300" :class="theme.profileBg">
            <div class="flex items-center gap-3 p-2 rounded-xl border mb-3 transition-colors duration-300" :class="theme.profileCard">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-sm uppercase">
                {{ currentAdmin.charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold truncate transition-colors" :class="theme.textMain">{{ currentAdmin }}</p>
                <p class="text-[9px] font-bold uppercase tracking-wider transition-colors" :class="theme.textBlue">Administrator</p>
              </div>
            </div>
            <button @click="handleLogout" class="w-full font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 border" :class="theme.btnRed">
              <span class="material-symbols-outlined text-sm">logout</span> KELUAR SISTEM
            </button>
          </div>
        </div>

        <!-- STREAMING_CHUNK:Rendering Panel Konten... -->
        <!-- KONTEN DINAMIS -->
        <div class="w-[450px] border-r flex flex-col shrink-0 transition-colors duration-300" :class="theme.panelBg">

          <!-- HEADER KONTEN -->
          <div class="p-6 border-b shrink-0 flex justify-between items-center w-[450px] transition-colors duration-300" :class="theme.panelHeader">
            <div>
              <h2 class="text-base font-black uppercase tracking-wide transition-colors" :class="theme.textMain">
                {{ activeMenu === 'monitoring' ? 'Daftar Penugasan' : activeMenu === 'arsip' ? 'Gudang Arsip' : 'Statistik Aktivitas' }}
              </h2>
              <p class="text-[11px] mt-0.5 transition-colors" :class="theme.textMuted">Periode Bulan Ini: {{ currentMonthLabel }}</p>
            </div>

            <!-- Tombol Tambah yang sudah dipasangkan dengan modal -->
            <button v-if="activeMenu === 'arsip'" @click="showTambahModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer">
              <span class="material-symbols-outlined text-sm">add</span> Tambah
            </button>
          </div>

          <!-- ISI PANEL KONTEN -->
          <div class="flex-1 overflow-y-auto p-6 w-[450px]">

            <!-- 1. SUB PANEL: MONITORING -->
            <div v-if="activeMenu === 'monitoring'" class="space-y-4">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-sm transition-colors" :class="theme.textSub">search</span>
                <input v-model="searchQuery" type="text" placeholder="Cari perusahaan atau petugas..." class="w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors" :class="theme.inputBg" />
              </div>

              <div class="border rounded-xl p-4 grid grid-cols-2 gap-4 text-center transition-colors duration-300" :class="theme.cardBg">
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-wider transition-colors" :class="theme.textMuted">Total Target</p>
                  <p class="text-xl font-black mt-1 transition-colors" :class="theme.textMain">{{ totalLocations }}</p>
                </div>
                <div class="border-l transition-colors" :class="theme.border">
                  <p class="text-[9px] font-bold uppercase tracking-wider transition-colors" :class="theme.textMuted">Selesai Kunjungan</p>
                  <p class="text-xl font-black mt-1 transition-colors" :class="theme.textGreen">{{ completedCount }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <div
                  v-for="loc in filteredLocations" :key="loc.id"
                  @click="focusToLocation(loc)"
                  class="border p-3 rounded-xl flex items-center justify-between cursor-pointer transition group" :class="theme.cardHover"
                >
                  <div class="min-w-0 flex-1 flex items-center gap-3">
                    <div class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: loc.color }"></div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-bold text-xs truncate transition-colors" :class="loc.isCompleted ? theme.textGreen : theme.textMain">{{ loc.nama }}</h4>
                      <p class="text-[10px] mt-0.5 truncate flex items-center gap-1 transition-colors" :class="theme.textMuted">
                        <span class="material-symbols-outlined text-[11px]">person</span> {{ loc.petugas || 'Belum ditugaskan' }}
                      </p>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-sm transition-colors" :class="loc.isCompleted ? 'text-green-500' : theme.iconMuted">
                    {{ loc.isCompleted ? 'check_circle' : 'schedule' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- STREAMING_CHUNK:Rendering Sub Panel Arsip... -->
            <!-- 2. SUB PANEL: DATA ARSIP -->
            <div v-if="activeMenu === 'arsip'" class="space-y-4">
              <!-- Aksi Import/Export Arsip -->
              <div class="flex gap-2 mb-2">
                <input type="file" ref="fileInputArsip" @change="importCSVArsip" accept=".csv" class="hidden" />
                <button @click="triggerImportArsip" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer" :class="theme.btnAction">
                  <span class="material-symbols-outlined text-sm">upload_file</span> Import
                </button>
                <button @click="exportCSVArsip" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer" :class="theme.btnAction">
                  <span class="material-symbols-outlined text-sm">download</span> Export
                </button>
              </div>

              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-sm transition-colors" :class="theme.textSub">search</span>
                <input v-model="searchQueryArsip" type="text" placeholder="Cari Nopol kendaraan..." class="w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors" :class="theme.inputBg" />
              </div>

              <div class="space-y-2">
                <div v-for="arsip in filteredArsip" :key="arsip.id" class="border p-3 rounded-xl flex justify-between items-start transition-colors duration-300" :class="theme.cardBg">
                  <div>
                    <h4 class="font-mono text-sm font-black tracking-wide transition-colors" :class="theme.textMain">{{ arsip.no_polisi }}</h4>
                    <div class="flex items-center gap-3 mt-1.5">
                      <p class="text-[10px] transition-colors flex items-center gap-1" :class="theme.textMuted">
                        <span class="material-symbols-outlined text-[12px]">tag</span> No. {{ arsip.no_surat }}
                      </p>
                      <p class="text-[10px] transition-colors flex items-center gap-1" :class="theme.textMuted">
                        <span class="material-symbols-outlined text-[12px]">inventory_2</span> {{ arsip.nama_box || 'Belum masuk box' }}
                      </p>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 mt-1 rounded border transition-colors shrink-0" :class="arsip.status === 'Tersedia' ? theme.bgGreen : theme.bgAmber">
                    {{ arsip.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- STREAMING_CHUNK:Rendering Sub Panel Statistik... -->
            <!-- 3. SUB PANEL: STATISTIK -->
            <div v-if="activeMenu === 'statistik'" class="space-y-5">
              <div class="border rounded-xl p-4 transition-colors duration-300" :class="theme.cardBg">
                <h4 class="text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5 transition-colors" :class="theme.textBlue">
                  <span class="material-symbols-outlined text-sm">folder_open</span> Arsip Dokumen
                </h4>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="p-2 rounded-lg transition-colors" :class="theme.statBoxBg"><p class="text-[9px] font-bold transition-colors" :class="theme.textMuted">TOTAL</p><p class="text-base font-black mt-0.5 transition-colors" :class="theme.textMain">{{ arsipStore.totalArsip }}</p></div>
                  <div class="p-2 rounded-lg transition-colors" :class="theme.statBoxBg"><p class="text-[9px] font-bold transition-colors" :class="theme.textGreen">READY</p><p class="text-base font-black mt-0.5 transition-colors" :class="theme.textGreen">{{ arsipStore.arsipTersedia }}</p></div>
                  <div class="p-2 rounded-lg transition-colors" :class="theme.statBoxBg"><p class="text-[9px] font-bold transition-colors" :class="theme.textAmber">PINJAM</p><p class="text-base font-black mt-0.5 transition-colors" :class="theme.textAmber">{{ arsipStore.arsipDipinjam }}</p></div>
                </div>
              </div>

              <div class="border rounded-xl p-4 transition-colors duration-300" :class="theme.cardBg">
                <h4 class="text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5 transition-colors" :class="theme.textPurple">
                  <span class="material-symbols-outlined text-sm">route</span> Sebaran Titik Rute
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs p-2.5 rounded-lg transition-colors duration-300" :class="theme.statBoxBg">
                    <span class="transition-colors" :class="theme.textMuted">Rute Perusahaan</span>
                    <span class="font-black transition-colors" :class="theme.textMain">{{ rutePerusahaan }} Titik</span>
                  </div>
                  <div class="flex justify-between items-center text-xs p-2.5 rounded-lg transition-colors duration-300" :class="theme.statBoxBg">
                    <span class="transition-colors" :class="theme.textMuted">Rute Pribadi Petugas</span>
                    <span class="font-black transition-colors" :class="theme.textMain">{{ rutePribadi }} Titik</span>
                  </div>
                </div>
              </div>

              <!-- TOMBOL CETAK POP-UP -->
              <button @click="showCetakModal = true" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow text-xs flex justify-center items-center gap-2 transition active:scale-95">
                <span class="material-symbols-outlined text-sm">print</span> CETAK LAPORAN PENELUSURAN
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- STREAMING_CHUNK:Rendering Peta Monitoring... -->
      <!-- KANAN: PETA MONITORING INTERAKTIF -->
      <div class="flex-1 h-full relative flex flex-col overflow-hidden transition-colors duration-300" :class="theme.mapBg">

        <!-- Tombol Hide/Show Panel Kiri -->
        <button
          @click="isPanelOpen = !isPanelOpen"
          class="absolute top-1/2 left-0 -translate-y-1/2 z-[400] py-3 px-1 rounded-r-lg border border-l-0 shadow-xl transition-colors cursor-pointer"
          :class="theme.toggleBtn"
          :title="isPanelOpen ? 'Sembunyikan Panel' : 'Tampilkan Panel'"
        >
          <span class="material-symbols-outlined text-xl">
            {{ isPanelOpen ? 'chevron_left' : 'chevron_right' }}
          </span>
        </button>

        <!-- INDIKATOR "LIVE" KANAN ATAS -->
        <div class="absolute top-6 right-6 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-md backdrop-blur transition-colors duration-300" :class="theme.liveBadgeBg">
          <div class="relative flex h-2.5 w-2.5">
            <!-- Lingkaran berkedip (ping) -->
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <!-- Titik solid -->
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </div>
          <span class="text-xs font-black tracking-widest uppercase transition-colors" :class="theme.liveBadgeText">Live</span>
        </div>

        <!-- AREA NOTIFIKASI MELAYANG (Toast Real-Time) -->
        <transition-group name="slide-left" tag="div" class="absolute top-20 right-6 z-[500] flex flex-col gap-3 w-80 pointer-events-none">
          <div
            v-for="notif in activeNotifications" :key="notif._notifId"
            class="border-l-4 p-4 rounded-xl shadow-2xl pointer-events-auto flex items-start gap-3 transition-colors duration-300"
            :class="notif.status === 'Telah Dikunjungi' ? theme.notifSuccessBg : theme.notifErrorBg"
          >
            <div class="p-1.5 rounded-full shrink-0 transition-colors" :class="notif.status === 'Telah Dikunjungi' ? theme.notifSuccessIconBg : theme.notifErrorIconBg">
              <span class="material-symbols-outlined text-[18px]">
                {{ notif.status === 'Telah Dikunjungi' ? 'check_circle' : 'error' }}
              </span>
            </div>
            <div>
              <h4 class="text-sm font-bold leading-tight mb-1 transition-colors" :class="theme.notifTextTitle">
                {{ notif.status === 'Telah Dikunjungi' ? 'Kunjungan Selesai!' : 'Laporan Kendala!' }}
              </h4>
              <p class="text-[11px] leading-snug transition-colors" :class="theme.notifTextBody">
                <span class="font-bold transition-colors" :class="theme.notifTextHighlight1">{{ notif.petugas }}</span>
                {{ notif.status === 'Telah Dikunjungi' ? 'telah menyelesaikan rute di' : 'melaporkan masalah di' }}
                <span class="font-bold transition-colors" :class="theme.notifTextHighlight2">{{ notif.perusahaan }}</span>.
              </p>
            </div>
          </div>
        </transition-group>

        <!-- Peta Inti -->
        <div id="mapDesktop" class="w-full flex-1 z-10"></div>

        <!-- Legenda Horizontal di Bagian Bawah Peta -->
        <div class="border-t p-4 z-[400] backdrop-blur flex flex-col md:flex-row md:items-start gap-4 shrink-0 transition-colors duration-300" :class="theme.mapOverlay">
          <h4 class="text-[10px] font-black uppercase tracking-widest shrink-0 md:border-r md:pr-4 md:mt-2 transition-colors" :class="`${theme.textSub} ${theme.border}`">Live Kinerja</h4>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5 flex-1 w-full">
            <div
              v-for="p in petugasStats" :key="p.id"
              class="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border shadow-sm transition cursor-default" :class="theme.legendCard"
            >
              <div class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border transition-colors" :class="theme.border" :style="{ backgroundColor: p.warna }"></div>
              <span class="font-bold whitespace-nowrap truncate flex-1 transition-colors" :class="theme.textMain">{{ p.nama }}</span>
              <div class="px-1.5 py-0.5 rounded text-[10px] font-black border ml-1 shrink-0 transition-colors" :class="theme.legendNumber">
                <span class="transition-colors" :class="p.selesai > 0 ? theme.textGreen : theme.textSub">{{ p.selesai }}</span>
                <span class="mx-0.5 transition-colors" :class="theme.textMuted">/</span>
                <span class="transition-colors" :class="theme.textBlue">{{ p.target }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- STREAMING_CHUNK:Rendering Modals... -->
    <!-- MODAL CETAK LAPORAN PENELUSURAN -->
    <div v-if="showCetakModal" class="absolute inset-0 z-[600] flex flex-col justify-center items-center transition-opacity bg-black/40 backdrop-blur-sm" @click.self="showCetakModal = false">
      <div class="rounded-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up" :class="theme.cardBg">

        <div class="px-6 py-4 border-b flex justify-between items-center shrink-0" :class="theme.border">
          <h3 class="text-lg font-bold" :class="theme.textMain">Cetak Laporan Penelusuran</h3>
          <button @click="showCetakModal = false" class="text-gray-400 hover:text-red-500 transition"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <form @submit.prevent="executeCetakLaporan" class="space-y-4">

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Bulan</label>
                <select v-model="cetakMonth" required class="w-full border rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" :class="theme.inputBg">
                  <option v-for="(m, i) in monthNames" :key="m" :value="i">{{ m }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Tahun</label>
                <select v-model="cetakYear" required class="w-full border rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" :class="theme.inputBg">
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Pilih Petugas</label>
              <select v-model="cetakPetugas" required class="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" :class="theme.inputBg">
                <option value="Semua Petugas">Semua Petugas (Gabungan)</option>
                <option v-for="p in ruteStore.petugasList" :key="p.id" :value="p.nama">{{ p.nama }}</option>
              </select>
            </div>

            <div class="pt-4 pb-2">
              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">print</span>
                Buat Dokumen Laporan
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH ARSIP -->
    <div v-if="showTambahModal" class="absolute inset-0 z-[600] flex flex-col justify-center items-center transition-opacity bg-black/40 backdrop-blur-sm" @click.self="showTambahModal = false">
      <div class="rounded-3xl shadow-2xl w-full max-w-md transform flex flex-col animate-slide-up" :class="theme.cardBg">

        <div class="px-6 py-4 border-b flex justify-between items-center shrink-0" :class="theme.border">
          <h3 class="text-lg font-bold" :class="theme.textMain">Tambah Data Arsip</h3>
          <button @click="showTambahModal = false" class="text-gray-400 hover:text-red-500 transition"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <form @submit.prevent="submitTambahArsip" class="space-y-4">

            <div>
              <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Nomor Surat</label>
              <input v-model="formArsip.no_surat" type="number" required class="w-full border rounded-xl px-3 py-3 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-colors" :class="theme.inputBg" placeholder="Contoh: 1234" />
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Nomor Polisi</label>
              <input v-model="formArsip.no_polisi" type="text" required class="w-full border rounded-xl px-3 py-3 outline-none text-sm font-medium uppercase focus:ring-2 focus:ring-blue-500 transition-colors" :class="theme.inputBg" placeholder="Contoh: B 1234 KAA" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Status</label>
                <select v-model="formArsip.status" class="w-full border rounded-xl px-3 py-3 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-colors" :class="theme.inputBg">
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dipinjam">Dipinjam</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-1.5 uppercase tracking-wide" :class="theme.textSub">Nama Box</label>
                <input v-model="formArsip.nama_box" type="text" class="w-full border rounded-xl px-3 py-3 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-colors" :class="theme.inputBg" placeholder="Contoh: Box A1" />
              </div>
            </div>

            <div class="pt-4 pb-2">
              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex justify-center items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">save</span>
                Simpan Arsip
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* STREAMING_CHUNK:Initializing Imports... */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuteStore } from '../stores/rute'
import { useLaporanStore } from '../stores/laporan'
import { useArsipStore } from '../stores/arsip'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Firebase Import (Ditambahkan setDoc dan collection untuk fitur Tambah)
import { writeBatch, doc, setDoc, collection } from 'firebase/firestore'
import { db } from '../services/firebase'

const router = useRouter()
const ruteStore = useRuteStore()
const laporanStore = useLaporanStore()
const arsipStore = useArsipStore()

/* STREAMING_CHUNK:Defining State Variables... */
// State Layout & Tema
const isPanelOpen = ref(true)
const isDarkMode = ref(localStorage.getItem('theme') !== 'light') // Default Dark Mode
const activeMenu = ref('monitoring')
const searchQuery = ref('')
const searchQueryArsip = ref('')
const today = new Date()
const activeNotifications = ref([]) // State untuk Pop-up Notifikasi Melayang

const fileInputArsip = ref(null)
const currentAdmin = localStorage.getItem('nama') || 'ADMINISTRATOR'

// === DATA DAN STATE POP-UP CETAK LAPORAN ===
const showCetakModal = ref(false)
const cetakMonth = ref(today.getMonth())
const cetakYear = ref(today.getFullYear())
const cetakPetugas = ref('Semua Petugas')
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

const yearOptions = computed(() => {
  const currentY = new Date().getFullYear()
  const years = []
  for (let i = currentY - 5; i <= currentY + 5; i++) {
    years.push(i)
  }
  return years
})

// === DATA DAN STATE POP-UP TAMBAH ARSIP ===
const showTambahModal = ref(false)
const formArsip = ref({
  no_surat: '',
  no_polisi: '',
  status: 'Tersedia',
  nama_box: ''
})

/* STREAMING_CHUNK:Configuring Theme... */
// === OBJECT THEME ===
const theme = computed(() => isDarkMode.value ? {
  appBg: 'bg-slate-900 text-slate-100',
  sidebarBg: 'bg-slate-950 border-slate-800',
  border: 'border-slate-800',
  textMain: 'text-white',
  textMuted: 'text-slate-400',
  textSub: 'text-slate-500',
  textBlue: 'text-blue-400',
  textGreen: 'text-green-400',
  textAmber: 'text-amber-400',
  textPurple: 'text-purple-400',
  iconMuted: 'text-slate-600',
  menuBtn: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
  profileBg: 'bg-slate-950/50 border-slate-800',
  profileCard: 'bg-slate-900 border-slate-800',
  btnRed: 'bg-red-950/40 hover:bg-red-900/60 border-red-900/50 text-red-400',
  btnAction: 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white',
  panelBg: 'bg-slate-900/40 border-slate-800',
  panelHeader: 'bg-slate-950/20 border-slate-800',
  inputBg: 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500',
  cardBg: 'bg-slate-950 border-slate-800',
  cardHover: 'bg-slate-950/60 border-slate-800 hover:border-blue-500/50',
  statBoxBg: 'bg-slate-900',
  bgGreen: 'bg-green-950/40 text-green-400 border-green-900/50',
  bgAmber: 'bg-amber-950/40 text-amber-400 border-amber-900/50',
  mapBg: 'bg-slate-950',
  toggleBtn: 'bg-slate-800 hover:bg-blue-600 text-white border-slate-600',
  mapOverlay: 'bg-slate-950/95 border-slate-800',
  legendCard: 'bg-slate-900 border-slate-800 hover:bg-slate-800',
  legendNumber: 'bg-slate-950 border-slate-800',
  liveBadgeBg: 'bg-slate-900/90 border-slate-700',
  liveBadgeText: 'text-white',
  notifSuccessBg: 'bg-slate-800 border-green-500',
  notifSuccessIconBg: 'bg-green-900/40 text-green-400',
  notifErrorBg: 'bg-slate-800 border-red-500',
  notifErrorIconBg: 'bg-red-900/40 text-red-400',
  notifTextTitle: 'text-white',
  notifTextBody: 'text-slate-400',
  notifTextHighlight1: 'text-blue-400',
  notifTextHighlight2: 'text-slate-300',
} : {
  appBg: 'bg-gray-50 text-gray-800',
  sidebarBg: 'bg-white border-gray-200',
  border: 'border-gray-200',
  textMain: 'text-gray-800',
  textMuted: 'text-gray-500',
  textSub: 'text-gray-400',
  textBlue: 'text-blue-600',
  textGreen: 'text-green-600',
  textAmber: 'text-amber-600',
  textPurple: 'text-purple-600',
  iconMuted: 'text-gray-300',
  menuBtn: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
  profileBg: 'bg-gray-50 border-gray-200',
  profileCard: 'bg-white border-gray-200',
  btnRed: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600',
  btnAction: 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-gray-900',
  panelBg: 'bg-gray-50 border-gray-200',
  panelHeader: 'bg-white/80 border-gray-200',
  inputBg: 'bg-white border-gray-300 text-gray-800 placeholder-gray-400',
  cardBg: 'bg-white border-gray-200',
  cardHover: 'bg-white border-gray-200 hover:border-blue-500',
  statBoxBg: 'bg-gray-50',
  bgGreen: 'bg-green-50 text-green-600 border-green-200',
  bgAmber: 'bg-amber-50 text-amber-600 border-amber-200',
  mapBg: 'bg-gray-200',
  toggleBtn: 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300',
  mapOverlay: 'bg-white/95 border-gray-200',
  legendCard: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
  legendNumber: 'bg-white border-gray-200',
  liveBadgeBg: 'bg-white/90 border-gray-300',
  liveBadgeText: 'text-gray-800',
  notifSuccessBg: 'bg-white border-green-500',
  notifSuccessIconBg: 'bg-green-100 text-green-600',
  notifErrorBg: 'bg-white border-red-500',
  notifErrorIconBg: 'bg-red-100 text-red-600',
  notifTextTitle: 'text-gray-800',
  notifTextBody: 'text-gray-500',
  notifTextHighlight1: 'text-blue-600',
  notifTextHighlight2: 'text-gray-700',
})

const currentMonthLabel = computed(() => `${monthNames[today.getMonth()]} ${today.getFullYear()}`)
const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

let map = null
let markersGroup = null
let tileLayer = null

/* STREAMING_CHUNK:Loading Lifecycle... */
onMounted(async () => {
  await Promise.all([
    ruteStore.loadPetugas(),
    ruteStore.loadLokasi(),
    arsipStore.loadArsip()
  ])
  laporanStore.subscribeLaporan()
  initMap()
})

onUnmounted(() => {
  laporanStore.unsubscribeLaporan()
})

// === LOGIKA TOGGLE TEMA ===
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  setMapTheme()
}

function setMapTheme() {
  if (!map) return
  if (tileLayer) map.removeLayer(tileLayer)

  const url = isDarkMode.value
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'

  tileLayer = L.tileLayer(url, { attribution: '&copy; CartoDB' }).addTo(map)
}

/* STREAMING_CHUNK:Configuring Realtime Notifications... */
// === PENDETEKSI NOTIFIKASI REAL-TIME ===
function addNotification(report) {
  const notifId = Date.now() + Math.random()
  activeNotifications.value.push({ ...report, _notifId: notifId })
  setTimeout(() => {
    activeNotifications.value = activeNotifications.value.filter(n => n._notifId !== notifId)
  }, 5000)
}

let isFirstLoad = true
let lastReportId = null

watch(() => laporanStore.laporanList, (newVal) => {
  if (!newVal || newVal.length === 0) return
  if (isFirstLoad) { lastReportId = newVal[0].id; isFirstLoad = false; return }

  if (newVal[0].id !== lastReportId) {
    const newReports = []
    for (const report of newVal) {
      if (report.id === lastReportId) break
      newReports.push(report)
    }
    newReports.reverse().forEach(report => { addNotification(report) })
    lastReportId = newVal[0].id
  }
}, { deep: true })


// === PEMETAAN DATA ===
const mappedLocations = computed(() => {
  const perusahaanList = ruteStore.lokasiList.filter(l => (!l.kategori || l.kategori === 'Perusahaan'))
  return perusahaanList.map(loc => {
    const petugasObj = ruteStore.petugasList.find(p => p.nama === loc.petugas)
    const color = petugasObj ? petugasObj.warna : '#64748b'
    const isCompleted = laporanStore.laporanList.some(r => r.perusahaan === loc.nama && r.date && r.date.startsWith(currentMonthStr))
    return { ...loc, color, isCompleted }
  })
})

const totalLocations = computed(() => mappedLocations.value.length)
const completedCount = computed(() => mappedLocations.value.filter(l => l.isCompleted).length)

const petugasStats = computed(() => {
  return ruteStore.petugasList.map(p => {
    const locs = mappedLocations.value.filter(l => l.petugas === p.nama)
    const target = locs.length
    const selesai = locs.filter(l => l.isCompleted).length
    return {
      id: p.id,
      nama: p.nama,
      warna: p.warna || '#94a3b8',
      target: target,
      selesai: selesai
    }
  }).filter(p => p.target > 0)
})

const filteredLocations = computed(() => {
  if (!searchQuery.value) return mappedLocations.value
  const q = searchQuery.value.toLowerCase()
  return mappedLocations.value.filter(l => l.nama.toLowerCase().includes(q) || (l.petugas && l.petugas.toLowerCase().includes(q)))
})

const filteredArsip = computed(() => {
  if (!searchQueryArsip.value) return arsipStore.arsipList
  return arsipStore.arsipList.filter(a => a.no_polisi && a.no_polisi.toLowerCase().includes(searchQueryArsip.value.toLowerCase()))
})

const rutePerusahaan = computed(() => ruteStore.lokasiList.filter(r => (!r.kategori || r.kategori === 'Perusahaan')).length)
const rutePribadi = computed(() => ruteStore.lokasiList.filter(r => r.kategori === 'Pribadi').length)


/* STREAMING_CHUNK:Configuring CSV Logic... */
// === IMPORT & EXPORT CSV ARSIP ===
function triggerImportArsip() {
  if (fileInputArsip.value) fileInputArsip.value.click()
}

function exportCSVArsip() {
  if (arsipStore.arsipList.length === 0) return alert("Tidak ada data arsip untuk diekspor")

  let csvContent = "Nomor Surat,No Polisi,Status,Nama Box\n"
  arsipStore.arsipList.forEach(row => {
    const escapeCSV = (str) => {
      if (!str) return ''
      return `"${String(str).replace(/"/g, '""')}"`
    }
    csvContent += `${row.no_surat},${escapeCSV(row.no_polisi)},${escapeCSV(row.status)},${escapeCSV(row.nama_box)}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.setAttribute("href", URL.createObjectURL(blob))
  link.setAttribute("download", `Data_Arsip_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function importCSVArsip(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const rows = text.split(/\r?\n/).map(row => row.trim()).filter(row => row.length > 0)

    if (rows.length < 2) {
      alert("File CSV kosong atau format tidak valid")
      return
    }

    arsipStore.loading = true
    try {
      let batch = writeBatch(db)
      let count = 0
      let totalImported = 0

      for (let i = 1; i < rows.length; i++) {
        // [PERBAIKAN]: Memisahkan kolom berdasarkan koma ATAU titik koma
        const cols = rows[i].split(/[,;]/).map(col => col.replace(/(^"|"$)/g, '').trim())

        if (cols.length >= 2) {
          const docId = "ARSIP-IMP-" + Date.now() + "-" + i
          const docRef = doc(db, 'artifacts', 'SatriaApp', 'public', 'data', 'arsip', docId)

          batch.set(docRef, {
            no_surat: parseInt(cols[0]) || 0,
            no_polisi: (cols[1] || '').toUpperCase(),
            status: cols[2] || 'Tersedia',
            nama_box: cols[3] || '',
            id_admin: localStorage.getItem('userId') || 'MIGRASI',
            nama_admin: localStorage.getItem('nama') || 'Admin',
            created_at: new Date().toISOString()
          })

          count++
          totalImported++

          if (count === 400) {
            await batch.commit()
            batch = writeBatch(db)
            count = 0
          }
        }
      }
      if (count > 0) await batch.commit()
      await arsipStore.loadArsip()
      alert(`${totalImported} data arsip berhasil diimpor!`)
    } catch(err) {
      console.error("Gagal mengimpor CSV", err)
      alert("Terjadi error saat memproses file CSV.")
    } finally {
      arsipStore.loading = false
      if (fileInputArsip.value) fileInputArsip.value.value = ''
    }
  }
  reader.readAsText(file)
}

/* STREAMING_CHUNK:Configuring Submit Logic... */
// === FUNGSI TAMBAH ARSIP BARU ===
async function submitTambahArsip() {
  try {
    const colRef = collection(db, 'artifacts', 'SatriaApp', 'public', 'data', 'arsip')
    const newDocRef = doc(colRef) // Generate ID otomatis

    await setDoc(newDocRef, {
      no_surat: parseInt(formArsip.value.no_surat) || 0,
      no_polisi: formArsip.value.no_polisi.toUpperCase(),
      status: formArsip.value.status,
      nama_box: formArsip.value.nama_box || '',
      id_admin: localStorage.getItem('userId') || 'MANUAL',
      nama_admin: currentAdmin,
      created_at: new Date().toISOString()
    })

    alert("Data arsip baru berhasil ditambahkan!")
    showTambahModal.value = false // Tutup modal

    // Reset form ke keadaan semula
    formArsip.value = { no_surat: '', no_polisi: '', status: 'Tersedia', nama_box: '' }

    // Tarik ulang data terbaru dari store
    await arsipStore.loadArsip()
  } catch (error) {
    console.error("Gagal menambah arsip:", error)
    alert("Terjadi kesalahan saat menyimpan data.")
  }
}

// === FUNGSI CETAK LAPORAN PENELUSURAN DINAMIS (PDF) ===
function executeCetakLaporan() {
  const periodeStr = `${cetakYear.value}-${String(cetakMonth.value + 1).padStart(2, '0')}`
  const periodeText = `${monthNames[cetakMonth.value]} ${cetakYear.value}`

  // 1. Filter laporan berdasarkan bulan & tahun yang dipilih
  let dataFilter = laporanStore.laporanList.filter(r => r.date && r.date.startsWith(periodeStr))

  // 2. Filter berdasarkan petugas (jika bukan 'Semua Petugas')
  if (cetakPetugas.value !== 'Semua Petugas') {
    dataFilter = dataFilter.filter(r => r.petugas === cetakPetugas.value)
  }

  if (dataFilter.length === 0) {
    alert('Tidak ada laporan untuk periode dan petugas tersebut yang bisa dicetak.')
    return
  }

  const totalObjek = dataFilter.length
  let baik = 0
  let bermasalah = 0
  let tableRows = ''

  // 3. Proses baris tabel
  dataFilter.forEach((r, idx) => {
    const status = r.status || 'Telah Dikunjungi'
    let kondisi = r.catatan ? r.catatan : 'Berfungsi dengan baik'

    const catLow = kondisi.toLowerCase()
    if (status === 'Terjadi Masalah' || catLow.includes('rusak') || catLow.includes('tidak berfungsi') || catLow.includes('masalah')) {
      bermasalah++
    } else {
      baik++
    }

    tableRows += `
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; color: #000;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 12px; color: #000;">${r.perusahaan}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 12px; color: #000;">${status}</td>
        <td style="border: 1px solid #000; padding: 8px; font-size: 12px; color: #000;">${kondisi}</td>
      </tr>
    `
  })

  // 4. Susun Paragraf Kesimpulan
  const kesimpulanTambahan = bermasalah > 0
    ? ' Pelaksanaan kunjungan berjalan tanpa kendala berarti. Namun, objek dengan water meter rusak atau tidak berfungsi perlu menjadi prioritas evaluasi, terutama untuk memastikan validitas data pengukuran dan keberlanjutan pemantauan pajak meter air permukaan.'
    : ' Pelaksanaan kunjungan berjalan tanpa kendala berarti dan seluruh water meter dalam kondisi optimal.'

  const kesimpulan = `Berdasarkan hasil penelusuran, petugas telah melakukan kunjungan ke ${totalObjek} perusahaan yang telah ditugaskan. Seluruh objek tercatat telah dikunjungi. Dari hasil pemeriksaan kondisi water meter, terdapat ${baik} water meter berfungsi dengan baik dan ${bermasalah} water meter memerlukan tindak lanjut.${kesimpulanTambahan}`

  const namaPenandatangan = cetakPetugas.value === 'Semua Petugas' ? currentAdmin : cetakPetugas.value
  const labelPenandatangan = cetakPetugas.value === 'Semua Petugas' ? 'Administrator' : 'Petugas Penelusuran'

  // 5. Susun Template Kertas HTML (A4 Portrait)
  const html = `
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="font-size: 16px; font-weight: bold; margin: 0; text-decoration: underline; color: #000;">LAPORAN PETUGAS PENELUSURAN</h2>
      <h2 style="font-size: 16px; font-weight: bold; margin: 5px 0 0 0; color: #000;">PAJAK METER AIR PERMUKAAN</h2>
    </div>

    <table style="width: 100%; font-size: 12px; margin-bottom: 25px; border: none; color: #000;">
      <tr>
        <td style="width: 15%; padding: 4px 0;">Jenis Laporan</td>
        <td style="width: 2%; padding: 4px 0;">:</td>
        <td style="width: 43%; padding: 4px 0;">Penelusuran dan evaluasi kondisi water meter</td>
        <td style="width: 10%; padding: 4px 0;">Objek</td>
        <td style="width: 2%; padding: 4px 0;">:</td>
        <td style="width: 28%; padding: 4px 0;">Perusahaan/PDAM</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Periode</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0;">${periodeText}</td>
        <td style="padding: 4px 0;">Total Objek</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0;">${totalObjek} Perusahaan</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Petugas</td>
        <td style="padding: 4px 0;">:</td>
        <td style="padding: 4px 0;" colspan="4">${cetakPetugas.value}</td>
      </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #000; padding: 8px; font-size: 12px; text-align: center; width: 5%; color: #000;">No</th>
          <th style="border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; width: 35%; color: #000;">Nama Perusahaan</th>
          <th style="border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; width: 20%; color: #000;">Status</th>
          <th style="border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; width: 40%; color: #000;">Kondisi Water Meter</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div style="font-size: 12px; margin-bottom: 50px; text-align: justify; line-height: 1.6; color: #000;">
      <strong style="color: #000;">Kesimpulan</strong><br>
      ${kesimpulan}
    </div>

    <table style="width: 100%; border: none; margin-top: 30px; color: #000;">
      <tr>
        <td style="width: 60%;"></td>
        <td style="width: 40%; text-align: center; font-size: 12px;">
          <p style="margin-bottom: 70px;">${labelPenandatangan},</p>
          <p style="font-weight: bold; text-decoration: underline; margin: 0;">${namaPenandatangan}</p>
        </td>
      </tr>
    </table>
  `

  // 6. Eksekusi Print via Iframe
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <html>
    <head>
      <title>Laporan_Penelusuran_${periodeText.replace(' ', '_')}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
    showCetakModal.value = false // Tutup modal setelah jendela cetak muncul
  }, 500)
}

/* STREAMING_CHUNK:Configuring Map Engine... */
// === MAP RENDERING ENGINE ===
watch(isPanelOpen, () => {
  let count = 0
  const interval = setInterval(() => {
    if (map) map.invalidateSize({ animate: false })
    count++
    if (count > 12) clearInterval(interval)
  }, 25)
})

watch(mappedLocations, () => { renderMarkers() }, { deep: true })

function initMap() {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  map = L.map('mapDesktop', { zoomControl: true }).setView([-6.27, 107.14], 12)
  setMapTheme()

  markersGroup = L.layerGroup().addTo(map)
  renderMarkers()

  setTimeout(() => { if(map) map.invalidateSize() }, 300)
}

function createDesktopIcon(color, isCompleted) {
  const badgeHTML = isCompleted ? `
    <div style="position: absolute; top: -4px; right: -4px; background: #22c55e; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
      <svg style="width:10px; height:10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>
    </div>
  ` : ''

  return L.divIcon({
    className: 'desktop-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
        ${badgeHTML}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  })
}

function renderMarkers() {
  if (!markersGroup || !map) return
  markersGroup.clearLayers()
  const bounds = L.latLngBounds()

  mappedLocations.value.forEach(loc => {
    if (!loc.lat || !loc.lng) return
    const marker = L.marker([loc.lat, loc.lng], { icon: createDesktopIcon(loc.color, loc.isCompleted) })

    marker.bindPopup(`
      <div style="color: #333; font-family: sans-serif; padding: 4px; min-width: 150px;">
        <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px; color: #111;">${loc.nama}</h4>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #555;">Petugas: <b style="color:${loc.color}">${loc.petugas || 'Belum ditugaskan'}</b></p>
        <span style="font-size: 10px; font-weight: bold; padding: 3px 6px; border-radius: 4px; display: inline-block; ${loc.isCompleted ? 'background:#dcfce7; color:#15803d; border: 1px solid #bbf7d0;' : 'background:#f1f5f9; color:#475569; border: 1px solid #e2e8f0;'}">
          ${loc.isCompleted ? '✓ Selesai Bulan Ini' : '○ Menunggu Kunjungan'}
        </span>
      </div>
    `)
    markersGroup.addLayer(marker)
    bounds.extend([loc.lat, loc.lng])
  })

  if (mappedLocations.value.length > 0) map.fitBounds(bounds, { padding: [50, 50] })
}

function focusToLocation(loc) {
  if (!map || !loc.lat || !loc.lng) return
  map.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 })
  setTimeout(() => {
    markersGroup.eachLayer(layer => {
      if (layer.getLatLng().lat === loc.lat && layer.getLatLng().lng === loc.lng) layer.openPopup()
    })
  }, 1300)
}

function handleLogout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
/* STREAMING_CHUNK:Applying CSS... */
/* Transisi scrollbar kustom bertema gelap/terang untuk desktop */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.dark ::-webkit-scrollbar-thumb { background: #334155; }
.dark ::-webkit-scrollbar-thumb:hover { background: #475569; }

/* Mengatur background kontainer Leaflet agar senada dengan tema */
:deep(.leaflet-container) { background: #e2e8f0 !important; z-index: 10 !important; transition: background-color 0.3s; }
.dark :deep(.leaflet-container) { background: #0f172a !important; }

/* Ubah sedikit padding bawaan popup leaflet agar lebih clean */
:deep(.leaflet-popup-content-wrapper) { border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }

/* Animasi Notifikasi Melayang (Pop-up Real-Time) */
.slide-left-enter-active,
.slide-left-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-left-enter-from,
.slide-left-leave-to { opacity: 0; transform: translateX(50px); }

.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  0% { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
</style>
