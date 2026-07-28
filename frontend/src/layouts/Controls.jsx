import { useState } from 'react'
import { useTheme, TENANTS } from '../theme/ThemeContext'
import { useAuth } from '../lib/AuthContext'
import Icon from '../components/Icon'

export function ThemeToggle() {
  const { dark, setDark } = useTheme()
  return (
    <button onClick={() => setDark(!dark)} title="Toggle theme"
      className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-hairline bg-surface text-body hover:bg-surface-soft transition">
      <Icon name={dark ? 'Sun' : 'Moon'} size={17} />
    </button>
  )
}

function Dropdown({ button, children, width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div onClick={() => setOpen(o => !o)}>{button}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 mt-2 z-40 ${width} rounded-lg border border-hairline bg-elevated shadow-card p-1.5`}>
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        </>
      )}
    </div>
  )
}

// Demo-only: lets the marketing/login screens preview per-tenant branding before
// a token exists. It is deliberately NOT rendered anywhere inside the
// authenticated app — see TenantBadge for that (SON-54).
export function TenantSimulator() {
  const { tenant, setTenant } = useTheme()
  const t = TENANTS[tenant]
  return (
    <Dropdown button={
      <button className="flex items-center gap-2 h-9 px-2.5 rounded-md border border-hairline bg-surface hover:bg-surface-soft transition">
        <span className="w-5 h-5 rounded ai-gradient text-white text-[10px] font-bold inline-flex items-center justify-center">{t.initials}</span>
        <span className="text-[13px] font-semibold text-ink hidden sm:block">{t.name}</span>
        <Icon name="ChevronsUpDown" size={14} className="text-muted" />
      </button>
    }>
      <div className="px-2 py-1.5 text-[11px] font-semibold text-muted uppercase">Preview branding (demo)</div>
      {Object.values(TENANTS).map(o => (
        <button key={o.id} onClick={() => setTenant(o.id)}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left hover:bg-surface-soft ${o.id === tenant ? 'bg-surface-soft' : ''}`}>
          <span className="w-6 h-6 rounded ai-gradient text-white text-[10px] font-bold inline-flex items-center justify-center">{o.initials}</span>
          <span className="flex-1">
            <span className="block text-[13px] font-semibold text-ink">{o.name}</span>
            <span className="block text-[11px] text-muted">{o.sector} · {o.id}.sonic.ai</span>
          </span>
          {o.id === tenant && <Icon name="Check" size={15} className="text-success" />}
        </button>
      ))}
    </Dropdown>
  )
}

// The organization you are actually signed in to. Read-only by design: tenant
// membership is decided by the JWT's tenant_id, not by a picker.
export function TenantBadge() {
  const { tenantName } = useAuth()
  if (!tenantName) return null
  const initials = tenantName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <span className="flex items-center gap-2 h-9 px-2.5 rounded-md border border-hairline bg-surface" title={tenantName}>
      <span className="w-5 h-5 rounded ai-gradient text-white text-[10px] font-bold inline-flex items-center justify-center">{initials}</span>
      <span className="text-[13px] font-semibold text-ink hidden sm:block">{tenantName}</span>
    </span>
  )
}

// RoleSwitcher removed in SON-53: it let anyone "become" another role client-side,
// which is meaningless now that access is decided by the server-verified role from
// /auth/me. Sign in as a user with the role you want to see.
