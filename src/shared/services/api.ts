import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getActivePinia } from 'pinia'
import {
  clearSavedLoginSession,
  saveLoginSession,
  savedLoginSession,
  type LoginSession,
} from '@/shared/services/authentication'
import { useAuthStore } from '@/shared/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RetriableRequest = InternalAxiosRequestConfig & { retried?: boolean }

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  transformResponse: [
    (data: unknown) => {
      if (typeof data !== 'string' || data.length === 0) return data
      try {
        return camelizeKeys(JSON.parse(data))
      } catch {
        return data
      }
    },
  ],
})

let refreshInFlight: Promise<LoginSession | null> | null = null
let endingSession = false

api.interceptors.request.use(async (config: RetriableRequest) => {
  if (isSessionRequest(config)) return config

  const session = savedLoginSession()
  if (!session) return config

  if (!accessTokenExpired(session.token)) {
    config.headers.Authorization = `Bearer ${session.token}`
    return config
  }

  const refreshed = await refreshSession()
  if (!refreshed) {
    await expireSession()
    throw new axios.CanceledError('Session expired')
  }

  config.retried = true
  config.headers.Authorization = `Bearer ${refreshed.token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 404) return error.response

    const config = error.config as RetriableRequest | undefined
    if (!config || error.response?.status !== 401 || config.retried || isSessionRequest(config)) {
      return Promise.reject(error)
    }

    config.retried = true
    const refreshed = await refreshSession()
    if (!refreshed) {
      await expireSession()
      return Promise.reject(error)
    }

    config.headers.Authorization = `Bearer ${refreshed.token}`
    return api(config)
  },
)

function camelizeKey(key: string) {
  return key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelizeKeys)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      camelizeKey(key),
      camelizeKeys(item),
    ]),
  )
}

function isSessionRequest(config: InternalAxiosRequestConfig) {
  const url = config.url ?? ''
  return url.includes('/login') || url.includes('/refresh')
}

function accessTokenExpired(token: string) {
  const segment = token.split('.')[1]
  if (!segment) return true

  try {
    const payload = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: unknown
    }
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = requestRefresh().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

async function requestRefresh(): Promise<LoginSession | null> {
  const session = savedLoginSession()
  if (!session) return null

  try {
    const response = await api.post<unknown>('/refresh', {
      refresh_token: session.refreshToken,
    })
    const token = accessTokenFrom(response.data)
    if (!token) return null

    const nextSession = { token, refreshToken: session.refreshToken, admin: session.admin }
    rememberSession(nextSession)
    return nextSession
  } catch {
    return null
  }
}

function rememberSession(session: LoginSession) {
  saveLoginSession(session)
  if (!getActivePinia()) return

  const auth = useAuthStore()
  auth.token = session.token
  auth.refreshToken = session.refreshToken
  auth.admin = session.admin === true
}

async function expireSession() {
  if (endingSession) return
  endingSession = true

  try {
    if (!getActivePinia()) {
      clearSavedLoginSession()
      return
    }

    await useAuthStore().logout()
  } finally {
    endingSession = false
  }
}

function accessTokenFrom(value: unknown) {
  if (!value || typeof value !== 'object') return null

  const token = (value as Record<string, unknown>).token
  return typeof token === 'string' ? token : null
}
