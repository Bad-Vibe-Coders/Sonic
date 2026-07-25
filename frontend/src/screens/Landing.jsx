import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Pipeline from '../components/Pipeline'
import { AreaChart, Ring } from '../components/charts'
import { Button, Card, Badge, Reveal, CountUp } from '../components/ui'
import { MarketingNav, MarketingFooter } from '../components/Marketing'
import { Aurora, Particles, Mesh } from '../components/Backdrop'
import MacWindow from '../components/MacWindow'
import Icon from '../components/Icon'

/* live audio equalizer */
function Equalizer({ bars = 7 }) {
  return (
    <div className="flex items-end gap-[3px] h-6 pb-1">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="eq-bar w-[3px] h-full rounded-full ai-gradient"
          style={{ animationDelay: `${(i % 4) * 0.15}s`, animationDuration: `${0.7 + (i % 3) * 0.25}s` }} />
      ))}
    </div>
  )
}

/* top scroll-progress bar */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const w = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return <motion.div style={{ scaleX: w }} className="fixed top-0 left-0 right-0 h-0.5 ai-gradient origin-left z-[60]" />
}

const logos = ['NorthBank', 'Helix Health', 'Vellum', 'Cloudpeak', 'Meridian', 'Aria Telecom']

const outcomes = [
  { v: 32, suf: '%', label: 'fewer escalations', sub: 'within 90 days' },
  { v: 18, suf: '%', label: 'lower churn', sub: 'on at-risk accounts' },
  { v: 96, suf: '%', label: 'compliance pass', sub: 'auto-scored' },
  { v: 9, suf: 'h', label: 'saved per QA / wk', sub: 'no manual review' },
]

const problems = [
  { icon: 'EarOff', pain: 'You hear 2% of calls', fix: 'Sonic analyzes 100% — every call scored, none sampled.' },
  { icon: 'ClipboardX', pain: 'QA is slow and subjective', fix: 'Automated, consistent scoring against your exact policy.' },
  { icon: 'TrendingDown', pain: 'You learn about churn too late', fix: 'Risk predicted mid-call, while you can still act.' },
]

const features = [
  {
    tag: 'Conversation Replay', icon: 'MessagesSquare',
    title: 'See the whole call on one timeline',
    body: 'Audio, diarized transcript, emotion graph and AI insight move together. Scrub once — everything follows.',
    points: ['Speaker-separated transcript', 'Synced emotion timeline', 'Inline entity & intent highlights'],
    to: '/app/conversations/CV-4471',
  },
  {
    tag: 'QA & Compliance', icon: 'ShieldCheck',
    title: 'Compliance that scores itself',
    body: 'Every call checked against your policy the moment it ends. Violations flagged, annotated and escalated — no spreadsheets.',
    points: ['Policy-based auto-scoring', 'Real-time violation flags', 'One-click escalation'],
    to: '/app/supervisor', reverse: true,
  },
  {
    tag: 'Prediction', icon: 'TrendingUp',
    title: 'Know the outcome before it happens',
    body: 'Churn and escalation likelihood with a live confidence indicator, so supervisors intervene on the calls that matter.',
    points: ['Live churn-risk scoring', 'Escalation likelihood', 'Revenue-at-risk rollups'],
    to: '/app/analytics',
  },
]

const steps = [
  { icon: 'PlugZap', title: 'Connect', body: 'Stream live calls or import recordings from Twilio, Genesys, Amazon Connect — minutes, not migrations.' },
  { icon: 'Sparkles', title: 'Analyze', body: 'The 10-stage AI pipeline transcribes, scores and predicts on every conversation, automatically.' },
  { icon: 'Target', title: 'Act', body: 'Role-based dashboards surface the right insight to admins, supervisors, analysts, agents and execs.' },
]

const security = [
  { icon: 'BadgeCheck', t: 'SOC 2 Type II' }, { icon: 'Lock', t: 'GDPR & HIPAA' },
  { icon: 'KeyRound', t: 'SSO / SAML & SCIM' }, { icon: 'ShieldHalf', t: 'Tenant isolation' },
  { icon: 'EyeOff', t: 'PII redaction' }, { icon: 'Database', t: 'Configurable retention' },
]

const integrations = ['Twilio', 'Genesys', 'Amazon Connect', 'Salesforce', 'Slack', 'Snowflake', 'Zendesk', 'HubSpot']

