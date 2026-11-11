import { isAxiosError } from 'axios'
import { api } from '@/services/api'
import { errorMessage } from '@/services/common'

export type LoginSession = {
  token: string
  refreshToken: string
}

export type GuestLoginRequest = {
  keycard_token: string
}

export type MemberLoginRequest = {
  email: string
  password: string
}

export type AuthenticationFailure = {
  message: string
  status: number
}

export type LoginResult =
  { ok: true; session: LoginSession } | { ok: false; error: AuthenticationFailure }

export function savedLoginSession(): LoginSession | null {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refresh_token')
  if (!token || !refreshToken) return null
  return { token, refreshToken }
}

export function saveLoginSession(session: LoginSession) {
  localStorage.setItem('token', session.token)
  localStorage.setItem('refresh_token', session.refreshToken)
}

export function clearSavedLoginSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
}

export function loginWithKeycard(keycardToken: string) {
  return requestLogin({ keycard_token: keycardToken })
}

export function loginWithPassword(email: string, password: string) {
  return requestLogin({ email, password })
}

function authenticationFailure(message: string, status: number): LoginResult {
  return { ok: false, error: { message, status } }
}

async function requestLogin(body: GuestLoginRequest | MemberLoginRequest): Promise<LoginResult> {
  try {
    const response = await api.post<unknown>('/login', body)
    if (response.status === 404) {
      return authenticationFailure(errorMessage(response.data, 'Unable to log in'), response.status)
    }
    if (!isLoginSession(response.data)) {
      return authenticationFailure('Login response was incomplete', response.status)
    }

    saveLoginSession(response.data)
    return { ok: true, session: response.data }
  } catch (error) {
    if (!isAxiosError(error) || !error.response) {
      return authenticationFailure('Unable to reach the login service', 0)
    }

    return authenticationFailure(
      errorMessage(error.response.data, 'Unable to log in'),
      error.response.status,
    )
  }
}

function isLoginSession(value: unknown): value is LoginSession {
  if (!value || typeof value !== 'object') return false

  const session = value as Record<string, unknown>
  return typeof session.token === 'string' && typeof session.refreshToken === 'string'
}
