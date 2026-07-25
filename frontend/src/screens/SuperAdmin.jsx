import { useEffect, useState } from 'react'
import { Card, SectionTitle, StatusChip, KPICard, Reveal } from '../components/ui'
import { BarChart } from '../components/charts'
import { PIPELINE } from '../lib/data'
import { platformOverview, platformTenants } from '../lib/api'
import Icon from '../components/Icon'

export function PlatformOverview() {
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    platformOverview().then(setOverview).catch(() => setOverview(false))
  }, [])

  const kpis = overview ? [
    { label: 'Tenants', value: overview.tenant_count, suffix: '', delta: '' },
    { label: 'Total seats', value: overview.total_seats, suffix: '', delta: '' },
    { label: 'Conversations', value: overview.total_conversations, suffix: '', delta: '' },
  ] : null

  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Platform overview</h1><p className="text-muted mt-1">The whole fleet, across every tenant.</p></div>
      {overview === false ? (
        <Card className="p-6 text-center text-muted"><Icon name="AlertCircle" size={20} className="mx-auto mb-2" />You need platform-admin access to view this.</Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis ? kpis.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 2} />)
            : Array.from({ length: 3 }).map((_, i) => <Card key={i} className="p-5 h-24 animate-pulse" />)}
        </div>
      )}
      <TenantTable />
    </div>
  )
}

function TenantTable() {
  const [tenants, setTenants] = useState(null)

  useEffect(() => {
    platformTenants().then(setTenants).catch(() => setTenants(false))
  }, [])

  return (
    <Reveal><Card className="overflow-hidden">
      <div className="p-6 pb-3"><SectionTitle title="Tenants" sub="Subdomain, seats, and conversation volume" /></div>
      <div className="overflow-x-auto"><table className="w-full text-[14px] min-w-[600px]">
        <thead><tr className="text-left text-muted text-[12px] uppercase border-y border-hairline">{['Tenant', 'Seats', 'Conversations', 'Created'].map(h => <th key={h} className="font-medium px-6 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-hairline">
          {tenants === false ? (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">You need platform-admin access to view this.</td></tr>
          ) : tenants === null ? (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">Loading…</td></tr>
          ) : tenants.length === 0 ? (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No tenants yet.</td></tr>
          ) : tenants.map(t => (
            <tr key={t.id} className="hover:bg-surface-soft">
              <td className="px-6 py-3"><span className="flex items-center gap-3"><span className="w-8 h-8 rounded-md ai-gradient text-white text-[11px] font-bold inline-flex items-center justify-center">{t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span><span><span className="block font-medium text-ink">{t.name}</span><span className="block text-[12px] text-muted font-mono">{t.subdomain}.sonic.ai</span></span></span></td>
              <td className="px-6 text-body">{t.seats}</td>
              <td className="px-6 text-body">{t.total_conversations}</td>
              <td className="px-6 text-body">{new Date(t.created_at).toLocaleDateString()}</td>
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
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="Revenue by plan" sub="No payment provider integrated" /><BarChart data={[]} height={160} labels={['Starter', 'Team', 'Business', 'Enterprise']} /></Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="This cycle" />
          <div className="space-y-3">
            {[['MRR', '—'], ['Net new', '—'], ['Churn', '—'], ['Overages', '—']].map(([l, v]) => <div key={l} className="flex justify-between text-[14px]"><span className="text-muted">{l}</span><span className="font-semibold text-ink">{v}</span></div>)}
          </div>
        </Card></Reveal>
      </div>
      <Reveal><Card className="overflow-hidden"><div className="p-6 pb-3"><SectionTitle title="Tenant invoices" sub="Billing requires a payment provider integration (e.g. Stripe) that isn't wired up yet" /></div>
        <table className="w-full text-[14px]"><thead><tr className="text-left text-muted text-[12px] uppercase border-y border-hairline">{['Tenant', 'Plan', 'This month', 'Status'].map(h => <th key={h} className="font-medium px-6 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-hairline"><tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No billing data available yet.</td></tr></tbody></table>
      </Card></Reveal>
    </div>
  )
}

export function PlatformHealth() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Fleet health</h1><p className="text-muted mt-1">Pipeline status aggregated across all tenants.</p></div>
      <Card className="p-6 text-center text-muted mb-4">
        <p className="text-[13px]">Fleet-wide (cross-tenant) pipeline health isn&rsquo;t tracked yet — see <a href="/app/health" className="text-ink font-medium">System health</a> for per-tenant status.</p>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {PIPELINE.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between mb-3"><Icon name={s.icon} size={18} className="text-ink" /><StatusChip status="idle">—</StatusChip></div>
            <div className="text-[14px] font-semibold text-ink">{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
