// API client for the Sonic FastAPI backend.
// In dev, Vite proxies /api and /ws to the backend (see vite.config.js).

const BASE = import.meta.env.VITE_API_BASE || ''
const API = `${BASE}/api/v1`

const TOKEN_KEY = 'sonic.access_token'
const REFRESH_KEY = 'sonic.refresh_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const isAuthed = () => Boolean(getToken())

export function setTokens({ access_token, refresh_token }) {
  localStorage.setItem(TOKEN_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function request(path, { method = 'GET', body, headers = {}, raw = false, retry = true } = {}) {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(raw ? {} : body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && retry && localStorage.getItem(REFRESH_KEY)) {
    const refreshed = await tryRefresh()
    if (refreshed) return request(path, { method, body, headers, raw, retry: false })
  }

  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json()).detail || detail } catch { /* non-JSON error body */ }
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: localStorage.getItem(REFRESH_KEY) }),
    })
    if (!res.ok) { clearTokens(); return false }
    setTokens(await res.json())
    return true
  } catch {
    return false
  }
}

// ---- Auth ----
export async function login(email, password) {
  const tokens = await request('/auth/login', { method: 'POST', body: { email, password } })
  setTokens(tokens)
  return tokens
}

export async function register({ tenant_name, subdomain, email, password }) {
  const tokens = await request('/auth/register', {
    method: 'POST',
    body: { tenant_name, subdomain, email, password },
  })
  setTokens(tokens)
  return tokens
}

export const me = () => request('/auth/me')
export const logout = clearTokens

export const forgotPassword = (email) => request('/auth/forgot-password', { method: 'POST', body: { email } })
export const resetPassword = (token, new_password) =>
  request('/auth/reset-password', { method: 'POST', body: { token, new_password } })

// ---- Conversations ----
export const listConversations = ({ limit = 50, offset = 0 } = {}) =>
  request(`/conversations?limit=${limit}&offset=${offset}`)

export const getConversation = (id) => request(`/conversations/${id}`)

export function uploadConversation(file, title) {
  const form = new FormData()
  form.append('file', file)
  const qs = title ? `?title=${encodeURIComponent(title)}` : ''
  return request(`/conversations${qs}`, { method: 'POST', body: form, raw: true })
}

// ---- Analytics / search / health ----
export const analyticsOverview = () => request('/analytics/overview')
export const analyticsVolume = (days = 14) => request(`/analytics/volume?days=${days}`)
export const analyticsCompliance = () => request('/analytics/compliance')
export const analyticsRisks = () => request('/analytics/risks')
export const analyticsAgents = () => request('/analytics/agents')

// ---- Notifications ----
export const listNotifications = () => request('/notifications')
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'POST' })
export const markAllNotificationsRead = () => request('/notifications/read-all', { method: 'POST' })

// ---- Settings ----
export const getUserSettings = () => request('/settings/me')
export const updateUserSettings = (body) => request('/settings/me', { method: 'PUT', body })
export const changePassword = (current_password, new_password) =>
  request('/settings/me/password', { method: 'PUT', body: { current_password, new_password } })
export const getTenantSettings = () => request('/settings/tenant')
export const updateTenantSettings = (body) => request('/settings/tenant', { method: 'PUT', body })

// ---- Billing ----
export const getBillingSummary = () => request('/billing/me')
export const listBillingPlans = () => request('/billing/plans')
export const listInvoices = () => request('/billing/invoices')
export const changePlan = (plan_code) => request('/billing/plan', { method: 'PUT', body: { plan_code } })

// ---- Onboarding ----
export const getOnboardingStatus = () => request('/onboarding')
export const completeOnboardingStep = (step) => request('/onboarding/steps', { method: 'POST', body: { step } })
export const finishOnboarding = () => request('/onboarding/finish', { method: 'POST' })

// ---- Leads (public marketing-site contact/demo forms) ----
export const submitLead = ({ name, email, company, message, source }) =>
  request('/leads', { method: 'POST', body: { name, email, company, message, source } })

// ---- Platform (cross-tenant admin) ----
export const platformTenants = () => request('/platform/tenants')
export const platformOverview = () => request('/platform/overview')
export const search = (q) => request(`/search?q=${encodeURIComponent(q)}`)
export const health = () => request('/health')
export const pipelineHealth = () => request('/health/pipeline')

// WebSocket for live pipeline updates on a conversation.
export function conversationSocket(conversationId) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  return new WebSocket(`${proto}://${location.host}/ws/conversations/${conversationId}`)
}
