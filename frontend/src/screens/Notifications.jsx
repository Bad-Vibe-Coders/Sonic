import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, StatusChip } from '../components/ui'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api'
import Icon from '../components/Icon'

const ICON = { error: 'AlertOctagon', warning: 'AlertTriangle', success: 'CheckCircle2', info: 'Info' }
const COLOR = { error: 'text-error bg-error/10', warning: 'text-warning bg-warning/10', success: 'text-success bg-success/10', info: 'text-info bg-info/10' }
const filters = ['All', 'Unread', 'error', 'warning', 'info']

function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Notifications() {
  const [filter, setFilter] = useState('All')
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  const refresh = () => listNotifications().then(setItems).catch(err => setError(err.message))

  useEffect(() => { refresh() }, [])

  const rows = (items || []).filter(n => {
    if (filter === 'Unread') return !n.read
    if (filter === 'All') return true
    return n.kind === filter
  })

  async function markRead(n) {
    if (n.read) return
    setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    try { await markNotificationRead(n.id) } catch { refresh() }
  }

  async function markAll() {
    setItems(prev => prev.map(x => ({ ...x, read: true })))
    try { await markAllNotificationsRead() } catch { refresh() }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">Alerts</h1><p className="text-muted mt-1">Compliance violations, anomalies and system events.</p></div>
        <Button variant="secondary" size="sm" onClick={markAll} disabled={!items?.length}><Icon name="CheckCheck" size={15} /> Mark all read</Button>
      </div>

      <div className="flex gap-1 p-1 rounded-full bg-surface-soft w-max">
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 h-8 rounded-full text-[13px] font-medium capitalize transition ${filter === f ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>{f}</button>)}
      </div>

      {error ? (
        <Card className="p-10 text-center text-muted"><Icon name="AlertCircle" size={24} className="mx-auto mb-3" />{error}</Card>
      ) : items === null ? (
        <Card className="p-10 text-center text-muted"><Icon name="Loader" size={24} className="mx-auto mb-3 animate-spin" />Loading…</Card>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-muted"><Icon name="BellOff" size={24} className="mx-auto mb-3" />No alerts.</Card>
      ) : (
        <div className="space-y-3">
          {rows.map(n => (
            <Card key={n.id} className={`p-4 flex gap-4 ${!n.read ? 'ring-1 ring-error/30' : ''}`}>
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR[n.kind]}`}><Icon name={ICON[n.kind]} size={19} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-[14px] font-semibold text-ink">{n.title}</span>{!n.read && <StatusChip status="error">New</StatusChip>}</div>
                <p className="text-[13px] text-muted mt-0.5">{n.body}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[12px] text-muted">{timeAgo(n.created_at)}</span>
                {n.conversation_id ? (
                  <Link to={`/app/conversations/${n.conversation_id}`} onClick={() => markRead(n)} className="text-[12px] text-ai-to font-medium">View</Link>
                ) : !n.read ? (
                  <button onClick={() => markRead(n)} className="text-[12px] text-ai-to font-medium">Mark read</button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
