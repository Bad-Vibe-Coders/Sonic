import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KPICard, Card, SectionTitle, Button, StatusChip, Avatar, Reveal } from '../components/ui'
import { AreaChart } from '../components/charts'
import { analyticsOverview, analyticsAgents, listConversations } from '../lib/api'
import Icon from '../components/Icon'

export default function SupervisorDashboard() {
  const [overview, setOverview] = useState(null)
  const [flagged, setFlagged] = useState(null)
  const [agents, setAgents] = useState(null)

  useEffect(() => {
    analyticsOverview().then(setOverview).catch(() => setOverview({}))
    listConversations({ limit: 200 })
      .then(data => setFlagged(data.filter(c => c.status === 'failed').slice(0, 6)))
      .catch(() => setFlagged([]))
    analyticsAgents().then(setAgents).catch(() => setAgents([]))
  }, [])

  const kpis = [
    { label: 'Total conversations', value: overview?.total_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Completed', value: overview?.completed_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Failed', value: overview?.failed_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Avg QA score', value: overview?.avg_qa_score != null ? Math.round(overview.avg_qa_score * 100) : 0, suffix: '%', delta: '' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display d-lg text-ink">Team overview</h1>
        <p className="text-muted mt-1">Compliance, sentiment and the review queue across your agents.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overview ? kpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 0} />)
          : Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse" />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <Card className="p-6 h-full">
            <SectionTitle title="Flagged-call queue" sub="Needs review" action={<Button as={Link} to="/app/conversations" variant="ghost" size="sm">View all</Button>} />
            {flagged === null ? (
              <p className="text-[13px] text-muted py-6 text-center">Loading…</p>
            ) : flagged.length === 0 ? (
              <p className="text-[13px] text-muted py-6 text-center">No flagged conversations right now.</p>
            ) : (
              <div className="divide-y divide-hairline">
                {flagged.map(c => (
                  <Link key={c.id} to={`/app/conversations/${c.id}`} className="flex items-center gap-4 py-3 hover:bg-surface-soft -mx-2 px-2 rounded-md transition">
                    <Avatar name={c.title} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-ink truncate">{c.title}</div>
                      <div className="text-[12px] text-muted">{c.id}</div>
                    </div>
                    <StatusChip status="fail">Compliance</StatusChip>
                    <Icon name="ChevronRight" size={16} className="text-muted" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="p-6 h-full">
            <SectionTitle title="Sentiment trend" sub="Not tracked yet" />
            <AreaChart data={[]} height={120} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-surface-card p-3"><div className="display d-sm text-muted">—</div><div className="text-[12px] text-muted">vs last week</div></div>
              <div className="rounded-lg bg-surface-card p-3"><div className="display d-sm text-muted">—</div><div className="text-[12px] text-muted">avg CSAT</div></div>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="p-6">
          <SectionTitle title="Agent performance" sub="By uploading agent" />
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead><tr className="text-left text-muted text-[12px] uppercase"><th className="font-medium py-2">Agent</th><th className="font-medium">Avg QA score</th><th className="font-medium">Calls</th><th className="font-medium">Flags</th></tr></thead>
              <tbody className="divide-y divide-hairline">
                {agents === null ? (
                  <tr><td colSpan={4} className="py-6 text-center text-muted">Loading…</td></tr>
                ) : agents.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-muted">No agent-level data available yet.</td></tr>
                ) : agents.map(a => (
                  <tr key={a.user_id} className="hover:bg-surface-soft">
                    <td className="py-3"><span className="flex items-center gap-2.5"><Avatar name={a.email} size={30} /><span className="font-medium text-ink">{a.email}</span></span></td>
                    <td>{a.avg_qa_score != null ? <span className="flex items-center gap-2"><span className="w-24 h-1.5 rounded-full bg-surface-strong overflow-hidden"><span className="block h-full ai-gradient" style={{ width: `${Math.round(a.avg_qa_score * 100)}%` }} /></span>{Math.round(a.avg_qa_score * 100)}%</span> : <span className="text-muted">—</span>}</td>
                    <td className="text-body">{a.calls}</td>
                    <td>{a.flags > 0 ? <StatusChip status={a.flags > 3 ? 'fail' : 'review'}>{a.flags}</StatusChip> : <StatusChip status="pass">0</StatusChip>}</td>
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
