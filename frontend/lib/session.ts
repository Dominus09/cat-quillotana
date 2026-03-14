import type { Client } from './types'

const SESSION_KEY = 'quillotana_session'

export function getSession(): Client | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem(SESSION_KEY)
  return session ? JSON.parse(session) : null
}

export function saveSession(client: Client): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(client))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('quillotana_cart')
  localStorage.removeItem('quillotana_orders')
}

export function isTestMode(): boolean {
  const session = getSession()
  return session?.rut === 'test'
}
