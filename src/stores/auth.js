import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const isLoggedIn = ref(
      localStorage.getItem('isLoggedIn') === 'true'
    )

    const username = ref(
      localStorage.getItem('username') || ''
    )

    const role = ref(
      localStorage.getItem('role') || ''
    )

    const roleLabel = computed(() => {
      return role.value === 'admin'
        ? 'Administrator'
        : 'Petugas Penelusur'
    })

    function login(user) {
      const userRole =
        user.toLowerCase().includes('admin')
          ? 'admin'
          : 'petugas'

      isLoggedIn.value = true
      username.value = user.toUpperCase()
      role.value = userRole

      localStorage.setItem(
        'isLoggedIn',
        'true'
      )

      localStorage.setItem(
        'username',
        username.value
      )

      localStorage.setItem(
        'role',
        role.value
      )
    }

    function logout() {
      isLoggedIn.value = false
      username.value = ''
      role.value = ''

      localStorage.removeItem(
        'isLoggedIn'
      )

      localStorage.removeItem(
        'username'
      )

      localStorage.removeItem(
        'role'
      )
    }

    return {
      isLoggedIn,
      username,
      role,
      roleLabel,
      login,
      logout
    }
  }
)