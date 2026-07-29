import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './Controls'
import Icon from '../components/Icon'
import { Avatar } from '../components/ui'
import { platformLogout } from '../lib/platformApi'
import { usePlatformAuth } from '../lib/PlatformAuthContext'

// Platform Super Admin = the SaaS vendor control plane. Deliberately different
// chrome: dark slate top rail + amber accent, so it never reads as a tenant view.
//
// No link back into /app anywhere in this shell (SON-64) — a platform admin
// account has no tenant to switch to; the old "Tenant app" link was a stray
// bridge between the two auth domains this ticket exists to remove.
const NAV = [
  { to: '/platform', label: 'Overview', icon: 'Globe', end: true },
  { to: '/platform/tenants', label: 'Tenants', icon: 'Building2' },
  { to: '/platform/billing', label: 'Usage & Billing', icon: 'Receipt' },
  { to: '/platform/health', label: 'Fleet Health', icon: 'ServerCog' },
]

export default function AdminShell() {
  const { admin } = usePlatformAuth()
  const nav = useNavigate()

  function handleLogout() {
    platformLogout()
    nav('/platform/login')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-[#0b1220] text-white">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center gap-6">
          <Link to="/platform" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-400 text-[#0b1220] inline-flex items-center justify-center"><Icon name="ShieldHalf" size={16} /></span>
            <span className="display text-[16px]">Sonic <span className="text-amber-400">Control Plane</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `flex items-center gap-2 px-3 h-9 rounded-md text-[13px] font-medium transition
                  ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <Icon name={n.icon} size={16} /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1" />
          <ThemeToggle />
          <button onClick={handleLogout} title="Sign out"
            className="text-[13px] text-white/60 hover:text-white flex items-center gap-1.5">
            <Icon name="LogOut" size={15} /> Sign out
          </button>
          <Avatar name={admin?.name || admin?.email || 'Platform'} size={32} />
        </div>
      </div>
      <main className="max-w-content mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
