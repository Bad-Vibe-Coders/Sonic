import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { me, isAuthed, clearTokens, getTenantSettings } from './api'

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

  // Resolves the current identity. Callers sign in *after* this provider has
  // mounted, so signing in has to be able to re-run it — otherwise the provider
  // keeps the signed-out answer, the guards see no role, and the user is bounced
  // back to /login immediately after a successful login.
  const load = useCallback(async () => {
    if (!isAuthed()) { setUser(null); setTenant(null); return null }

    setUser(undefined)
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

  const value = {
    user: user ?? null,
    role: user?.role ?? null,
    platformAdmin: Boolean(user?.platform_admin),
    loading: user === undefined,
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
