// Platform (SaaS vendor control plane) API client — deliberately its own
// module, own storage key, own fetch path (SON-64). This must never share
// code with lib/api.js's tenant client: that client's 401 handling refreshes
// and re-sends with a *tenant* refresh token, which would be exactly the
// kind of accidental bridge between the two auth domains this exists to
// prevent. Platform sessions are access-only (see backend
// create_platform_admin_token) — no refresh token, no rotation. When the
// token expires, sign in again.

const BASE = import.meta.env.VITE_API_BASE || ''
const API = `${BASE}/api/v1`

const TOKEN_KEY = 'sonic.platform_access_token'

export const getPlatformToken = () => localStorage.getItem(TOKEN_KEY)
export const isPlatformAuthed = () => Boolean(getPlatformToken())

export function clearPlatformToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getPlatformToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) clearPlatformToken()

  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json()).detail || detail } catch { /* non-JSON error body */ }
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export async function platformLogin(email, password) {
  const { access_token } = await request('/platform/auth/login', { method: 'POST', body: { email, password } })
  localStorage.setItem(TOKEN_KEY, access_token)
  return access_token
}

export const platformMe = () => request('/platform/auth/me')
export const platformOverview = () => request('/platform/overview')
export const platformTenants = () => request('/platform/tenants')
export const platformBilling = () => request('/platform/billing')

export function platformLogout() {
  clearPlatformToken()
}
