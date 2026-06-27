import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const TENANTS = {
  helix: { id: 'helix', name: 'Helix Health', cls: 'tenant-helix', initials: 'HH', sector: 'Healthcare' },
  northbank: { id: 'northbank', name: 'NorthBank', cls: 'tenant-northbank', initials: 'NB', sector: 'Financial Services' },
}

export const ROLES = {
  admin: { id: 'admin', label: 'Tenant Admin', home: '/app/admin' },
  supervisor: { id: 'supervisor', label: 'Supervisor / QA', home: '/app/supervisor' },
  analyst: { id: 'analyst', label: 'QA Analyst', home: '/app/conversations' },
  agent: { id: 'agent', label: 'Agent', home: '/app/agent' },
  exec: { id: 'exec', label: 'Executive', home: '/app/analytics' },
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('sonic-theme')
    if (s) return s === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [tenant, setTenant] = useState('helix')
  const [role, setRole] = useState('admin')

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.remove('tenant-helix', 'tenant-northbank')
    root.classList.add(TENANTS[tenant].cls)
    localStorage.setItem('sonic-theme', dark ? 'dark' : 'light')
  }, [dark, tenant])

  return (
    <ThemeContext.Provider value={{ dark, setDark, tenant, setTenant, role, setRole }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