const testimonials = [
  { name: 'Md. Mohiuddin Ahmed', role: 'VP CX, NorthBank', rating: 5, quote: 'We caught a compliance gap on day three that would have cost us a six-figure fine. Sonic paid for itself instantly.' },
  { name: 'Shah Mustakin Rahman', role: 'Head of QA, Helix Health', rating: 5, quote: 'My team went from reviewing 2% of calls to monitoring all of them. Coaching is finally based on data, not gut feel.' },
  { name: 'Farhan Sadik', role: 'COO, Aria Telecom', rating: 4, seed: 'Farhan Sadik bd male 9', hair: 'spiky', quote: 'Churn prediction lets supervisors step in mid-call. Our retention on at-risk accounts jumped almost 20%.' },
  { name: 'Huzayfa Talha', role: 'Director of Ops, Cloudpeak', rating: 5, quote: 'Setup took an afternoon. By the next morning every call was scored — no spreadsheets, no manual sampling.' },
  { name: 'Md. Mostafa Nayon', role: 'CX Lead, Meridian', rating: 4, quote: 'The synced replay makes coaching obvious. Agents finally see exactly where a call turned, second by second.' },
  { name: 'Abrar Hasan Chowdhury', role: 'Compliance Head, Vellum', rating: 5, quote: 'Auto-scored compliance across 100% of calls passed our audit without a single manual review. Game changer.' },
  { name: 'Sheikh Sadi', role: 'Founder, Aria Telecom', rating: 5, quote: 'Revenue-at-risk rollups turned our QA team into a profit center. The ROI was visible inside one quarter.' },
]

const faqs = [
  ['How long does setup take?', 'Most teams are live the same day. Connect a telephony source or upload recordings, invite your team, and the pipeline starts analyzing immediately.'],
  ['Is my call data secure?', 'Yes. Every tenant is isolated on its own subdomain and data boundary, with encryption in transit and at rest, optional PII redaction, and SOC 2 Type II, GDPR and HIPAA compliance.'],
  ['Do you support my contact-center stack?', 'We integrate with Twilio, Genesys, Amazon Connect and more, plus CRM and warehouse destinations like Salesforce and Snowflake. Anything else? Use the API.'],
  ['Can I white-label it for my brand?', 'On Business and above, your subdomain loads your logo and brand color before users even sign in.'],
  ['What languages are supported?', 'The ASR and NLP stack supports 30+ languages with automatic detection per call.'],
]

