import type { AuthSession } from '../api/auth'

const sessionKey = 'ibag-one-session'

export function readSession(): AuthSession | null {
  const serialized = window.localStorage.getItem(sessionKey) ?? window.sessionStorage.getItem(sessionKey)
  if (!serialized) return null

  try {
    return JSON.parse(serialized) as AuthSession
  } catch {
    clearSession()
    return null
  }
}

export function saveSession(session: AuthSession, persistent: boolean) {
  const storage = persistent ? window.localStorage : window.sessionStorage
  const otherStorage = persistent ? window.sessionStorage : window.localStorage
  otherStorage.removeItem(sessionKey)
  storage.setItem(sessionKey, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey)
  window.sessionStorage.removeItem(sessionKey)
}
