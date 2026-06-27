import { Card, Button, SectionTitle } from '../components/ui'
import Icon from '../components/Icon'

function Skeleton() {
  return (
    <Card className="p-5 space-y-3">
      <div className="h-4 w-1/3 rounded bg-surface-strong animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-surface-strong/70 animate-pulse" />
      <div className="h-24 rounded bg-surface-strong/50 animate-pulse" />
      <div className="flex gap-3"><div className="h-3 flex-1 rounded bg-surface-strong/60 animate-pulse" /><div className="h-3 flex-1 rounded bg-surface-strong/60 animate-pulse" /></div>
    </Card>
  )
}

function StateCard({ icon, title, body, action, tone = 'muted' }) {
  const toneCls = { muted: 'text-muted bg-surface-card', error: 'text-error bg-error/10', ai: 'text-white ai-gradient' }[tone]
  return (
    <Card className="p-10 flex flex-col items-center text-center">
      <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${toneCls}`}><Icon name={icon} size={26} /></span>
      <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
      <p className="text-[13px] text-muted mt-1 mb-5 max-w-xs">{body}</p>
      {action}
    </Card>
  )
}

export default function States() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">States</h1><p className="text-muted mt-1">Empty, loading and error patterns used across the app.</p></div>

      <div><SectionTitle title="Loading" sub="Skeleton placeholders" /><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map(i => <Skeleton key={i} />)}</div></div>

      <div><SectionTitle title="Empty" /><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StateCard icon="Inbox" title="No conversations yet" body="Once your telephony source is connected, calls appear here automatically." action={<Button size="sm">Connect a source</Button>} />
        <StateCard icon="SearchX" title="No results" body="No conversations match your current filters. Try widening your search." action={<Button variant="secondary" size="sm">Clear filters</Button>} />
        <StateCard icon="Sparkles" tone="ai" title="Analysis in progress" body="The AI pipeline is processing this batch. Insights will appear shortly." action={<span className="text-[13px] text-muted">~2 min remaining</span>} />
      </div></div>

      <div><SectionTitle title="Error" /><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StateCard icon="WifiOff" tone="error" title="Connection lost" body="We couldn't reach the analytics service. Check your network and retry." action={<Button variant="secondary" size="sm"><Icon name="RotateCw" size={14} /> Retry</Button>} />
        <StateCard icon="ShieldAlert" tone="error" title="Access denied" body="Your role doesn't have permission to view this resource." action={<Button variant="secondary" size="sm">Request access</Button>} />
        <StateCard icon="ServerCrash" tone="error" title="Something went wrong" body="An unexpected error occurred. Our team has been notified." action={<Button variant="secondary" size="sm">Reload</Button>} />
      </div></div>
    </div>
  )
}
