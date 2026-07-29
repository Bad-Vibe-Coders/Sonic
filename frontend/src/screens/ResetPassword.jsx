import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme, TENANTS } from '../theme/ThemeContext'
import { Button } from '../components/ui'
import Icon from '../components/Icon'
import { resetPassword } from '../lib/api'

export default function ResetPassword() {
  const { tenant } = useTheme()
  const t = TENANTS[tenant]
  const nav = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function submit() {
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setBusy(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (e) {
      // The link is single-use and time-limited; both expiry and reuse land here.
      setError(e.status === 400 ? 'This reset link is invalid, expired, or already used.' : `Something went wrong: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-soft">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl text-white font-bold text-[20px] inline-flex items-center justify-center mb-3" style={{ background: 'rgb(var(--primary))' }}>{t.initials}</span>
          <h1 className="display d-sm text-ink">Set a new password</h1>
        </div>

        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-[13px] text-error flex items-center justify-center gap-1.5"><Icon name="AlertCircle" size={14} /> This reset link is missing its token.</p>
            <Link to="/forgot-password" className="text-[13px] text-ink font-semibold inline-block">Request a new link</Link>
          </div>
        ) : done ? (
          <div className="space-y-4 text-center">
            <p className="text-[13px] text-success flex items-center justify-center gap-1.5"><Icon name="CheckCircle2" size={14} /> Your password has been reset.</p>
            <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} onClick={() => nav('/login')}>Sign in</Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">New password</label>
              <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
                <Icon name="Lock" size={16} className="text-muted" />
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="At least 8 characters" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Confirm new password</label>
              <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
                <Icon name="Lock" size={16} className="text-muted" />
                <input value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="Re-enter password" className="flex-1 bg-transparent outline-none text-ink text-[15px]" />
              </div>
            </div>
            {error && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
            <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} disabled={busy} onClick={submit}>
              {busy ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
