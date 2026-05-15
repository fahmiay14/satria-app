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

        // Backdoor Darurat
        if (cleanNik === 'superadmin' && password === 'satria2024') {
          this.setSession({
            id: 'USER-SUPERADMIN',
            nama_lengkap: 'Super Administrator',
            nik: 'superadmin',
            role: 'admin' // Menggunakan role
          })
          return true
        }

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
            id: userDoc.id,
            nama_lengkap: userData.nama_lengkap,
            nik: userData.nik,
            role: userData.role // Langsung ambil role dari database
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
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('nama', userData.nama_lengkap)
      localStorage.setItem('nik', userData.nik)
      localStorage.setItem('role', userData.role) // Simpan sebagai role
    },

    logout() {
      this.user = null
      localStorage.clear()
    }
  }
})
