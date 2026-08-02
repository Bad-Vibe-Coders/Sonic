import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import Icon from '../components/Icon'
import { forgotPassword } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      // The backend always responds the same way whether or not the email
      // is registered, so there's nothing role/account-specific to branch on.
      await forgotPassword(email)
      setSent(true)
    } catch (e) {
      setError(`Something went wrong: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-soft">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl text-white font-bold text-[20px] inline-flex items-center justify-center mb-3" style={{ background: 'rgb(var(--primary))' }}>S</span>
          <h1 className="display d-sm text-ink">Reset your password</h1>
          <p className="text-[13px] text-muted mt-1">We&rsquo;ll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-[13px] text-success flex items-center justify-center gap-1.5"><Icon name="CheckCircle2" size={14} /> If that email is registered, a reset link is on its way.</p>
            <Link to="/login" className="text-[13px] text-ink font-semibold inline-block">Back to sign in</Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Email</label>
              <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
                <Icon name="Mail" size={16} className="text-muted" />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent outline-none text-ink text-[15px]"
                />
              </div>
            </div>
            {error && <p className="text-[13px] text-error flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
            <Button className="w-full" style={{ background: 'rgb(var(--primary))', color: 'rgb(var(--on-primary))' }} disabled={busy || !email} onClick={submit}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
            <p className="text-[13px] text-muted text-center pt-1"><Link to="/login" className="text-ink font-semibold">Back to sign in</Link></p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
