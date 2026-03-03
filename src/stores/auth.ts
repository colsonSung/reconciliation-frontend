import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  const login = (user: string, pass: string) => {
    // 模拟登录验证
    if (user && pass) {
      const mockToken = 'mock-token-' + Date.now()
      token.value = mockToken
      username.value = user
      localStorage.setItem('token', mockToken)
      localStorage.setItem('username', user)
      return true
    }
    return false
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  const isAuthenticated = () => !!token.value

  return { token, username, login, logout, isAuthenticated }
})
