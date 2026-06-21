import { defineStore } from 'pinia'
import { db } from '../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  actions: {
    async login(nik, password) {
      this.loading = true
      this.error = null

      try {
        const cleanNik = nik.trim().toLowerCase()

        const usersPath = ['artifacts', 'SatriaApp', 'public', 'data', 'users_account']

        const q = query(
          collection(db, ...usersPath),
          where('nik', '==', cleanNik),
          where('password', '==', password)
        )

        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          this.error = "NIK/NIP atau Password salah!"
          return false
        } else {
          const userDoc = querySnapshot.docs[0]
          const userData = userDoc.data()

          this.setSession({
            id: userDoc.id, // Berperan sebagai id_user
            nama_lengkap: userData.nama_lengkap, // Sesuai ERD
            nik: userData.nik,
            role: userData.role,
            email: userData.email || '',
            no_telp: userData.no_telp || ''
          })
          return true
        }
      } catch (error) {
        console.error("Login Error:", error)
        this.error = "Gagal terhubung ke database. Periksa koneksi internet."
        return false
      } finally {
        this.loading = false
      }
    },

    setSession(userData) {
      this.user = userData
      // Simpan di LocalStorage agar tidak hilang saat di-refresh
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('nama', userData.nama_lengkap) // Di UI kita pakai 'nama' untuk manggil nama_lengkap
      localStorage.setItem('nik', userData.nik)
      localStorage.setItem('role', userData.role)
      localStorage.setItem('email', userData.email)
      localStorage.setItem('no_telp', userData.no_telp)
    },

    logout() {
      this.user = null
      localStorage.clear()
    }
  }
})
