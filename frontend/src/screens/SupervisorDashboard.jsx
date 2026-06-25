import { Link } from 'react-router-dom'
import { KPICard, Card, SectionTitle, Button, StatusChip, Avatar, Reveal } from '../components/ui'
import { AreaChart } from '../components/charts'
import { KPIS, CONVERSATIONS } from '../lib/data'
import Icon from '../components/Icon'

const team = [
  { name: 'Maya Chen', sentiment: 88, calls: 42, flags: 1 },
  { name: 'Liam Ortiz', sentiment: 74, calls: 38, flags: 3 },
  { name: 'Priya Nair', sentiment: 91, calls: 51, flags: 0 },
  { name: 'Tom Becker', sentiment: 63, calls: 29, flags: 5 },
  { name: 'Sara Ali', sentiment: 85, calls: 47, flags: 1 },
]

export default function SupervisorDashboard() {
  const flagged = CONVERSATIONS.filter(c => c.flagged).slice(0, 6)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="display d-lg text-ink">Team overview</h1>
        <p className="text-muted mt-1">Compliance, sentiment and the review queue across your agents.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.supervisor.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 0} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <Card className="p-6 h-full">
            <SectionTitle title="Flagged-call queue" sub="Needs review" action={<Button as={Link} to="/app/conversations" variant="ghost" size="sm">View all</Button>} />
            <div className="divide-y divide-hairline">
              {flagged.map(c => (
                <Link key={c.id} to={`/app/conversations/${c.id}`} className="flex items-center gap-4 py-3 hover:bg-surface-soft -mx-2 px-2 rounded-md transition">
                  <Avatar name={c.agent} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-ink truncate">{c.topic}</div>
                    <div className="text-[12px] text-muted">{c.agent} · {c.id} · {c.duration}</div>
                  </div>
                  <span className="text-[12px] text-muted hidden sm:block">Risk {c.risk}%</span>
                  <StatusChip status="fail">Compliance</StatusChip>
                  <Icon name="ChevronRight" size={16} className="text-muted" />
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="p-6 h-full">
            <SectionTitle title="Sentiment trend" sub="Team, 7 days" />
            <AreaChart data={[70, 66, 72, 64, 78, 74, 82]} height={120} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-surface-card p-3"><div className="display d-sm text-success">+12%</div><div className="text-[12px] text-muted">vs last week</div></div>
              <div className="rounded-lg bg-surface-card p-3"><div className="display d-sm text-ink">4.6</div><div className="text-[12px] text-muted">avg CSAT</div></div>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="p-6">
          <SectionTitle title="Agent performance" sub="This week" />
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead><tr className="text-left text-muted text-[12px] uppercase"><th className="font-medium py-2">Agent</th><th className="font-medium">Sentiment</th><th className="font-medium">Calls</th><th className="font-medium">Flags</th><th></th></tr></thead>
              <tbody className="divide-y divide-hairline">
                {team.map(a => (
                  <tr key={a.name} className="hover:bg-surface-soft">
                    <td className="py-3"><span className="flex items-center gap-2.5"><Avatar name={a.name} size={30} /><span className="font-medium text-ink">{a.name}</span></span></td>
                    <td><span className="flex items-center gap-2"><span className="w-24 h-1.5 rounded-full bg-surface-strong overflow-hidden"><span className="block h-full ai-gradient" style={{ width: `${a.sentiment}%` }} /></span>{a.sentiment}</span></td>
                    <td className="text-body">{a.calls}</td>
                    <td>{a.flags > 0 ? <StatusChip status={a.flags > 3 ? 'fail' : 'review'}>{a.flags}</StatusChip> : <StatusChip status="pass">0</StatusChip>}</td>
                    <td className="text-right"><Button variant="ghost" size="sm">Coach</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}
