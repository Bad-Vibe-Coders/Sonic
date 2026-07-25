import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { ThemeToggle, TenantSwitcher, RoleSwitcher } from './Controls'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { Avatar } from '../components/ui'

const ALL_NAV = [
  { to: '/app/admin', label: 'Admin', icon: 'LayoutDashboard', roles: ['admin'] },
  { to: '/app/supervisor', label: 'Supervisor', icon: 'Gauge', roles: ['supervisor'] },
  { to: '/app/agent', label: 'My Calls', icon: 'Headphones', roles: ['agent'] },
  { to: '/app/conversations', label: 'Conversations', icon: 'MessagesSquare', roles: ['admin', 'supervisor', 'analyst', 'agent', 'exec'] },
  { to: '/app/analytics', label: 'Analytics', icon: 'BarChart3', roles: ['admin', 'supervisor', 'exec'] },
  { to: '/app/health', label: 'System Health', icon: 'Activity', roles: ['admin'] },
  { to: '/app/notifications', label: 'Alerts', icon: 'Bell', roles: ['admin', 'supervisor', 'analyst', 'agent', 'exec'] },
  { to: '/app/billing', label: 'Billing', icon: 'CreditCard', roles: ['admin'] },
  { to: '/app/settings', label: 'Settings', icon: 'Settings', roles: ['admin'] },
  { to: '/app/states', label: 'UI States', icon: 'Layers', roles: ['admin'] },
]

export default function AppShell() {
  const { role } = useTheme()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const items = ALL_NAV.filter(n => n.roles.includes(role))

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-60 bg-surface border-r border-hairline flex flex-col transition-transform ${open ? '' : '-translate-x-full lg:translate-x-0'}`}>
        <Link to="/" className="h-16 px-5 flex items-center gap-2 border-b border-hairline">
          <Logo size={28} />
          <span className="display text-[18px] text-ink">Sonic</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(n => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 h-10 rounded-md text-[14px] font-medium transition
                ${isActive ? 'bg-primary-soft text-ink' : 'text-body hover:bg-surface-soft'}`}>
              <Icon name={n.icon} size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-hairline">
          <Link to="/platform" className="flex items-center gap-3 px-3 h-10 rounded-md text-[13px] text-muted hover:bg-surface-soft transition">
            <Icon name="ShieldHalf" size={17} /> Platform Admin
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-canvas/90 backdrop-blur border-b border-hairline flex items-center gap-3 px-4 lg:px-6">
          <button className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-md border border-hairline" onClick={() => setOpen(o => !o)}>
            <Icon name="Menu" size={18} />
          </button>
          <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-surface-soft border border-hairline text-muted flex-1 max-w-sm">
            <Icon name="Search" size={16} />
            <input placeholder="Search conversations, agents…" className="bg-transparent outline-none text-[13px] text-ink w-full placeholder:text-muted" />
          </div>
          <div className="flex-1" />
          <TenantSwitcher />
          <RoleSwitcher />
          <ThemeToggle />
          <button onClick={() => nav('/app/notifications')} className="relative w-9 h-9 inline-flex items-center justify-center rounded-md border border-hairline bg-surface hover:bg-surface-soft">
            <Icon name="Bell" size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulseGlow" />
          </button>
          <Avatar name="You Operator" size={34} />
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-content w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
