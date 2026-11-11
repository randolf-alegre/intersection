import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'
import {
  clearSavedLoginSession,
  loginWithKeycard,
  loginWithPassword,
  savedLoginSession,
  type LoginResult,
  type LoginSession,
} from '@/services/authentication'

export const useAuthStore = defineStore('authStore', () => {
  const saved = savedLoginSession()
  const token = ref<string | null>(saved?.token ?? null)
  const refreshToken = ref<string | null>(saved?.refreshToken ?? null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => token.value !== null && refreshToken.value !== null)

  function applySession(session: LoginSession) {
    token.value = session.token
    refreshToken.value = session.refreshToken
    error.value = null
  }

  async function loginAsGuest(keycardToken: string) {
    return runLogin(() => loginWithKeycard(keycardToken))
  }

  async function loginAsMember(email: string, password: string) {
    return runLogin(() => loginWithPassword(email, password))
  }

  async function logout() {
    clearSavedLoginSession()
    token.value = null
    refreshToken.value = null
    error.value = null
    await router.push({ name: 'login' })
  }

  async function runLogin(request: () => Promise<LoginResult>) {
    loading.value = true
    error.value = null

    try {
      const result = await request()
      if (!result.ok) {
        error.value = result.error.message
        return null
      }

      applySession(result.session)
      await router.push({ name: 'home' })
      return result.session
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    loginAsGuest,
    loginAsMember,
    logout,
  }
})
