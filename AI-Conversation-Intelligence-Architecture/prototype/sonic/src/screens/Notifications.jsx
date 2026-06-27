import { useState } from 'react'
import { Card, Button, StatusChip } from '../components/ui'
import { NOTIFICATIONS } from '../lib/data'
import Icon from '../components/Icon'

const ICON = { error: 'AlertOctagon', warning: 'AlertTriangle', success: 'CheckCircle2', info: 'Info' }
const COLOR = { error: 'text-error bg-error/10', warning: 'text-warning bg-warning/10', success: 'text-success bg-success/10', info: 'text-info bg-info/10' }
const filters = ['All', 'Compliance', 'Anomalies', 'System']

// Add a couple extra so the list feels alive; first one pulses (new).
const ALL = [
  { kind: 'error', title: 'New compliance violation', body: 'PII exposed in transcript on CV-4490 (Tom Becker)', time: 'just now', fresh: true },
  ...NOTIFICATIONS,
  { kind: 'warning', title: 'Anomaly detected', body: 'Unusual call-abandon rate on the Billing queue', time: '3h ago' },
  { kind: 'info', title: 'Weekly report ready', body: 'Executive analytics export for week 25 is available', time: '5h ago' },
]

export default function Notifications() {
  const [filter, setFilter] = useState('All')
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">Alerts</h1><p className="text-muted mt-1">Compliance violations, anomalies and system events.</p></div>
        <Button variant="secondary" size="sm"><Icon name="CheckCheck" size={15} /> Mark all read</Button>
      </div>

      <div className="flex gap-1 p-1 rounded-full bg-surface-soft w-max">
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 h-8 rounded-full text-[13px] font-medium transition ${filter === f ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>{f}</button>)}
      </div>

      <div className="space-y-3">
        {ALL.map((n, i) => (
          <Card key={i} className={`p-4 flex gap-4 ${n.fresh ? 'ring-1 ring-error/30' : ''}`}>
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR[n.kind]} ${n.fresh ? 'animate-pulseGlow' : ''}`}><Icon name={ICON[n.kind]} size={19} /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="text-[14px] font-semibold text-ink">{n.title}</span>{n.fresh && <StatusChip status="error">New</StatusChip>}</div>
              <p className="text-[13px] text-muted mt-0.5">{n.body}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0"><span className="text-[12px] text-muted">{n.time}</span><button className="text-[12px] text-ai-to font-medium">View</button></div>
          </Card>
        ))}
      </div>
    </div>
  )
}
