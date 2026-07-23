import { useEffect, useState } from 'react'
import { KPICard, Card, SectionTitle, Button, Reveal, StatusChip } from '../components/ui'
import { AreaChart, BarChart, Ring } from '../components/charts'
import { analyticsOverview, analyticsVolume, analyticsCompliance, analyticsRisks } from '../lib/api'
import Icon from '../components/Icon'

export default function ExecAnalytics() {
  const [overview, setOverview] = useState(null)
  const [volume, setVolume] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const [risks, setRisks] = useState(null)

  useEffect(() => {
    analyticsOverview().then(setOverview).catch(() => setOverview({}))
    analyticsVolume(30).then(setVolume).catch(() => setVolume([]))
    analyticsCompliance().then(setCompliance).catch(() => setCompliance([]))
    analyticsRisks().then(setRisks).catch(() => setRisks([]))
  }, [])

  const kpis = [
    { label: 'Total conversations', value: overview?.total_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Completed', value: overview?.completed_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Failed', value: overview?.failed_conversations ?? 0, suffix: '', delta: '' },
    { label: 'Avg QA score', value: overview?.avg_qa_score != null ? Math.round(overview.avg_qa_score * 100) : 0, suffix: '%', delta: '' },
  ]

  const churnAvg = overview?.total_conversations
    ? Math.round((overview.failed_conversations / overview.total_conversations) * 100)
    : 0

  const outcomeData = overview ? [
    overview.completed_conversations ?? 0,
    overview.failed_conversations ?? 0,
    Math.max(0, (overview.total_conversations ?? 0) - (overview.completed_conversations ?? 0) - (overview.failed_conversations ?? 0)),
  ] : []

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">Executive analytics</h1><p className="text-muted mt-1">Cross-team KPIs and predictive insight.</p></div>
        <Button variant="secondary"><Icon name="Download" size={16} /> Report</Button>
      </div>

      {overview === null ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{kpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 3} />)}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6 h-full">
          <SectionTitle title="Conversation volume" sub="Last 30 days" />
          <AreaChart data={(volume || []).map(v => v.count)} height={200} />
          <div className="grid gap-1 mt-2 text-[10px] text-muted" style={{ gridTemplateColumns: `repeat(${(volume || []).length || 1}, minmax(0,1fr))` }}>
            {(volume || []).map((v, i) => <span key={i} className="text-center">{i % 5 === 0 ? v.date.slice(5) : ''}</span>)}
          </div>
        </Card></Reveal>

        <Reveal delay={0.1}><Card className="p-6 h-full flex flex-col items-center justify-center text-center">
          <SectionTitle title="Failure rate" sub="Share of conversations that failed processing" />
          <Ring value={churnAvg} label="failed" />
          <p className="text-[13px] text-muted mt-4">{overview?.failed_conversations ?? 0} of {overview?.total_conversations ?? 0} conversations failed.</p>
        </Card></Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Reveal><Card className="p-6"><SectionTitle title="Conversations by outcome" /><BarChart data={outcomeData} height={140} labels={['Completed', 'Failed', 'In progress']} /></Card></Reveal>
        <Reveal delay={0.08}><Card className="p-6"><SectionTitle title="Compliance by rule" sub="Pass rate across scored calls" />
          <div className="space-y-3 mt-2">
            {compliance === null ? (
              <p className="text-[13px] text-muted py-4 text-center">Loading…</p>
            ) : compliance.length === 0 ? (
              <p className="text-[13px] text-muted py-4 text-center">No QA-scored calls yet.</p>
            ) : compliance.map(c => (
              <div key={c.rule}><div className="flex justify-between text-[13px] mb-1"><span className="text-body">{c.rule}</span><span className="text-ink font-medium">{c.pass_rate}%</span></div><div className="h-1.5 rounded-full bg-surface-strong overflow-hidden"><div className="h-full ai-gradient" style={{ width: `${c.pass_rate}%` }} /></div></div>
            ))}
          </div>
        </Card></Reveal>
        <Reveal delay={0.16}><Card className="p-6"><SectionTitle title="Top predicted risks" />
          <div className="space-y-3 mt-1">
            {risks === null ? (
              <p className="text-[13px] text-muted py-4 text-center">Loading…</p>
            ) : risks.length === 0 ? (
              <p className="text-[13px] text-muted py-4 text-center">No risk signals detected yet.</p>
            ) : risks.map(r => (
              <div key={r.label} className="flex items-center justify-between"><span className="text-[14px] text-ink">{r.label}</span><StatusChip status={r.level === 'High' ? 'fail' : 'review'}>{r.level}</StatusChip></div>
            ))}
          </div>
        </Card></Reveal>
      </div>
    </div>
  )
}
