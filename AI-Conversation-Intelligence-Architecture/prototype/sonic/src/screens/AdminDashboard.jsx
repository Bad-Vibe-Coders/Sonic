import { Link } from 'react-router-dom'
import { KPICard, Card, SectionTitle, Button, StatusChip, Reveal } from '../components/ui'
import { AreaChart, BarChart } from '../components/charts'
import { KPIS, NOTIFICATIONS, HEALTH } from '../lib/data'
import Icon from '../components/Icon'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display d-lg text-ink">Good morning, Operator</h1>
          <p className="text-muted mt-1">Here's how your organization is performing today.</p>
        </div>
        <Button as={Link} to="/app/settings" variant="secondary"><Icon name="Settings" size={16} /> Org settings</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.admin.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 2} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2">
          <Card className="p-6 h-full">
            <SectionTitle title="Call volume" sub="Last 14 days" action={<Button variant="ghost" size="sm">Export <Icon name="Download" size={14} /></Button>} />
            <BarChart data={[42, 55, 48, 61, 58, 72, 65, 80, 74, 88, 79, 91, 85, 96].map(v => v * 100)} height={180}
              labels={['', '', '', '', '', 'wk1', '', '', '', '', 'wk2', '', '', 'now']}
              format={v => `${v.toLocaleString('en-US')} calls`} />
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="p-6 h-full">
            <SectionTitle title="Recent alerts" action={<Link to="/app/notifications" className="text-[13px] text-muted hover:text-ink">All</Link>} />
            <div className="space-y-3">
              {NOTIFICATIONS.slice(0, 4).map((n, i) => (
                <div key={i} className="flex gap-3">
                  <span className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center bg-surface-card ${({ error: 'text-error', warning: 'text-warning', success: 'text-success', info: 'text-info' })[n.kind]}`}>
                    <Icon name={({ error: 'AlertOctagon', warning: 'AlertTriangle', success: 'CheckCircle2', info: 'Info' })[n.kind]} size={15} />
                  </span>
                  <div><div className="text-[13px] font-medium text-ink">{n.title}</div><div className="text-[12px] text-muted">{n.body}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="p-6">
          <SectionTitle title="Pipeline status" sub="Live health across the 10 AI stages" action={<Button as={Link} to="/app/health" variant="ghost" size="sm">Open monitor <Icon name="ArrowRight" size={14} /></Button>} />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {HEALTH.map(s => (
              <div key={s.id} className="rounded-lg border border-hairline p-3">
                <div className="flex items-center justify-between mb-2"><Icon name={s.icon} size={16} className="text-ink" /><span className={`w-2 h-2 rounded-full ${s.state === 'healthy' ? 'bg-success' : s.state === 'degraded' ? 'bg-warning' : 'bg-muted'}`} /></div>
                <div className="text-[12px] font-semibold text-ink">{s.label}</div>
                <div className="text-[11px] text-muted">{s.latency}ms</div>
              </div>
            ))}
          </div>
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
