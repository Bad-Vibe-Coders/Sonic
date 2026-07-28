import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme, TENANTS } from '../theme/ThemeContext'
import { Button } from '../components/ui'
import { TenantSwitcher, ThemeToggle } from '../layouts/Controls'
import Icon from '../components/Icon'
import { login, getOnboardingStatus } from '../lib/api'

// Subdomain-aware login: the tenant's brand color + logo load BEFORE auth.
export default function Login() {
  const { tenant } = useTheme()
  const t = TENANTS[tenant]
  const nav = useNavigate()
  // Where RequireAuth bounced us from, so a deep-link survives the login detour.
  const from = useLocation().state?.from
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      await login(email, password)
      const status = await getOnboardingStatus().catch(() => ({ completed_at: true }))
      if (!status.completed_at) nav('/onboarding')
      else nav(from || '/app/admin')
    } catch (e) {
      setError(e.status === 401 ? 'Invalid email or password.' : `Sign-in failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-soft relative">
      <div className="absolute top-5 right-5 flex gap-2 items-center">
        <span className="text-[12px] text-muted hidden sm:block mr-1">Simulate tenant:</span>
        <TenantSwitcher /><ThemeToggle />
      </div>

      <motion.div key={tenant} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface shadow-card p-8">
        {/* tenant brand header (loads from subdomain) */}
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl text-white font-bold text-[20px] inline-flex items-center justify-center mb-3" style={{ background: 'rgb(var(--primary))' }}>{t.initials}</span>
          <h1 className="display d-sm text-ink">{t.name}</h1>
          <p className="text-[13px] text-muted font-mono mt-1">{t.id}.sonic.ai</p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Email</label>
            <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
              <Icon name="Mail" size={16} className="text-muted" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5"><label className="text-[13px] font-medium text-ink">Password</label><a className="text-[12px] text-muted hover:text-ink">Forgot?</a></div>
            <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
              <Icon name="Lock" size={16} className="text-muted" />
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="••••••••" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
            </div>
          </div>
          {error && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
          <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} disabled={busy} onClick={submit}>{busy ? 'Signing in…' : `Sign in to ${t.name}`}</Button>
          <button className="w-full h-10 rounded-md border border-hairline bg-surface text-ink text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-surface-soft" onClick={() => nav('/app/admin')}>
            <Icon name="KeyRound" size={16} /> Continue with SSO
          </button>
          <button
            type="button"
            className="w-full h-9 rounded-md text-[13px] text-muted font-medium flex items-center justify-center gap-1.5 hover:text-ink"
            onClick={() => { setEmail('demo@sonic.dev'); setPassword('demo1234') }}
          >
            <Icon name="Wand2" size={14} /> Fill demo credentials
          </button>
        </div>

        <p className="text-[13px] text-muted text-center mt-6">New organization? <Link to="/signup" className="text-ink font-semibold">Create workspace</Link></p>
      </motion.div>
    </div>
  )
}
