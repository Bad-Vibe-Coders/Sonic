import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { me, isAuthed, clearTokens, getTenantSettings, setSessionExpiredHandler } from './api'

const AuthContext = createContext(null)

// Loads the signed-in user's real identity once and shares it with the route
// guards, the nav, and anything that names the current organization.
//
// Why /auth/me and not the JWT: `role` is in the token, but `platform_admin` is
// not — and decoding an unverified token client-side to make access decisions is
// a bad habit. /auth/me is verified server-side, so it is the single source of
// truth for both.
//
// The tenant comes from /settings/tenant for the same reason: the organization
// you belong to is decided by your token's tenant_id, not by a client-side
// picker (SON-54).
export function AuthProvider({ children }) {
  // undefined = still resolving, null = not signed in, object = the user.
  const [user, setUser] = useState(() => (isAuthed() ? undefined : null))
  const [tenant, setTenant] = useState(null)
  // Latches when a live session dies, so whichever redirect reaches /login first
  // can say why. Clearing the tokens also makes RequireAuth re-render and
  // redirect on its own, and that one would otherwise arrive with no reason
  // attached (SON-60).
  const [sessionExpired, setSessionExpired] = useState(false)
  const navigate = useNavigate()
  // The expiry handler is registered once, so read the location through a ref
  // rather than re-registering on every navigation.
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  // Resolves the current identity. Callers sign in *after* this provider has
  // mounted, so signing in has to be able to re-run it — otherwise the provider
  // keeps the signed-out answer, the guards see no role, and the user is bounced
  // back to /login immediately after a successful login.
  const load = useCallback(async () => {
    if (!isAuthed()) { setUser(null); setTenant(null); return null }

    setUser(undefined)
    setSessionExpired(false)
    // Tenant naming is cosmetic, so a failure here must never block the app or
    // invalidate the session — screens fall back to a neutral label.
    getTenantSettings().then(setTenant).catch(() => setTenant(null))

    try {
      const u = await me()
      setUser(u)
      return u
    } catch (err) {
      // A rejected token is indistinguishable from being signed out, so drop it
      // rather than leaving the app in a half-authenticated state.
      if (err.status === 401) clearTokens()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => { load() }, [load])

  // When the API client confirms both tokens are dead, drop the cached identity
  // and send the user to /login inside the router — a hard reload would throw
  // away the app and lose the page they were on (SON-60).
  useEffect(() => setSessionExpiredHandler(() => {
    setSessionExpired(true)
    setUser(null)
    setTenant(null)
    if (locationRef.current.pathname === '/login') return
    navigate('/login', {
      replace: true,
      state: { from: `${locationRef.current.pathname}${locationRef.current.search}`, expired: true },
    })
  }), [navigate])

  const value = {
    user: user ?? null,
    role: user?.role ?? null,
    platformAdmin: Boolean(user?.platform_admin),
    loading: user === undefined,
    sessionExpired,
    tenant,
    tenantName: tenant?.name ?? null,
    refresh: load,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
