// Mock data grounded in the repo's AI pipeline + persona model.

export const PIPELINE = [
  { id: 'audio', label: 'Audio', icon: 'Mic', desc: 'Live & recorded ingest' },
  { id: 'asr', label: 'ASR', icon: 'FileText', desc: 'Speech-to-text' },
  { id: 'diar', label: 'Diarization', icon: 'Users', desc: 'Speaker separation' },
  { id: 'emotion', label: 'Emotion', icon: 'Smile', desc: 'Affect detection' },
  { id: 'nlp', label: 'NLP', icon: 'Languages', desc: 'Entities & intent' },
  { id: 'llm', label: 'LLM', icon: 'Sparkles', desc: 'Summarize & reason', ai: true },
  { id: 'qa', label: 'QA', icon: 'ShieldCheck', desc: 'Compliance scoring' },
  { id: 'predict', label: 'Prediction', icon: 'TrendingUp', desc: 'Risk & outcomes', ai: true },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', desc: 'Aggregate trends' },
  { id: 'dash', label: 'Dashboards', icon: 'LayoutDashboard', desc: 'Role-based views' },
]

const agents = ['Maya Chen', 'Liam Ortiz', 'Priya Nair', 'Tom Becker', 'Sara Ali', 'Noah Kim', 'Eva Roy', 'Dan Park']
const topics = ['Billing dispute', 'Plan upgrade', 'Cancellation', 'Tech support', 'Refund request', 'Account access', 'Complaint', 'Renewal']

function rng(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff }

export const CONVERSATIONS = (() => {
  const r = rng(42)
  return Array.from({ length: 28 }, (_, i) => {
    const sentiment = Math.round(r() * 100)
    const risk = Math.round(r() * 100)
    const flagged = r() > 0.62
    const dur = 120 + Math.round(r() * 600)
    return {
      id: `CV-${4400 + i}`,
      agent: agents[Math.floor(r() * agents.length)],
      topic: topics[Math.floor(r() * topics.length)],
      date: `Jun ${1 + Math.floor(r() * 26)}, 2026`,
      duration: `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`,
      sentiment,
      risk,
      flagged,
      compliance: flagged ? 'fail' : r() > 0.3 ? 'pass' : 'review',
      status: r() > 0.5 ? 'analyzed' : 'reviewing',
    }
  })
})()

// Centerpiece conversation transcript (synced to a 64s timeline)
export const REPLAY = {
  id: 'CV-4471',
  agent: 'Maya Chen',
  caller: 'Robert Hale',
  topic: 'Repeat billing dispute',
  duration: 64,
  churnRisk: 78,
  escalation: 64,
  summary:
    'Repeat billing dispute — customer charged twice for the June invoice across three prior calls. Sentiment declines sharply mid-call. Required fee-disclosure statement was not read. Recommend supervisor callback within 2 hours and a goodwill credit.',
  emotion: [
    { t: 0, v: 62 }, { t: 8, v: 55 }, { t: 16, v: 40 }, { t: 24, v: 30 },
    { t: 32, v: 22 }, { t: 40, v: 35 }, { t: 48, v: 30 }, { t: 56, v: 48 }, { t: 64, v: 58 },
  ],
  transcript: [
    { t: 0, who: 'agent', text: 'Thanks for calling NorthBank support, this is Maya. How can I help today?' },
    { t: 6, who: 'caller', text: "I've been charged twice for my June invoice. This is the third time I'm calling.", tags: [{ word: 'third time', kind: 'intent' }] },
    { t: 16, who: 'agent', text: 'I completely understand your frustration. Let me pull up your account right now.' },
    { t: 24, who: 'caller', text: 'I am honestly about to cancel. Nobody has fixed this.', tags: [{ word: 'cancel', kind: 'risk' }] },
    { t: 32, who: 'agent', text: 'I see two charges of $84.50 on June 3rd. I can reverse the duplicate immediately.', tags: [{ word: '$84.50', kind: 'entity' }, { word: 'June 3rd', kind: 'entity' }] },
    { t: 42, who: 'caller', text: 'Okay. How long until I see the refund?' },
    { t: 48, who: 'agent', text: 'It posts in 3 to 5 business days. I am also adding a goodwill credit for the trouble.', tags: [{ word: 'goodwill credit', kind: 'intent' }] },
    { t: 56, who: 'caller', text: 'Alright, thank you. That helps.' },
  ],
  checklist: [
    { item: 'Verified caller identity', status: 'pass' },
    { item: 'Empathy acknowledgement', status: 'pass' },
    { item: 'Read required fee disclosure', status: 'fail' },
    { item: 'Offered resolution timeline', status: 'pass' },
    { item: 'Logged dispute reference', status: 'review' },
  ],
}

