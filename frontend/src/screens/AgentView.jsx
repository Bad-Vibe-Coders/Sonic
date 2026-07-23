import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, SectionTitle, KPICard, StatusChip, Reveal } from '../components/ui'
import { Ring } from '../components/charts'
import { listConversations, analyticsAgents, me } from '../lib/api'
import Icon from '../components/Icon'

export default function AgentView() {
  const [mine, setMine] = useState(null)
  const [myStats, setMyStats] = useState(null)

  useEffect(() => {
    listConversations({ limit: 6 })
      .then(data => setMine(data.map(c => ({
        id: c.id,
        topic: c.title,
        date: new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        duration: c.duration_seconds != null ? `${Math.floor(c.duration_seconds / 60)}:${String(Math.round(c.duration_seconds) % 60).padStart(2, '0')}` : '—',
        compliance: c.status === 'completed' ? 'pass' : c.status === 'failed' ? 'fail' : 'review',
      }))))
      .catch(() => setMine([]))

    Promise.all([me(), analyticsAgents()])
      .then(([user, agents]) => setMyStats(agents.find(a => a.user_id === user.id) || false))
      .catch(() => setMyStats(false))
  }, [])

  const qaPct = myStats && myStats.avg_qa_score != null ? Math.round(myStats.avg_qa_score * 100) : 0
  const myKpis = [
    { label: 'My calls', value: myStats ? myStats.calls : 0, suffix: '', delta: '' },
    { label: 'Completed', value: myStats ? myStats.completed : 0, suffix: '', delta: '' },
    { label: 'Avg QA score', value: qaPct, suffix: '%', delta: '' },
    { label: 'Flags', value: myStats ? myStats.flags : 0, suffix: '', delta: '' },
  ]

  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">My performance</h1><p className="text-muted mt-1">Your calls and quality score.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {myStats === null ? Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse" />)
          : myKpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 2} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal delay={0.1}><Card className="p-6 flex flex-col items-center text-center col-span-full lg:col-span-1"><SectionTitle title="Quality score" /><Ring value={qaPct} label="avg" /><p className="text-[13px] text-muted mt-4">{myStats && myStats.calls ? `Based on ${myStats.calls} calls.` : 'No quality-score data yet.'}</p></Card></Reveal>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="Recent calls" action={<Link to="/app/conversations" className="text-[13px] text-muted hover:text-ink">All</Link>} />
          {mine === null ? (
            <p className="text-[13px] text-muted py-6 text-center">Loading…</p>
          ) : mine.length === 0 ? (
            <p className="text-[13px] text-muted py-6 text-center">No calls yet.</p>
          ) : (
            <div className="divide-y divide-hairline">
              {mine.map(c => (
                <Link key={c.id} to={`/app/conversations/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-soft -mx-2 px-2 rounded-md">
                  <span className="w-8 h-8 rounded-md bg-surface-card flex items-center justify-center text-ink"><Icon name="Phone" size={15} /></span>
                  <div className="flex-1 min-w-0"><div className="text-[14px] font-medium text-ink">{c.topic}</div><div className="text-[12px] text-muted">{c.date} · {c.duration}</div></div>
                  <StatusChip status={c.compliance} />
                </Link>
              ))}
            </div>
          )}
        </Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="Coaching feedback" sub="Not tracked yet" />
          <p className="text-[13px] text-muted py-6 text-center">No coaching feedback available yet.</p>
        </Card></Reveal>
      </div>
    </div>
  )
}
