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
  // Holding valid tokens again re-arms expiry reporting for the new session.
  resetSessionExpiry()
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ---- Session expiry ----
// When both the access token and the refresh token are confirmed dead there is
// nothing any individual screen can do about it, so the client reports it once
// and lets the app send the user to /login. Without this the request just
// re-throws a 401 and the shell keeps rendering in a tokenless state (SON-60).
let sessionExpiredHandler = null
let expiryAlreadyReported = false
// Distinguishes "the server rejected the refresh token" (session is over) from
// "the refresh call could not be made" (transient — keep the tokens).
let refreshTokenRejected = false
// Concurrent 401s must share one refresh. Without this the first call rotates
// the tokens and the others send the now-stale refresh token, get rejected, and
// tear down a session that was just renewed.
let refreshInFlight = null

export function setSessionExpiredHandler(fn) {
  sessionExpiredHandler = fn
  return () => { if (sessionExpiredHandler === fn) sessionExpiredHandler = null }
}

// Signing in again makes a later expiry newsworthy once more.
export function resetSessionExpiry() {
  expiryAlreadyReported = false
}

function reportSessionExpired() {
  clearTokens()
  // A dashboard can fire several requests at once; they should not each queue a
  // navigation. Report the first, ignore the rest until the next sign-in.
  if (expiryAlreadyReported) return
  expiryAlreadyReported = true

  if (sessionExpiredHandler) {
    sessionExpiredHandler()
  } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // No app listening yet (e.g. a call fired before mount) — fall back to a
    // hard redirect so the user never sits in a broken shell.
    window.location.assign('/login')
  }
}

// Auth endpoints own their own 401s: a bad password on /auth/login is not an
// expired session, and refreshing in response to one makes no sense.
const isAuthEndpoint = (path) => path.startsWith('/auth/login') || path.startsWith('/auth/refresh')

async function request(path, { method = 'GET', body, headers = {}, raw = false, retry = true } = {}) {
  const token = getToken()
  // Only a request we actually sent credentials for can represent an *expired*
  // session. A 401 with nothing in hand just means "not signed in", which is
  // the route guard's business, not a reason to yank someone off a public page.
  const hadCredentials = Boolean(token) || Boolean(localStorage.getItem(REFRESH_KEY))
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(raw ? {} : body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && hadCredentials && !isAuthEndpoint(path)) {
    if (retry && localStorage.getItem(REFRESH_KEY)) {
      const refreshed = await tryRefresh()
      if (refreshed) return request(path, { method, body, headers, raw, retry: false })
      // Refresh was rejected outright — the session is over. A refresh that
      // merely failed to send (offline) is transient, so leave it alone.
      if (refreshTokenRejected) reportSessionExpired()
    } else {
      // Either there was no refresh token to try, or the retried request came
      // back 401 too. Both mean the credentials we hold are dead.
      reportSessionExpired()
    }
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
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    refreshTokenRejected = false
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: localStorage.getItem(REFRESH_KEY) }),
      })
      if (!res.ok) { refreshTokenRejected = true; clearTokens(); return false }
      setTokens(await res.json())
      return true
    } catch {
      // Network failure, not a verdict on the token — leave it alone so a
      // flaky connection does not log the user out.
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
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

// Ends this device's session server-side, so the refresh token cannot be used
// again even if someone has a copy of it (SON-61). Previously logout only
// cleared localStorage, which left an exfiltrated token valid for its full
// 14-day life.
//
// The local tokens go first, before the network call. SON-56's menu calls this
// without awaiting and navigates straight away, so clearing afterwards would
// leave live tokens in localStorage while the user is already on /login. It
// also means a failed or slow call can never leave them apparently signed in.
export async function logout() {
  const refresh_token = localStorage.getItem(REFRESH_KEY)
  clearTokens()
  try {
    if (refresh_token) await request('/auth/logout', { method: 'POST', body: { refresh_token } })
  } catch { /* best effort — the local session has already ended */ }
}

// "Sign out everywhere" — revokes every refresh token this user holds, which is
// the recovery path for a token you believe was stolen.
export async function logoutAll() {
  try {
    // Needs the access token, so this one revokes before clearing.
    await request('/auth/logout-all', { method: 'POST' })
  } catch { /* best effort — the local session ends regardless */ }
  clearTokens()
}

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

// ---- Team & roles ----
export const listTeamMembers = () => request('/team/members')
export const listInvitations = () => request('/team/invitations')
export const inviteTeamMember = (email, role) => request('/team/invite', { method: 'POST', body: { email, role } })
export const revokeInvitation = (id) => request(`/team/invitations/${id}`, { method: 'DELETE' })
export const updateMemberRole = (id, role) => request(`/team/members/${id}/role`, { method: 'PUT', body: { role } })
export const removeTeamMember = (id) => request(`/team/members/${id}`, { method: 'DELETE' })
export async function acceptInvite(token, password, name) {
  const tokens = await request('/team/accept-invite', { method: 'POST', body: { token, password, name } })
  setTokens(tokens)
  return tokens
}

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
