import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { platformMe, isPlatformAuthed, clearPlatformToken } from './platformApi'

const PlatformAuthContext = createContext(null)

// Identity provider for the platform control plane — deliberately its own
// context, never nested inside the tenant AuthProvider (SON-64). It only
// ever wraps the /platform route subtree (see App.jsx), so a platform
// session and a tenant session can coexist without either resolving into
// the other.
export function PlatformAuthProvider({ children }) {
  // undefined = still resolving, null = not signed in, object = the admin.
  const [admin, setAdmin] = useState(() => (isPlatformAuthed() ? undefined : null))

  const load = useCallback(async () => {
    if (!isPlatformAuthed()) { setAdmin(null); return null }
    setAdmin(undefined)
    try {
      const a = await platformMe()
      setAdmin(a)
      return a
    } catch (err) {
      if (err.status === 401) clearPlatformToken()
      setAdmin(null)
      return null
    }
  }, [])

  useEffect(() => { load() }, [load])

  const value = {
    admin: admin ?? null,
    loading: admin === undefined,
    refresh: load,
  }

  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>
}

export function usePlatformAuth() {
  const ctx = useContext(PlatformAuthContext)
  if (!ctx) throw new Error('usePlatformAuth must be used inside <PlatformAuthProvider>')
  return ctx
}