export const KPIS = {
  admin: [
    { label: 'Active seats', value: 142, suffix: '', delta: '+8' },
    { label: 'Calls this month', value: 41283, suffix: '', delta: '+12%' },
    { label: 'Compliance pass', value: 96, suffix: '%', delta: '+2pt' },
    { label: 'Open flags', value: 23, suffix: '', delta: '-5' },
  ],
  supervisor: [
    { label: 'Team avg sentiment', value: 82, suffix: '', delta: '+4' },
    { label: 'Flagged calls', value: 17, suffix: '', delta: '+3' },
    { label: 'Avg handle time', value: 6, suffix: 'm', delta: '-0.4m' },
    { label: 'QA reviewed', value: 88, suffix: '%', delta: '+6pt' },
  ],
  exec: [
    { label: 'Total conversations', value: 318402, suffix: '', delta: '+9%' },
    { label: 'Predicted churn', value: 4, suffix: '%', delta: '-1.2pt' },
    { label: 'CSAT', value: 91, suffix: '', delta: '+3' },
    { label: 'Revenue at risk', value: 248, suffix: 'K', delta: '-18K' },
  ],
}

export const TENANTS_ADMIN = [
  { name: 'Helix Health', sub: 'helix', sector: 'Healthcare', seats: 142, calls: '41.2k', status: 'active', plan: 'Business', usage: 78 },
  { name: 'NorthBank', sub: 'northbank', sector: 'Financial', seats: 310, calls: '128k', status: 'active', plan: 'Enterprise', usage: 64 },
  { name: 'Aria Telecom', sub: 'aria', sector: 'Telecom', seats: 88, calls: '22k', status: 'provisioning', plan: 'Team', usage: 12 },
  { name: 'Cloudpeak', sub: 'cloudpeak', sector: 'SaaS', seats: 24, calls: '4.1k', status: 'active', plan: 'Starter', usage: 41 },
  { name: 'Meridian', sub: 'meridian', sector: 'Insurance', seats: 0, calls: '0', status: 'suspended', plan: 'Team', usage: 0 },
]

export const HEALTH = PIPELINE.map((s, i) => ({
  ...s,
  state: i === 6 ? 'degraded' : i === 8 ? 'idle' : 'healthy',
  latency: 20 + Math.round(Math.abs(Math.sin(i)) * 180),
  throughput: 200 + Math.round(Math.abs(Math.cos(i)) * 800),
}))

export const NOTIFICATIONS = [
  { kind: 'error', title: 'Compliance violation', body: 'Fee disclosure missing on CV-4471 (Maya Chen)', time: '2m ago' },
  { kind: 'warning', title: 'Churn risk spike', body: '6 conversations crossed 75% churn risk in the last hour', time: '18m ago' },
  { kind: 'info', title: 'Pipeline degraded', body: 'QA stage latency above threshold (210ms)', time: '41m ago' },
  { kind: 'success', title: 'Onboarding complete', body: 'Aria Telecom finished workspace setup', time: '2h ago' },
]
