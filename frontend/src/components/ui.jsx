import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* ---------- Button ---------- */
export function Button({ variant = 'primary', size = 'md', className = '', as: As = 'button', ...p }) {
  const sizes = { sm: 'h-9 px-3.5 text-[13px]', md: 'h-10 px-5 text-[14px]', lg: 'h-11 px-6 text-[15px]' }
  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90',
    secondary: 'bg-surface text-ink border border-hairline hover:bg-surface-soft',
    ghost: 'text-body hover:bg-surface-soft',
    ai: 'ai-gradient text-white hover:shadow-glow',
    danger: 'bg-error text-white hover:opacity-90',
  }
  return <As className={`inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${sizes[size]} ${variants[variant]} ${className}`} {...p} />
}

/* ---------- Card ---------- */
export function Card({ className = '', soft = false, ...p }) {
  return <div className={`rounded-lg border border-hairline ${soft ? 'bg-surface-card' : 'bg-surface'} shadow-soft ${className}`} {...p} />
}

/* ---------- Badge / StatusChip ---------- */
const chipMap = {
  pass: 'text-success bg-success/10', healthy: 'text-success bg-success/10', active: 'text-success bg-success/10', success: 'text-success bg-success/10',
  review: 'text-warning bg-warning/10', reviewing: 'text-warning bg-warning/10', degraded: 'text-warning bg-warning/10', provisioning: 'text-warning bg-warning/10', warning: 'text-warning bg-warning/10', 'at-risk': 'text-warning bg-warning/10',
  fail: 'text-error bg-error/10', error: 'text-error bg-error/10', suspended: 'text-error bg-error/10',
  idle: 'text-muted bg-surface-strong/40', analyzed: 'text-info bg-info/10', info: 'text-info bg-info/10',
}
export function StatusChip({ status, children, className = '' }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${chipMap[status] || 'text-muted bg-surface-strong/40'} ${className}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />{children || status}
  </span>
}
export function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-surface-card text-ink ${className}`}>{children}</span>
}

/* ---------- Avatar ---------- */
const FILLS = ['#fb923c', '#ec4899', '#8b5cf6', '#34d399', '#3b82f6', '#f59e0b']
export function Avatar({ name = '?', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const fill = FILLS[name.charCodeAt(0) % FILLS.length]
  return <span className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
    style={{ width: size, height: size, background: fill, fontSize: size * 0.38 }}>{initials}</span>
}

/* ---------- Section title ---------- */
export function SectionTitle({ kicker, title, sub, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {kicker && <Badge className="mb-2">{kicker}</Badge>}
        <h2 className="display d-md text-ink">{title}</h2>
        {sub && <p className="text-[15px] text-muted mt-1.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------- CountUp ---------- */
export function CountUp({ value, suffix = '', prefix = '', duration = 1300 }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = t => { const p = Math.min((t - t0) / duration, 1); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (el) io.observe(el)
    return () => io.disconnect()
  }, [value, duration])
  return <span ref={ref}>{prefix}{n.toLocaleString('en-US')}{suffix}</span>
}

/* ---------- KPI card ---------- */
export function KPICard({ label, value, suffix, delta, index = 0, ai = false }) {
  const up = delta && !String(delta).startsWith('-')
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}>
      <Card className="p-5">
        <div className="text-[13px] text-muted">{label}</div>
        <div className={`display d-sm mt-1 ${ai ? 'ai-text' : 'text-ink'}`}><CountUp value={value} suffix={suffix} /></div>
        {delta && <div className={`mt-1 text-[12px] font-medium ${up ? 'text-success' : 'text-error'}`}>{delta} vs last period</div>}
      </Card>
    </motion.div>
  )
}

/* ---------- Reveal wrapper ---------- */
export function Reveal({ children, delay = 0, className = '' }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
    transition={{ delay, duration: 0.55 }} className={className}>{children}</motion.div>
}

/* ---------- Toggle ---------- */
export function Toggle({ on, onChange }) {
  return <button onClick={() => onChange(!on)} className={`w-10 h-6 rounded-full p-0.5 transition ${on ? 'ai-gradient' : 'bg-surface-strong'}`}>
    <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`} />
  </button>
}
