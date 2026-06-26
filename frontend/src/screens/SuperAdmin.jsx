import { Card, SectionTitle, Button, StatusChip, KPICard, Reveal } from '../components/ui'
import { AreaChart, BarChart } from '../components/charts'
import { TENANTS_ADMIN, HEALTH } from '../lib/data'
import Icon from '../components/Icon'

const platKpis = [
  { label: 'Tenants', value: 5, suffix: '', delta: '+1' },
  { label: 'Total seats', value: 564, suffix: '', delta: '+42' },
  { label: 'Calls / mo', value: 195300, suffix: '', delta: '+11%' },
  { label: 'MRR', value: 84, suffix: 'K', delta: '+9K' },
]

export function PlatformOverview() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Platform overview</h1><p className="text-muted mt-1">The whole fleet, across every tenant.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{platKpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 3} />)}</div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="Fleet call volume" sub="All tenants, 30 days" /><AreaChart data={[120, 140, 135, 160, 180, 175, 210, 230, 220, 260]} height={200} /></Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="Provisioning queue" />
          <div className="space-y-3">
            {TENANTS_ADMIN.filter(t => t.status !== 'active').map(t => (
              <div key={t.sub} className="flex items-center justify-between p-3 rounded-md bg-surface-soft"><span><span className="block text-[14px] font-medium text-ink">{t.name}</span><span className="block text-[12px] text-muted font-mono">{t.sub}.sonic.ai</span></span><StatusChip status={t.status} /></div>
            ))}
          </div>
        </Card></Reveal>
      </div>
      <TenantTable />
    </div>
  )
}

function TenantTable() {
  return (
    <Reveal><Card className="overflow-hidden">
      <div className="p-6 pb-3"><SectionTitle title="Tenants" sub="Subdomain, plan, and usage" action={<Button size="sm"><Icon name="Plus" size={15} /> New tenant</Button>} /></div>
      <div className="overflow-x-auto"><table className="w-full text-[14px] min-w-[760px]">
        <thead><tr className="text-left text-muted text-[12px] uppercase border-y border-hairline">{['Tenant', 'Sector', 'Plan', 'Seats', 'Calls', 'Usage', 'Status'].map(h => <th key={h} className="font-medium px-6 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-hairline">
          {TENANTS_ADMIN.map(t => (
            <tr key={t.sub} className="hover:bg-surface-soft">
              <td className="px-6 py-3"><span className="flex items-center gap-3"><span className="w-8 h-8 rounded-md ai-gradient text-white text-[11px] font-bold inline-flex items-center justify-center">{t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span><span><span className="block font-medium text-ink">{t.name}</span><span className="block text-[12px] text-muted font-mono">{t.sub}.sonic.ai</span></span></span></td>
              <td className="px-6 text-body">{t.sector}</td>
              <td className="px-6"><span className="text-ink">{t.plan}</span></td>
              <td className="px-6 text-body">{t.seats}</td>
              <td className="px-6 text-body">{t.calls}</td>
              <td className="px-6"><span className="flex items-center gap-2"><span className="w-16 h-1.5 rounded-full bg-surface-strong overflow-hidden"><span className="block h-full ai-gradient" style={{ width: `${t.usage}%` }} /></span>{t.usage}%</span></td>
              <td className="px-6"><StatusChip status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </Card></Reveal>
  )
}

export function PlatformTenants() {
  return <div className="space-y-6"><div><h1 className="display d-lg text-ink">Tenants</h1><p className="text-muted mt-1">All customer organizations.</p></div><TenantTable /></div>
}

export function PlatformBilling() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Usage & billing</h1><p className="text-muted mt-1">Per-tenant consumption and revenue.</p></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="Revenue by plan" /><BarChart data={[12, 28, 44, 84]} height={160} labels={['Starter', 'Team', 'Business', 'Enterprise']} /></Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="This cycle" />
          <div className="space-y-3">
            {[['MRR', '$84,200'], ['Net new', '+$9,100'], ['Churn', '-$1,800'], ['Overages', '$3,400']].map(([l, v]) => <div key={l} className="flex justify-between text-[14px]"><span className="text-muted">{l}</span><span className="font-semibold text-ink">{v}</span></div>)}
          </div>
        </Card></Reveal>
      </div>
      <Reveal><Card className="overflow-hidden"><div className="p-6 pb-3"><SectionTitle title="Tenant invoices" /></div>
        <table className="w-full text-[14px]"><thead><tr className="text-left text-muted text-[12px] uppercase border-y border-hairline">{['Tenant', 'Plan', 'This month', 'Status'].map(h => <th key={h} className="font-medium px-6 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-hairline">{TENANTS_ADMIN.map(t => (
          <tr key={t.sub} className="hover:bg-surface-soft"><td className="px-6 py-3 font-medium text-ink">{t.name}</td><td className="px-6 text-body">{t.plan}</td><td className="px-6 text-ink">{['$0', '$499', '$1,499', '$12,000'][Math.min(3, ['Starter', 'Team', 'Business', 'Enterprise'].indexOf(t.plan))]}</td><td className="px-6"><StatusChip status={t.status === 'suspended' ? 'fail' : 'pass'}>{t.status === 'suspended' ? 'Past due' : 'Paid'}</StatusChip></td></tr>
        ))}</tbody></table>
      </Card></Reveal>
    </div>
  )
}

export function PlatformHealth() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Fleet health</h1><p className="text-muted mt-1">Pipeline status aggregated across all tenants.</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {HEALTH.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between mb-3"><Icon name={s.icon} size={18} className="text-ink" /><StatusChip status={s.state} /></div>
            <div className="text-[14px] font-semibold text-ink">{s.label}</div>
            <div className="text-[12px] text-muted mt-1">{s.latency}ms · {s.throughput}/s</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
