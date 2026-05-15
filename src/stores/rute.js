import { defineStore } from 'pinia'
import { db } from '../services/firebase'
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore'

export const useRuteStore = defineStore('rute', {
  state: () => ({
    lokasiList: [],
    petugasList: [], // Akan diisi dari tabel users_account
    loading: false
  }),

  actions: {
    // Helper: Buat ID String Acak (Contoh: RUTE-xY9zQ1wE4rTy)
    generateId(prefix) {
      const randomStr = Math.random().toString(36).substring(2, 14).toUpperCase()
      return `${prefix}-${randomStr}`
    },

    // 1. Load Data Petugas (Dari tabel users_account yang rolenya 'petugas')
    async loadPetugas() {
      this.loading = true
      try {
        // PERBAIKAN PATH: Menambahkan 'data' agar menjadi 5 bagian (valid untuk collection)
        const usersPath = ['artifacts', 'SatriaApp', 'public', 'data', 'users_account']
        const q = query(
          collection(db, ...usersPath),
          where('role', '==', 'petugas')
        )
        const snapshot = await getDocs(q)

        this.petugasList = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            nama: data.nama,
            username: data.username,
            // Beri warna acak atau statis untuk marker di peta
            warna: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
          }
        })
      } catch (error) {
        console.error("Gagal memuat daftar petugas:", error)
      } finally {
        this.loading = false
      }
    },

    // 2. Load Lokasi Rute berdasarkan Aturan Hak Akses (Privasi)
    async loadLokasi() {
      this.loading = true
      this.lokasiList = []

      const currentUserId = localStorage.getItem('userId')

      // PERBAIKAN PATH: Menambahkan 'data' agar menjadi 5 bagian
      const rutePath = ['artifacts', 'SatriaApp', 'public', 'data', 'data_rute']

      try {
        let perusahaanQuery;
        let pribadiQuery;

        // QUERY 1: Ambil data Perusahaan
        // REVISI: Semua role (Admin/Petugas) melihat SEMUA rute perusahaan karena sifatnya publik
        perusahaanQuery = query(
          collection(db, ...rutePath),
          where('kategori', '==', 'Perusahaan')
        )

        // QUERY 2: Ambil data Pribadi
        // REVISI: Semua role (Admin/Petugas) HANYA melihat rute pribadi miliknya sendiri
        pribadiQuery = query(
          collection(db, ...rutePath),
          where('kategori', '==', 'Pribadi'),
          where('id_user_petugas', '==', currentUserId) // Untuk rute pribadi, pembuat kita catat di id_user_petugas
        )

        // Eksekusi kedua Query secara paralel
        const [perusahaanSnap, pribadiSnap] = await Promise.all([
          getDocs(perusahaanQuery),
          getDocs(pribadiQuery)
        ])

        // Gabungkan hasilnya
        const allDocs = []
        perusahaanSnap.forEach(doc => allDocs.push({ id_rute: doc.id, ...doc.data() }))
        pribadiSnap.forEach(doc => allDocs.push({ id_rute: doc.id, ...doc.data() }))

        this.lokasiList = allDocs

      } catch (error) {
        console.error("Gagal memuat lokasi:", error)
      } finally {
        this.loading = false
      }
    },

    // 3. Simpan Lokasi (Create & Update)
    async saveLokasi(lokasiData) {
      this.loading = true
      const currentUserId = localStorage.getItem('userId')
      const currentUserName = localStorage.getItem('username')

      // PERBAIKAN PATH: Menambahkan 'data' agar menjadi 5 bagian
      const rutePath = ['artifacts', 'SatriaApp', 'public', 'data', 'data_rute']

      try {
        const isNew = !lokasiData.id_rute
        const docId = isNew ? this.generateId('RUTE') : lokasiData.id_rute

        let payload = {
          nama: lokasiData.nama, // Di class diagram nama_lokasi, disesuaikan ke komponen vue anda
          lat: parseFloat(lokasiData.lat),
          lng: parseFloat(lokasiData.lng),
          kategori: lokasiData.kategori || 'Perusahaan',
          updated_at: new Date().toISOString()
        }

        if (isNew) {
          payload.created_at = new Date().toISOString()

          if (payload.kategori === 'Pribadi') {
            // RUTE PRIBADI: Admin dikosongkan, Petugas diisi dengan pembuat
            payload.id_user_admin = ""
            payload.nama_admin = ""
            payload.id_user_petugas = currentUserId
            payload.nama_petugas = currentUserName // Agar nama pembuat tampil di peta
            // Kita juga simpan field 'petugas' (nama saja) agar kompatibel dengan kode Map Anda yang lama
            payload.petugas = currentUserName
          } else {
            // RUTE PERUSAHAAN (Biasanya Admin yang buat)
            payload.id_user_admin = currentUserId
            payload.nama_admin = currentUserName
            payload.id_user_petugas = lokasiData.id_user_petugas || ""
            payload.nama_petugas = lokasiData.nama_petugas || ""
            payload.petugas = lokasiData.petugas || "" // Untuk dropdown
          }
        } else {
          // UPDATE RUTE (Hanya update data penugasan atau nama/lat/lng)
          if (lokasiData.petugas) {
            payload.petugas = lokasiData.petugas
            // Cari ID petugas berdasarkan nama dari petugasList
            const p = this.petugasList.find(x => x.nama === lokasiData.petugas)
            if (p) {
              payload.id_user_petugas = p.id
              payload.nama_petugas = p.nama
            } else {
              payload.id_user_petugas = ""
              payload.nama_petugas = ""
            }
          } else {
            payload.petugas = ""
            payload.id_user_petugas = ""
            payload.nama_petugas = ""
          }
        }

        // Simpan ke Firestore
        await setDoc(doc(db, ...rutePath, docId), payload, { merge: true })

        // Refresh data
        await this.loadLokasi()

      } catch (error) {
        console.error("Gagal menyimpan lokasi:", error)
      } finally {
        this.loading = false
      }
    },

    // 4. Hapus Lokasi
    async deleteLokasi(id_rute) {
      this.loading = true

      // PERBAIKAN PATH: Menambahkan 'data' agar menjadi 5 bagian
      const rutePath = ['artifacts', 'SatriaApp', 'public', 'data', 'data_rute']

      try {
        await deleteDoc(doc(db, ...rutePath, id_rute))
        await this.loadLokasi()
      } catch (error) {
        console.error("Gagal menghapus lokasi:", error)
      } finally {
        this.loading = false
      }
    }
  }
})
