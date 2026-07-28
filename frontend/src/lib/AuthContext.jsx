import { createContext, useContext, useEffect, useState } from 'react'
import { me, isAuthed, clearTokens } from './api'

const AuthContext = createContext(null)

// Loads the signed-in user's real identity once and shares it with the route
// guards and the nav.
//
// Why /auth/me and not the JWT: `role` is in the token, but `platform_admin` is
// not — and decoding an unverified token client-side to make access decisions is
// a bad habit. /auth/me is verified server-side, so it is the single source of
// truth for both.
export function AuthProvider({ children }) {
  // undefined = still resolving, null = not signed in, object = the user.
  const [user, setUser] = useState(() => (isAuthed() ? undefined : null))

  useEffect(() => {
    let cancelled = false
    if (!isAuthed()) { setUser(null); return }

    me()
      .then(u => { if (!cancelled) setUser(u) })
      .catch(err => {
        if (cancelled) return
        // A rejected token is indistinguishable from being signed out, so drop
        // it rather than leaving the app in a half-authenticated state.
        if (err.status === 401) clearTokens()
        setUser(null)
      })

    return () => { cancelled = true }
  }, [])

  const value = {
    user: user ?? null,
    role: user?.role ?? null,
    platformAdmin: Boolean(user?.platform_admin),
    loading: user === undefined,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
