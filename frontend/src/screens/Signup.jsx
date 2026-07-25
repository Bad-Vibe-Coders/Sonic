import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui'
import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { register } from '../lib/api'

const STEPS = ['Account', 'Workspace', 'Setup']

export default function Signup() {
  const [step, setStep] = useState(0)
  const [sub, setSub] = useState('acme')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState(null)
  const [provPct, setProvPct] = useState(0)
  const nav = useNavigate()

  useEffect(() => {
    if (step !== 2) return
    let cancelled = false
    register({ tenant_name: orgName || sub, subdomain: sub, email, password })
      .catch(e => {
        if (cancelled) return
        setError(e.status === 409 ? 'That subdomain or email is already taken.' : `Signup failed: ${e.message}`)
        setStep(1)
        setProvPct(0)
      })
    const id = setInterval(() => setProvPct(p => {
      if (p >= 100) { clearInterval(id); setTimeout(() => nav('/onboarding'), 600); return 100 }
      return p + 4
    }), 90)
    return () => { cancelled = true; clearInterval(id) }
  }, [step, nav]) // eslint-disable-line react-hooks/exhaustive-deps

  const provSteps = ['Reserving subdomain', 'Provisioning isolated tenant', 'Spinning up AI pipeline', 'Seeding dashboards']

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0b0b0d] text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full ai-gradient opacity-20 blur-3xl" />
        <Link to="/" className="flex items-center gap-2 relative"><Logo size={28} /><span className="display text-[18px]">Sonic</span></Link>
        <div className="relative">
          <h2 className="display d-lg">Stand up your own<br /><span className="ai-text">conversation intelligence</span> workspace.</h2>
          <p className="text-white/60 mt-4 max-w-sm">Subdomain-isolated, white-labeled, and wired to the full AI pipeline the moment you finish.</p>
          <div className="flex gap-6 mt-8 text-[13px] text-white/50">
            <span className="flex items-center gap-2"><Icon name="Lock" size={15} /> Tenant isolation</span>
            <span className="flex items-center gap-2"><Icon name="Palette" size={15} /> Your branding</span>
          </div>
        </div>
        <span className="text-[12px] text-white/30 relative">SOC 2 · GDPR · HIPAA</span>
      </div>

      {/* Right: form */}
      <div className="flex flex-col p-6 sm:p-12 bg-canvas">
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-[12px] font-semibold inline-flex items-center justify-center ${i <= step ? 'ai-gradient text-white' : 'bg-surface-card text-muted'}`}>{i < step ? <Icon name="Check" size={14} /> : i + 1}</span>
              <span className={`text-[13px] ${i <= step ? 'text-ink font-medium' : 'text-muted'}`}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-8 h-px bg-hairline" />}
            </div>
          ))}
        </div>

        <div className="flex-1 max-w-md w-full mx-auto flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="display d-md text-ink mb-1">Create your account</h1>
                <p className="text-muted mb-6">Start free — no card required.</p>
                <Field label="Work email" placeholder="you@company.com" icon="Mail" value={email} onChange={e => setEmail(e.target.value)} />
                <Field label="Full name" placeholder="Jordan Lee" icon="User" />
                <Field label="Password" placeholder="••••••••" icon="Lock" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <Button className="w-full mt-2" onClick={() => setStep(1)}>Continue</Button>
                <p className="text-[13px] text-muted text-center mt-4">Already have an account? <Link to="/login" className="text-ink font-semibold">Sign in</Link></p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="display d-md text-ink mb-1">Claim your subdomain</h1>
                <p className="text-muted mb-6">This is where your team will sign in.</p>
                <Field label="Organization name" placeholder="Acme Corp" icon="Building2" value={orgName} onChange={e => setOrgName(e.target.value)} />
                {error && <p className="text-[13px] text-error flex items-center gap-1.5 mb-3"><Icon name="AlertCircle" size={14} /> {error}</p>}
                <label className="block text-[13px] font-medium text-ink mb-1.5">Subdomain</label>
                <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink overflow-hidden mb-2">
                  <input value={sub} onChange={e => setSub(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="flex-1 px-3 bg-transparent outline-none text-ink text-[15px]" />
                  <span className="px-3 text-muted text-[14px] bg-surface-soft h-full flex items-center border-l border-hairline">.sonic.ai</span>
                </div>
                <p className="text-[13px] text-success flex items-center gap-1.5 mb-6"><Icon name="CheckCircle2" size={14} /> {sub || 'your-org'}.sonic.ai is available</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">Back</Button>
                  <Button onClick={() => setStep(2)} className="flex-1">Create workspace</Button>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl ai-gradient mx-auto flex items-center justify-center mb-6 animate-pulseGlow"><Icon name="Loader" size={28} className="text-white animate-spin" /></div>
                <h1 className="display d-md text-ink mb-1">Setting up your workspace</h1>
                <p className="text-muted mb-6 font-mono text-[13px]">{sub}.sonic.ai</p>
                <div className="h-2 rounded-full bg-surface-card overflow-hidden mb-6"><div className="h-full ai-gradient transition-all" style={{ width: `${provPct}%` }} /></div>
                <ul className="space-y-2.5 text-left">
                  {provSteps.map((s, i) => {
                    const done = provPct > (i + 1) * 25
                    const active = provPct > i * 25 && !done
                    return <li key={s} className="flex items-center gap-3 text-[14px]">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center ${done ? 'bg-success text-white' : active ? 'ai-gradient text-white' : 'bg-surface-card text-muted'}`}>
                        {done ? <Icon name="Check" size={12} /> : active ? <Icon name="Loader" size={12} className="animate-spin" /> : i + 1}
                      </span>
                      <span className={done || active ? 'text-ink' : 'text-muted'}>{s}</span>
                    </li>
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon, ...p }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
      <div className="flex items-center h-11 rounded-md border border-hairline bg-surface focus-within:border-ink px-3 gap-2">
        <Icon name={icon} size={16} className="text-muted" />
        <input className="flex-1 bg-transparent outline-none text-ink text-[15px] placeholder:text-muted" {...p} />
      </div>
    </div>
  )
}
