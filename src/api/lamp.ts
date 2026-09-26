/**
 * Tiny API client for the ESP32 lamp (base URL http://192.168.4.1 by default).
 *
 * The device serves plain HTTP with CORS already enabled and issues no token or
 * cookie: "authenticated" is a live flag we read from GET /api/status. Every
 * network problem is normalised into LampUnreachableError so callers never have
 * to deal with raw fetch/TypeError messages.
 */

const DEFAULT_HOST = 'http://192.168.4.1'
const REQUEST_TIMEOUT_MS = 6000

const configuredHost = import.meta.env.VITE_LAMP_HOST
export const API_BASE = (configuredHost?.trim() || DEFAULT_HOST).replace(
  /\/+$/,
  '',
)

export type LampStatus = {
  authenticated: boolean
  lampOn: boolean
}

/** The lamp could not be reached (wrong network, device off, bad response). */
export class LampUnreachableError extends Error {
  constructor() {
    super('The lamp is not reachable.')
    this.name = 'LampUnreachableError'
  }
}

/** The device rejected the request because the session is not logged in. */
export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated.')
    this.name = 'NotAuthenticatedError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
    })

    if (response.status === 401) throw new NotAuthenticatedError()
    if (!response.ok) throw new LampUnreachableError()

    const body = await response.text()
    if (!body) return {} as T

    try {
      return JSON.parse(body) as T
    } catch {
      throw new LampUnreachableError()
    }
  } catch (error) {
    // Aborts, DNS/connection failures and malformed bodies all mean the same
    // thing to the UI: we cannot talk to the lamp right now.
    if (error instanceof NotAuthenticatedError) throw error
    throw new LampUnreachableError()
  } finally {
    clearTimeout(timeout)
  }
}

export async function getStatus(): Promise<LampStatus> {
  const data = await request<Partial<LampStatus>>('/api/status')
  return {
    authenticated: data.authenticated === true,
    lampOn: data.lampOn === true,
  }
}

export async function login(password: string): Promise<boolean> {
  const data = await request<{ success?: boolean }>('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ pwd: password }).toString(),
  })
  return data.success === true
}

export async function toggleLamp(): Promise<boolean> {
  const data = await request<{ lampOn?: boolean }>('/api/toggle', {
    method: 'POST',
  })
  return data.lampOn === true
}

export async function logout(): Promise<boolean> {
  const data = await request<{ success?: boolean }>('/api/logout', {
    method: 'POST',
  })
  return data.success === true
}
