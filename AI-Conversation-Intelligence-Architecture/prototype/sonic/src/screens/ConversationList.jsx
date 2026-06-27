import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, StatusChip, Avatar, Badge } from '../components/ui'
import { CONVERSATIONS } from '../lib/data'
import Icon from '../components/Icon'

const filters = ['All', 'Flagged', 'High risk', 'Reviewing']

export default function ConversationList() {
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')

  const rows = CONVERSATIONS.filter(c => {
    if (filter === 'Flagged' && !c.flagged) return false
    if (filter === 'High risk' && c.risk < 70) return false
    if (filter === 'Reviewing' && c.status !== 'reviewing') return false
    if (q && !`${c.agent} ${c.topic} ${c.id}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const sentColor = v => v >= 66 ? 'text-success' : v >= 40 ? 'text-warning' : 'text-error'

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">Conversations</h1><p className="text-muted mt-1">{rows.length} of {CONVERSATIONS.length} conversations</p></div>
        <Button variant="secondary"><Icon name="Download" size={16} /> Export CSV</Button>
      </div>

      <Card className="p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-surface-soft border border-hairline flex-1">
          <Icon name="Search" size={16} className="text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search agent, topic, ID…" className="bg-transparent outline-none text-[14px] text-ink w-full" />
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-surface-soft">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 h-8 rounded-full text-[13px] font-medium transition ${filter === f ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>{f}</button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] min-w-[760px]">
            <thead><tr className="text-left text-muted text-[12px] uppercase border-b border-hairline">
              {['Conversation', 'Date', 'Duration', 'Sentiment', 'Risk', 'Compliance', ''].map(h => <th key={h} className="font-medium px-5 py-3">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-hairline">
              {rows.map(c => (
                <tr key={c.id} className="hover:bg-surface-soft transition">
                  <td className="px-5 py-3"><span className="flex items-center gap-3"><Avatar name={c.agent} size={32} /><span><span className="block font-medium text-ink">{c.topic}</span><span className="block text-[12px] text-muted">{c.agent} · {c.id}</span></span></span></td>
                  <td className="px-5 text-body">{c.date}</td>
                  <td className="px-5 text-body font-mono text-[13px]">{c.duration}</td>
                  <td className="px-5"><span className={`font-semibold ${sentColor(c.sentiment)}`}>{c.sentiment}</span></td>
                  <td className="px-5"><span className="flex items-center gap-2"><span className="w-16 h-1.5 rounded-full bg-surface-strong overflow-hidden"><span className={`block h-full ${c.risk >= 70 ? 'bg-error' : c.risk >= 40 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${c.risk}%` }} /></span><span className="text-[13px] text-muted">{c.risk}%</span></span></td>
                  <td className="px-5"><StatusChip status={c.compliance} /></td>
                  <td className="px-5 text-right"><Button as={Link} to={`/app/conversations/${c.id}`} variant="ghost" size="sm">Replay <Icon name="Play" size={13} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="py-16 text-center text-muted"><Icon name="SearchX" size={28} className="mx-auto mb-3" />No conversations match your filters.</div>}
      </Card>
    </div>
  )
}
