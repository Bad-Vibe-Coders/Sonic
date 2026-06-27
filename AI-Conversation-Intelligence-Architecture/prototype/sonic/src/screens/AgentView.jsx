import { Link } from 'react-router-dom'
import { Card, SectionTitle, KPICard, StatusChip, Reveal, Button } from '../components/ui'
import { AreaChart, Ring } from '../components/charts'
import { CONVERSATIONS } from '../lib/data'
import Icon from '../components/Icon'

const myKpis = [
  { label: 'My calls', value: 47, suffix: '', delta: '+5' },
  { label: 'My sentiment', value: 85, suffix: '', delta: '+6' },
  { label: 'Compliance', value: 98, suffix: '%', delta: '+1pt' },
  { label: 'Coaching tips', value: 3, suffix: '', delta: '+2' },
]
const coaching = [
  { tip: 'Read the fee-disclosure statement earlier in billing calls.', kind: 'fail' },
  { tip: 'Great empathy — your acknowledgement rate is top 10%.', kind: 'pass' },
  { tip: 'Try summarizing next steps before closing.', kind: 'review' },
]

export default function AgentView() {
  const mine = CONVERSATIONS.filter(c => c.agent === 'Maya Chen').slice(0, 6)
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">My performance</h1><p className="text-muted mt-1">Your calls, trend and coaching feedback.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{myKpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 1} />)}</div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="My sentiment trend" sub="Last 14 days" /><AreaChart data={[68, 72, 70, 75, 73, 80, 78, 82, 79, 85]} height={180} /></Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6 flex flex-col items-center text-center"><SectionTitle title="Quality score" /><Ring value={92} label="this week" /><p className="text-[13px] text-muted mt-4">You're <span className="text-success font-semibold">+6 pts</span> above team average.</p></Card></Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="My recent calls" action={<Link to="/app/conversations" className="text-[13px] text-muted hover:text-ink">All</Link>} />
          <div className="divide-y divide-hairline">
            {mine.map(c => (
              <Link key={c.id} to={`/app/conversations/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-soft -mx-2 px-2 rounded-md">
                <span className="w-8 h-8 rounded-md bg-surface-card flex items-center justify-center text-ink"><Icon name="Phone" size={15} /></span>
                <div className="flex-1 min-w-0"><div className="text-[14px] font-medium text-ink">{c.topic}</div><div className="text-[12px] text-muted">{c.date} · {c.duration}</div></div>
                <StatusChip status={c.compliance} />
              </Link>
            ))}
          </div>
        </Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="Coaching feedback" />
          <div className="space-y-3">
            {coaching.map((c, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-soft">
                <Icon name={c.kind === 'pass' ? 'CheckCircle2' : c.kind === 'fail' ? 'AlertCircle' : 'Lightbulb'} size={18}
                  className={`shrink-0 mt-0.5 ${c.kind === 'pass' ? 'text-success' : c.kind === 'fail' ? 'text-error' : 'text-warning'}`} />
                <span className="text-[13px] text-body">{c.tip}</span>
              </div>
            ))}
          </div>
        </Card></Reveal>
      </div>
    </div>
  )
}
