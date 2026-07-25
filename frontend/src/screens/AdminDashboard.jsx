import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KPICard, Card, SectionTitle, Button, Reveal } from '../components/ui'
import { BarChart } from '../components/charts'
import { PIPELINE } from '../lib/data'
import { analyticsOverview, analyticsVolume, pipelineHealth, listNotifications } from '../lib/api'
import Icon from '../components/Icon'

const STAGE_KEY = { audio: 'audio', asr: 'asr', diar: 'diarization', emotion: 'emotion', nlp: 'nlp', llm: 'llm', qa: 'qa', predict: 'prediction', analytics: 'analytics', dash: 'indexing' }

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [health, setHealth] = useState(null)
  const [volume, setVolume] = useState(null)
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    analyticsOverview().then(setOverview).catch(() => setOverview(false))
    analyticsVolume(14).then(setVolume).catch(() => setVolume(false))
    listNotifications().then(setNotifications).catch(() => setNotifications(false))
    pipelineHealth().then(data => setHealth(PIPELINE.map(s => ({
      ...s,
      state: data.stages[STAGE_KEY[s.id]]?.enabled ? 'healthy' : 'idle',
    })))).catch(() => setHealth(false))
  }, [])

  const ICON = { error: 'AlertOctagon', warning: 'AlertTriangle', success: 'CheckCircle2', info: 'Info' }
  const COLOR = { error: 'text-error', warning: 'text-warning', success: 'text-success', info: 'text-info' }

  const kpis = overview ? [
    { label: 'Total conversations', value: overview.total_conversations, suffix: '', delta: '' },
    { label: 'Completed', value: overview.completed_conversations, suffix: '', delta: '' },
    { label: 'Failed', value: overview.failed_conversations, suffix: '', delta: '' },
    { label: 'Avg QA score', value: overview.avg_qa_score != null ? Math.round(overview.avg_qa_score * 100) : 0, suffix: '%', delta: '' },
  ] : null

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display d-lg text-ink">Good morning, Operator</h1>
          <p className="text-muted mt-1">Here&rsquo;s how your organization is performing today.</p>
        </div>
        <Button as={Link} to="/app/settings" variant="secondary"><Icon name="Settings" size={16} /> Org settings</Button>
      </div>

      {overview === false ? (
        <Card className="p-6 text-center text-muted"><Icon name="AlertCircle" size={20} className="mx-auto mb-2" />Analytics not available.</Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis ? kpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 2} />)
            : Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse" />)}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <Card className="p-6 h-full">
            <SectionTitle title="Call volume" sub="Last 14 days" action={<Button variant="ghost" size="sm" disabled>Export <Icon name="Download" size={14} /></Button>} />
            <BarChart data={(volume || []).map(v => v.count)} height={180}
              labels={(volume || []).map((v, i) => i % 3 === 0 ? v.date.slice(5) : '')} />
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="p-6 h-full">
            <SectionTitle title="Recent alerts" action={<Link to="/app/notifications" className="text-[13px] text-muted hover:text-ink">All</Link>} />
            {notifications === false ? (
              <p className="text-[13px] text-muted py-6 text-center">Alerts not available.</p>
            ) : notifications === null ? (
              <p className="text-[13px] text-muted py-6 text-center">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-[13px] text-muted py-6 text-center">No alerts yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map(n => (
                  <div key={n.id} className="flex gap-3">
                    <span className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center bg-surface-card ${COLOR[n.kind]}`}>
                      <Icon name={ICON[n.kind]} size={15} />
                    </span>
                    <div><div className="text-[13px] font-medium text-ink">{n.title}</div><div className="text-[12px] text-muted">{n.body}</div></div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="p-6">
          <SectionTitle title="Pipeline status" sub="Live health across the 10 AI stages" action={<Button as={Link} to="/app/health" variant="ghost" size="sm">Open monitor <Icon name="ArrowRight" size={14} /></Button>} />
          {health === false ? (
            <p className="text-[13px] text-muted text-center py-4">Pipeline health not available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(health || PIPELINE).map(s => (
                <div key={s.id} className="rounded-lg border border-hairline p-3">
                  <div className="flex items-center justify-between mb-2"><Icon name={s.icon} size={16} className="text-ink" /><span className={`w-2 h-2 rounded-full ${s.state === 'healthy' ? 'bg-success' : s.state === 'degraded' ? 'bg-warning' : 'bg-muted'}`} /></div>
                  <div className="text-[12px] font-semibold text-ink">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4">
        {[['Manage team & roles', 'Users', '/app/settings'], ['Branding & white-label', 'Palette', '/app/settings'], ['Billing & plan', 'CreditCard', '/app/billing']].map(([t, ic, to]) => (
          <Link key={t} to={to}><Card soft className="p-5 flex items-center gap-3 hover:shadow-card transition"><span className="w-9 h-9 rounded-md bg-surface flex items-center justify-center text-ink border border-hairline"><Icon name={ic} size={18} /></span><span className="text-[14px] font-semibold text-ink">{t}</span><Icon name="ChevronRight" size={16} className="ml-auto text-muted" /></Card></Link>
        ))}
      </div>
    </div>
  )
}
