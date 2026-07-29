import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import Icon from '../components/Icon'
import { acceptInvite, getOnboardingStatus } from '../lib/api'
import { homeFor } from '../lib/roles'
import { useAuth } from '../lib/AuthContext'

// Reached from the accept link an admin copies out of Settings > Team & roles
// (SON-49) — there's no email provider wired up, so the link is shared by hand.
export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const nav = useNavigate()
  const { refresh } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    try {
      await acceptInvite(token, password, name.trim() || null)
      const status = await getOnboardingStatus().catch(() => ({ completed_at: true }))
      if (!status.completed_at) { nav('/onboarding'); return }
      const who = await refresh()
      nav(homeFor(who?.role))
    } catch (e) {
      setError(e.status === 404 ? 'This invitation link is invalid or already used.' : `Couldn't join: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-soft">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl text-white font-bold text-[20px] inline-flex items-center justify-center mb-3" style={{ background: 'rgb(var(--primary))' }}>
            <Icon name="UserPlus" size={22} />
          </span>
          <h1 className="display d-sm text-ink">Join your team</h1>
          <p className="text-[13px] text-muted mt-1">Set a password to activate your account.</p>
        </div>

        {!token && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> Missing invitation token.</p>}

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Name (optional)</label>
            <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
              <Icon name="User" size={16} className="text-muted" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Password</label>
            <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
              <Icon name="Lock" size={16} className="text-muted" />
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" minLength={8} placeholder="••••••••" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
            </div>
          </div>
          {error && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
          <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} disabled={busy || !token} onClick={submit}>{busy ? 'Joining…' : 'Join team'}</Button>
        </div>

        <p className="text-[13px] text-muted text-center mt-6">Already have an account? <Link to="/login" className="text-ink font-semibold">Sign in</Link></p>
      </motion.div>
    </div>
  )
}
