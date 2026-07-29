import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../components/Icon'
import { platformLogin } from '../lib/platformApi'
import { usePlatformAuth } from '../lib/PlatformAuthContext'

// Dedicated sign-in screen for the SaaS vendor's own operators — separate
// route, separate form, separate dark/amber chrome from the tenant Login
// screen so it never reads as part of the tenant product (SON-64). Nothing
// in the tenant app links here, and this never links back into /app.
export default function PlatformLogin() {
  const nav = useNavigate()
  const { refresh } = usePlatformAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      await platformLogin(email, password)
      await refresh()
      nav('/platform')
    } catch (e) {
      setError(e.status === 401 ? 'Invalid email or password.' : `Sign-in failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b1220]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111a2c] shadow-card p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl bg-amber-400 text-[#0b1220] font-bold text-[20px] inline-flex items-center justify-center mb-3">
            <Icon name="ShieldHalf" size={22} />
          </span>
          <h1 className="display d-sm text-white">Sonic Control Plane</h1>
          <p className="text-[13px] text-white/50 mt-1">Platform admin sign-in</p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium text-white/70 mb-1.5">Email</label>
            <div className="flex items-center h-11 rounded-md border border-white/10 bg-[#0b1220] focus-within:border-amber-400/60 px-3 gap-2">
              <Icon name="Mail" size={16} className="text-white/40" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@sonic.dev" className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder:text-white/30" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-white/70 mb-1.5">Password</label>
            <div className="flex items-center h-11 rounded-md border border-white/10 bg-[#0b1220] focus-within:border-amber-400/60 px-3 gap-2">
              <Icon name="Lock" size={16} className="text-white/40" />
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="••••••••" className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder:text-white/30" />
            </div>
          </div>
          {error && <p className="text-[13px] text-red-400 flex items-center gap-1.5"><Icon name="AlertCircle" size={14} /> {error}</p>}
          <button
            className="w-full h-11 rounded-md bg-amber-400 text-[#0b1220] font-semibold text-[14px] disabled:opacity-60"
            disabled={busy} onClick={submit}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