export default function Landing() {
  return (
    <div className="text-body">
      <ScrollProgress />
      {/* announcement */}
      <Link to="/pipeline" className="block bg-[#0b0b0d] text-white text-center text-[13px] py-2 px-4 hover:bg-black transition">
        <span className="inline-flex items-center gap-2"><span className="rounded-full ai-gradient px-2 py-0.5 text-[11px] font-semibold">New</span> Real-time prediction is now generally available <Icon name="ArrowRight" size={13} /></span>
      </Link>

      <MarketingNav />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <Mesh />
        <Aurora variant="a" />
        <Particles count={20} />

        <div className="relative max-w-content mx-auto px-6 pt-16 lg:pt-24 pb-12 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-6">
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-3 py-1 text-[13px] font-medium text-ink bg-surface-card mb-5">
              <span className="absolute inset-0 shimmer rounded-full" />
              <span className="relative flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full ai-gradient" /> Conversation intelligence, end to end</span>
            </span>
            <h1 className="display d-xl text-ink">Turn every call into<br /><span className="ai-text">revenue, not risk.</span></h1>
            <p className="text-[18px] text-body mt-5 max-w-md">Sonic analyzes 100% of your contact-center conversations — audio to insight — so you catch compliance gaps, predict churn, and coach agents before it costs you.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Button as={Link} to="/signup" size="lg">Start free <Icon name="ArrowRight" size={16} /></Button>
              <Button as={Link} to="/pipeline" variant="secondary" size="lg"><Icon name="PlayCircle" size={17} /> Watch it work</Button>
            </div>
            <div className="flex items-center gap-4 mt-8 text-[13px] text-muted">
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-success" /> No card required</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-success" /> Live in a day</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-success" /> SOC 2 · HIPAA</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="lg:col-span-6">
            <MacWindow title="acme.sonic.ai / conversation #4471" glow>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error live-dot" />
                    <span className="text-[12px] font-semibold text-error">LIVE</span>
                    <span className="text-[13px] text-muted ml-2">Predicted churn risk</span>
                  </div>
                  <span className="text-[12px] font-medium text-error bg-error/10 rounded-full px-3 py-1 animate-pulseGlow">Escalation likely</span>
                </div>
                <div className="flex items-end gap-3 mb-2">
                  <div className="display d-sm ai-text leading-none"><CountUp value={78} suffix="%" /></div>
                  <Equalizer />
                </div>
                <AreaChart data={[40, 30, 48, 22, 38, 18, 30, 14, 26]} height={64} />
                <div className="mt-3 space-y-2 text-[13px]">
                  <p><span className="font-semibold text-ink">Agent:</span> I completely understand your frustration, let me fix that right now.</p>
                  <p><span className="font-semibold text-ink">Caller:</span> I&rsquo;ve called <mark className="bg-ai-to/15 text-ink rounded px-1">three times</mark> about this billing error.</p>
                </div>
                <div className="mt-4 rounded-lg bg-surface-card p-3 text-[13px]">
                  <div className="flex items-center gap-2 text-ink font-semibold mb-1"><span className="w-1.5 h-1.5 rounded-full ai-gradient" /> AI summary</div>
                  <p className="text-body">Repeat billing dispute. Sentiment declining. Compliance: disclosure missing. Recommend supervisor callback within 2h.</p>
                </div>
              </div>
            </MacWindow>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="border-y border-hairline-soft bg-surface-soft py-8 overflow-hidden">
        <p className="text-center text-[13px] text-muted mb-6">Trusted by contact centers handling <span className="text-ink font-semibold">40M+ calls</span> a month</p>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track animate-marquee flex w-max text-muted-soft font-semibold text-[20px] display">
            {[...logos, ...logos, ...logos, ...logos].map((l, i) => <span key={i} className="px-8 whitespace-nowrap">{l}</span>)}
          </div>
        </div>
      </section>

      {/* ===== OUTCOMES ===== */}
      <section className="relative overflow-hidden py-20">
        <Aurora variant="soft" />
        <div className="relative max-w-content mx-auto px-6">
        <Reveal className="text-center mb-12"><Badge className="mb-3">Outcomes</Badge><h2 className="display d-lg text-ink">Results customers see in the first quarter</h2></Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {outcomes.map((o, i) => (
            <Reveal key={o.label} delay={i * 0.08}>
              <Card className="p-7 text-center h-full hover:-translate-y-1 transition">
                <div className="display d-xl ai-text leading-none">{i === 0 ? '−' : ''}<CountUp value={o.v} suffix={o.suf} /></div>
                <div className="text-[15px] font-semibold text-ink mt-2">{o.label}</div>
                <div className="text-[13px] text-muted">{o.sub}</div>
              </Card>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      {/* ===== PROBLEM / SOLUTION ===== */}
      <section className="relative overflow-hidden bg-surface-soft border-y border-hairline-soft py-20">
        <Aurora variant="b" />
        <div className="relative max-w-content mx-auto px-6">
          <Reveal className="max-w-xl mb-12"><Badge className="mb-3">The problem</Badge><h2 className="display d-lg text-ink">Your calls are a black box</h2><p className="text-[16px] text-muted mt-3">Manual QA samples a fraction of conversations. The insights that protect revenue are buried in the 98% nobody hears.</p></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p, i) => (
              <Reveal key={p.pain} delay={i * 0.08}>
                <Card className="p-7 h-full">
                  <div className="w-11 h-11 rounded-lg bg-error/10 text-error flex items-center justify-center mb-4"><Icon name={p.icon} size={21} /></div>
                  <h3 className="text-[16px] font-semibold text-ink line-through decoration-error/40 decoration-2">{p.pain}</h3>
                  <p className="text-[14px] text-body mt-2 flex gap-2"><Icon name="ArrowRight" size={16} className="text-ai-to shrink-0 mt-0.5" /> {p.fix}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PIPELINE ===== */}
      <section className="relative overflow-hidden py-20">
        <Aurora variant="soft" />
        <Particles count={10} />
        <div className="relative max-w-content mx-auto px-6">
          <Reveal className="text-center mb-12"><Badge className="mb-3">How it works</Badge><h2 className="display d-lg text-ink">One pipeline, ten stages</h2><p className="text-[16px] text-muted mt-3 max-w-lg mx-auto">Watch a single call travel from raw audio to a role-based dashboard — recognizable across every screen.</p></Reveal>
          <Reveal><Card className="p-8"><Pipeline /></Card></Reveal>
        </div>
      </section>

      {/* ===== FEATURE DEEP-DIVES ===== */}
      <section className="max-w-content mx-auto px-6 pb-8 space-y-20">
        {features.map((f) => (
          <Reveal key={f.tag}>
            <div className={`grid lg:grid-cols-2 gap-10 items-center ${f.reverse ? 'lg:[direction:rtl]' : ''}`}>
              <div className="lg:[direction:ltr]">
                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ai-to"><span className="w-7 h-7 rounded-md ai-gradient text-white flex items-center justify-center"><Icon name={f.icon} size={16} /></span> {f.tag}</span>
                <h3 className="display d-md text-ink mt-4">{f.title}</h3>
                <p className="text-[16px] text-body mt-3">{f.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.points.map(p => <li key={p} className="flex items-center gap-2.5 text-[15px] text-body"><Icon name="CheckCircle2" size={18} className="text-success shrink-0" /> {p}</li>)}
                </ul>
                <Button as={Link} to={f.to} variant="secondary" className="mt-6">Explore {f.tag} <Icon name="ArrowRight" size={16} /></Button>
              </div>
              <div className="lg:[direction:ltr]"><FeatureMock kind={f.tag} /></div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ===== 3 STEPS ===== */}
      <section className="bg-surface-soft border-y border-hairline-soft py-20 mt-12">
        <div className="max-w-content mx-auto px-6">
          <Reveal className="text-center mb-12"><h2 className="display d-lg text-ink">Live in three steps</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <Card className="p-7 h-full relative">
                  <span className="absolute top-6 right-6 display d-md ai-text breathe">{i + 1}</span>
                  <div className="w-12 h-12 rounded-lg ai-gradient text-white flex items-center justify-center mb-4"><Icon name={s.icon} size={22} /></div>
                  <h3 className="text-[18px] font-semibold text-ink">{s.title}</h3>
                  <p className="text-[15px] text-body mt-2">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="relative overflow-hidden py-20">
        <Aurora variant="b" />
        <div className="relative max-w-content mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <Badge className="mb-3">Security & trust</Badge>
            <h2 className="display d-lg text-ink">Enterprise-grade from day one</h2>
            <p className="text-[16px] text-body mt-3 max-w-md">Regulated industries run on Sonic. Your data is isolated, encrypted and governed by the controls your security team expects.</p>
            <div className="flex items-center gap-3 mt-6">
              <Ring value={99} label="uptime SLA" size={88} />
              <p className="text-[14px] text-muted max-w-[200px]">Backed by a 99.99% uptime SLA and 24/7 monitoring across every tenant.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {security.map(s => (
                <Card key={s.t} className="p-5 flex items-center gap-3 hover:-translate-y-1 transition">
                  <span className="w-10 h-10 rounded-lg bg-surface-card text-ink flex items-center justify-center shrink-0"><Icon name={s.icon} size={19} /></span>
                  <span className="text-[14px] font-semibold text-ink">{s.t}</span>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="relative overflow-hidden bg-surface-soft border-y border-hairline-soft py-20">
        <Aurora variant="soft" />
        <div className="relative max-w-content mx-auto px-6 text-center">
          <Reveal><Badge className="mb-3">Integrations</Badge><h2 className="display d-lg text-ink">Plugs into your stack</h2><p className="text-[16px] text-muted mt-3 mb-10">Telephony in, insights out — with an API for everything else.</p></Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map((n, i) => (
              <Reveal key={n} delay={i * 0.04}>
                <Card className="p-5 flex items-center justify-center gap-2.5 hover:-translate-y-1 transition">
                  <span className="w-8 h-8 rounded-md ai-gradient text-white flex items-center justify-center text-[12px] font-bold">{n[0]}</span>
                  <span className="text-[14px] font-semibold text-ink">{n}</span>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative overflow-hidden py-20">
        <Aurora variant="soft" />
        <div className="relative max-w-content mx-auto px-6">
        <Reveal className="text-center mb-12"><Badge className="mb-3">Loved by CX leaders</Badge><h2 className="display d-lg text-ink">Don&rsquo;t take our word for it</h2><p className="text-[15px] text-muted mt-2">Hover to pause and read.</p></Reveal>
        <TestimonialWall />
        </div>
      </section>

      {/* ===== PRICING TEASER ===== */}
      <section className="max-w-content mx-auto px-6 pb-20">
        <Reveal>
          <div className="rounded-xl bg-[#0b0b0d] text-white p-10 lg:p-14 grid lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
            <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full ai-gradient opacity-20 blur-3xl animate-float-slow" />
            <Particles count={14} />
            <div className="lg:col-span-7 relative">
              <h2 className="display d-lg">Pricing that scales with your floor</h2>
              <p className="text-[16px] text-white/60 mt-3">Start free on up to 500 calls a month. Upgrade when your volume does — no surprises.</p>
            </div>
            <div className="lg:col-span-5 relative flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button as={Link} to="/pricing" size="lg" className="!bg-white !text-[#0b0b0d]">See all plans <Icon name="ArrowRight" size={16} /></Button>
              <Button as={Link} to="/signup" variant="ai" size="lg">Start free</Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <Reveal className="text-center mb-10"><Badge className="mb-3">FAQ</Badge><h2 className="display d-lg text-ink">Answers to your questions</h2></Reveal>
        <FAQ items={faqs} />
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-content mx-auto px-6 pb-24">
        <Reveal>
          <Card soft className="p-14 text-center relative overflow-hidden">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 ai-gradient opacity-15 blur-3xl" />
            <h2 className="display d-md text-ink relative">Hear what your calls are really saying.</h2>
            <p className="text-[16px] text-muted mt-3 mb-7 relative">Set up your subdomain in under 5 minutes. No card required.</p>
            <div className="flex justify-center gap-3 relative"><Button as={Link} to="/signup" size="lg">Start free</Button><Button as={Link} to="/enterprise" variant="secondary" size="lg">Talk to sales</Button></div>
          </Card>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  )
}

/* ---- inline feature mockups (different per feature) ---- */
function FeatureMock({ kind }) {
  if (kind === 'QA & Compliance') {
    const checks = [['Verified caller identity', 'pass'], ['Empathy acknowledgement', 'pass'], ['Read required disclosure', 'fail'], ['Offered resolution timeline', 'pass']]
    return (
      <MacWindow title="compliance · CV-4471">
        <div className="p-6">
        <div className="flex items-center justify-between mb-4"><span className="text-[14px] font-semibold text-ink flex items-center gap-2"><Icon name="ShieldCheck" size={16} /> Compliance scorecard</span><span className="display d-sm text-warning">80%</span></div>
        <div className="space-y-2.5">
          {checks.map(([c, s], i) => (
            <motion.div key={c} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2.5 text-[14px] text-body">
              <Icon name={s === 'pass' ? 'CheckCircle2' : 'XCircle'} size={18} className={s === 'pass' ? 'text-success' : 'text-error'} /> {c}
              {s === 'fail' && <span className="ml-auto text-[11px] font-medium text-error bg-error/10 rounded-full px-2 py-0.5">Flagged</span>}
            </motion.div>
          ))}
        </div>
        </div>
      </MacWindow>
    )
  }
  if (kind === 'Prediction') {
    return (
      <MacWindow title="prediction · CV-4471">
        <div className="p-6">
        <div className="text-[14px] font-semibold text-ink mb-5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full ai-gradient" /> Prediction</div>
        <div className="flex items-center justify-around"><Ring value={78} label="churn risk" /><Ring value={64} label="escalation" /></div>
        <div className="mt-5 rounded-lg bg-error/10 text-error text-[13px] p-3 flex gap-2"><Icon name="AlertTriangle" size={16} className="shrink-0 mt-0.5" /> Recommend supervisor callback within 2h.</div>
        </div>
      </MacWindow>
    )
  }
  // Conversation Replay
  return (
    <MacWindow title="replay · CV-4471"><div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full ai-gradient text-white flex items-center justify-center"><Icon name="Play" size={18} /></span>
        <div className="flex-1"><div className="h-2 rounded-full bg-surface-strong overflow-hidden"><div className="h-full ai-gradient w-[42%]" /></div></div>
        <span className="text-[12px] font-mono text-muted">0:27 / 1:04</span>
      </div>
      <AreaChart data={[60, 52, 40, 30, 22, 34, 30, 48, 56]} height={56} />
      <div className="mt-4 space-y-2 text-[13px]">
        <p><span className="font-semibold text-info">Agent:</span> Let me reverse that duplicate <mark className="bg-info/15 text-info rounded px-1">$84.50</mark> charge now.</p>
        <p><span className="font-semibold text-warning">Caller:</span> I&rsquo;m about to <mark className="bg-error/15 text-error rounded px-1">cancel</mark> over this.</p>
      </div>
    </div></MacWindow>
  )
}

/* ---- testimonial card (matches landing card language: white surface, hairline, ai accents) ---- */
function TCard({ t }) {
  return (
    <div className="group/card relative rounded-lg p-px bg-gradient-to-br from-ai-from/30 to-ai-to/30 group-hover/card:from-ai-from group-hover/card:to-ai-to shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
    <div className="relative rounded-[11px] bg-surface p-6 flex flex-col overflow-hidden h-full">
      {/* soft ai wash, always on; intensifies on hover */}
      <span className="absolute inset-0 bg-gradient-to-br from-ai-from/[0.07] via-transparent to-ai-to/[0.10] opacity-80 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
      <span className="absolute -top-16 -right-16 w-40 h-40 rounded-full ai-gradient opacity-10 blur-2xl pointer-events-none" />
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, k) => (
            <Icon key={k} name="Star" size={14} className={k < t.rating ? 'text-[#fb923c] fill-[#fb923c]' : 'text-surface-strong'} />
          ))}
        </div>
        <Icon name="Quote" size={20} className="text-surface-strong group-hover/card:text-ai-to transition-colors" />
      </div>
      <p className="relative text-[14px] text-ink flex-1 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
      <div className="relative flex items-center gap-3 mt-5 pt-4 border-t border-hairline">
        <span className="rounded-full p-0.5 ai-gradient shrink-0">
          <img src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${encodeURIComponent(t.seed || t.name)}&radius=50&skinColor=f2d3b1,ffdbb4&hair=${t.hair || 'spiky,undercut'}&hairProbability=100&rearHairProbability=0&eyes=humble,wide,wink&beard=chin,fullBeard,longBeard,moustacheTwirl&beardProbability=100&backgroundColor=22d3ee,6366f1,8b5cf6,3b82f6,06b6d4`}
            alt={t.name} loading="lazy" className="block w-9 h-9 rounded-full" />
        </span>
        <span><span className="block text-[13px] font-semibold text-ink">{t.name}</span><span className="block text-[11px] text-muted">{t.role}</span></span>
      </div>
    </div>
    </div>
  )
}

/* ---- vertical infinite testimonial wall (3 columns, different speeds) ---- */
function TestimonialWall() {
  const cols = [
    { items: [0, 3, 6].map(i => testimonials[i]), dur: 26, reverse: false },
    { items: [1, 4].map(i => testimonials[i]), dur: 32, reverse: true },
    { items: [2, 5].map(i => testimonials[i]), dur: 22, reverse: false },
  ]
  return (
    <div className="vwall relative h-[300px] sm:h-[440px] overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_14%,#000_86%,transparent)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 h-full">
        {cols.map((col, ci) => (
          <div key={ci} className={ci === 1 ? 'hidden sm:block' : ci === 2 ? 'hidden lg:block' : ''}>
            <div className="vcol" style={{ animationDuration: `${col.dur}s`, animationDirection: col.reverse ? 'reverse' : 'normal' }}>
              {/* items×4 = base×2; uniform mb on every card so translateY(-50%) loops seamlessly */}
              {[...col.items, ...col.items, ...col.items, ...col.items].map((t, i) => <div key={i} className="mb-5"><TCard t={t} /></div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- FAQ accordion ---- */
function FAQ({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => (
        <Card key={q} className="overflow-hidden">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
            <span className="text-[15px] font-semibold text-ink">{q}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="shrink-0 text-muted"><Icon name="Plus" size={18} /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                <p className="px-5 pb-5 text-[14px] text-body leading-relaxed">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  )
}
