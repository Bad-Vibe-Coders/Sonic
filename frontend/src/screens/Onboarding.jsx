import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card } from '../components/ui'
import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { getOnboardingStatus, completeOnboardingStep, finishOnboarding } from '../lib/api'

const STEPS = [
  { key: 'source', title: 'Connect a data source', sub: 'Stream live calls or import recordings.' },
  { key: 'team', title: 'Invite your team', sub: 'Add the people who will use Sonic.' },
  { key: 'roles', title: 'Assign roles', sub: 'Control what each person sees.' },
]
const sources = [
  { name: 'Twilio', icon: 'Phone' }, { name: 'Genesys', icon: 'Headphones' },
  { name: 'Amazon Connect', icon: 'Cloud' }, { name: 'Upload recordings', icon: 'Upload' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [src, setSrc] = useState('Twilio')
  const [loaded, setLoaded] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    let cancelled = false
    getOnboardingStatus()
      .then(status => {
        if (cancelled) return
        setCompletedSteps(status.completed_steps || [])
        // Resume at the first step that isn't done yet, so a reload doesn't reset progress.
        const firstIncomplete = STEPS.findIndex(s => !(status.completed_steps || []).includes(s.key))
        setStep(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const skip = () => { finishOnboarding().catch(() => {}); nav('/app/admin') }

  const next = async () => {
    try { await completeOnboardingStep(STEPS[step].key) } catch { /* non-fatal, retried on reload */ }
    setCompletedSteps(prev => prev.includes(STEPS[step].key) ? prev : [...prev, STEPS[step].key])
    if (step < 2) {
      setStep(step + 1)
    } else {
      await finishOnboarding().catch(() => {})
      nav('/app/admin')
    }
  }

  if (!loaded) return null

  return (
    <div className="min-h-screen bg-surface-soft py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2"><Logo size={28} /><span className="display text-[18px] text-ink">Sonic</span></Link>
          <button onClick={skip} className="text-[13px] text-muted hover:text-ink">Skip for now</button>
        </div>

        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step || completedSteps.includes(s.key) ? 'ai-gradient' : 'bg-surface-strong'}`} />)}
        </div>

        <Card className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <Badge step={step} />
              <h1 className="display d-md text-ink mt-3">{STEPS[step].title}</h1>
              <p className="text-muted mb-6">{STEPS[step].sub}</p>

              {step === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {sources.map(s => (
                    <button key={s.name} onClick={() => setSrc(s.name)}
                      className={`flex items-center gap-3 p-4 rounded-lg border text-left transition ${src === s.name ? 'border-transparent ring-2 ring-ai-to bg-surface-soft' : 'border-hairline hover:bg-surface-soft'}`}>
                      <span className="w-9 h-9 rounded-md bg-surface-card flex items-center justify-center text-ink"><Icon name={s.icon} size={18} /></span>
                      <span className="text-[14px] font-medium text-ink">{s.name}</span>
                      {src === s.name && <Icon name="CheckCircle2" size={16} className="ml-auto text-ai-to" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input placeholder="teammate@company.com" className="flex-1 h-11 rounded-md border border-hairline bg-surface px-3 outline-none focus:border-ink text-ink text-[15px]" />
                    <Button variant="secondary">Add</Button>
                  </div>
                  {[['Maya Chen', 'maya@acme.com'], ['Liam Ortiz', 'liam@acme.com'], ['Priya Nair', 'priya@acme.com']].map(([n, e]) => (
                    <div key={e} className="flex items-center justify-between p-3 rounded-md bg-surface-soft">
                      <span><span className="block text-[14px] font-medium text-ink">{n}</span><span className="block text-[12px] text-muted">{e}</span></span>
                      <span className="text-[12px] text-warning">Pending invite</span>
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {[['Maya Chen', 'Supervisor / QA'], ['Liam Ortiz', 'Agent'], ['Priya Nair', 'QA Analyst']].map(([n, r]) => (
                    <div key={n} className="flex items-center justify-between p-3 rounded-md bg-surface-soft">
                      <span className="text-[14px] font-medium text-ink">{n}</span>
                      <select defaultValue={r} className="h-9 rounded-md border border-hairline bg-surface px-2 text-[13px] text-ink outline-none">
                        <option>Tenant Admin</option><option>Supervisor / QA</option><option>QA Analyst</option><option>Agent</option><option>Executive</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
                <Button onClick={next} className="flex-1">{step < 2 ? 'Continue' : 'Finish & open dashboard'}</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}

function Badge({ step }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-surface-card text-ink">Step {step + 1} of 3</span>
}
