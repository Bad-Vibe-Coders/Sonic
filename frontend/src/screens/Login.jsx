import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { ThemeToggle } from '../layouts/Controls'
import Icon from '../components/Icon'
import { login, getOnboardingStatus } from '../lib/api'
import { homeFor } from '../lib/roles'
import { useAuth } from '../lib/AuthContext'
import { extractSubdomain, redirectToTenant } from '../lib/tenantRedirect'

// Universal sign-in: email + password alone resolve the tenant server-side
// (SON-66). No tenant is named or shown before credentials are verified.
export default function Login() {
  const nav = useNavigate()
  const { refresh } = useAuth()
  // Where RequireAuth bounced us from, so a deep-link survives the login detour.
  const { state } = useLocation()
  const from = state?.from
  // Set when a session died mid-use, so the bounce back here is explained
  // rather than looking like a random logout (SON-60).
  const expired = Boolean(state?.expired)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      const tokens = await login(email, password)
      const status = await getOnboardingStatus().catch(() => ({ completed_at: true }))
      const destination = status.completed_at ? null : '/onboarding'

      // The backend resolves the tenant from the email alone (SON-66); if
      // that tenant's subdomain isn't the one we're already on, hop there
      // with the resolved destination instead of navigating locally.
      const currentSubdomain = extractSubdomain(window.location.hostname)
      if (tokens.tenant_subdomain && tokens.tenant_subdomain !== currentSubdomain) {
        redirectToTenant(tokens.tenant_subdomain, destination || from || '/app', tokens)
        return
      }

      if (destination) { nav(destination); return }
      // Pull the new identity into the shared context before navigating: the
      // provider mounted while signed out, so without this the route guards
      // still see no role and bounce straight back here. It also gives us the
      // real role, so we can land on a page this account can actually open
      // instead of sending everyone to /app/admin (SON-54).
      const who = await refresh()
      nav(from || homeFor(who?.role))
    } catch (e) {
      setError(e.status === 401 ? 'Invalid email or password.' : `Sign-in failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-soft relative">
      <div className="absolute top-5 right-5 flex gap-2 items-center">
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl text-white font-bold text-[20px] inline-flex items-center justify-center mb-3" style={{ background: 'rgb(var(--primary))' }}>S</span>
          <h1 className="display d-sm text-ink">Sign in</h1>
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
            <div className="flex justify-between mb-1.5"><label className="text-[13px] font-medium text-ink">Password</label><Link to="/forgot-password" className="text-[12px] text-muted hover:text-ink">Forgot?</Link></div>
            <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
              <Icon name="Lock" size={16} className="text-muted" />
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="••••••••" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
            </div>
          </div>
          {expired && !error && <p className="text-[13px] text-warning flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> Your session expired. Please sign in again.</p>}
          {error && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
          <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} disabled={busy} onClick={submit}>{busy ? 'Signing in…' : 'Sign in'}</Button>
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
