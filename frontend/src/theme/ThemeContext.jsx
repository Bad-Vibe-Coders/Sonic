import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const TENANTS = {
  helix: { id: 'helix', name: 'Helix Health', cls: 'tenant-helix', initials: 'HH', sector: 'Healthcare' },
  northbank: { id: 'northbank', name: 'NorthBank', cls: 'tenant-northbank', initials: 'NB', sector: 'Financial Services' },
}

// The demo ROLES map lived here and drove a client-side "view as role" switcher.
// Removed in SON-53: roles are now the server-verified ones from /auth/me
// (see lib/roles.js), so a local override would only ever be misleading.

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('sonic-theme')
    if (s) return s === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [tenant, setTenant] = useState('helix')

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.remove('tenant-helix', 'tenant-northbank')
    root.classList.add(TENANTS[tenant].cls)
    localStorage.setItem('sonic-theme', dark ? 'dark' : 'light')
  }, [dark, tenant])

  return (
    <ThemeContext.Provider value={{ dark, setDark, tenant, setTenant }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
