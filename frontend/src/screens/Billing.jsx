import { useEffect, useState } from 'react'
import { Card, Button, SectionTitle, Reveal, StatusChip } from '../components/ui'
import Icon from '../components/Icon'
import { getBillingSummary, listBillingPlans, listInvoices, changePlan, downloadInvoice } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { ROLE_ADMIN } from '../lib/roles'

function fmtMoney(cents) {
  if (cents == null) return 'Custom'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Billing() {
  const { role } = useAuth()
  const [summary, setSummary] = useState(null)
  const [plans, setPlans] = useState(null)
  const [invoices, setInvoices] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [switching, setSwitching] = useState(null)
  const [switchError, setSwitchError] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [downloadError, setDownloadError] = useState(null)

  function refresh() {
    return Promise.all([getBillingSummary(), listBillingPlans(), listInvoices()])
      .then(([s, p, i]) => { setSummary(s); setPlans(p); setInvoices(i); setLoadError(null) })
      .catch(err => setLoadError(err.message))
  }

  useEffect(() => { refresh() }, [])

  async function handleSwitch(code) {
    setSwitching(code)
    setSwitchError(null)
    try {
      await changePlan(code)
      await refresh()
    } catch (err) {
      setSwitchError(`Couldn't switch plans: ${err.message}`)
    } finally {
      setSwitching(null)
    }
  }

  async function handleDownload(id) {
    setDownloading(id)
    setDownloadError(null)
    try {
      await downloadInvoice(id)
    } catch (err) {
      setDownloadError(`Couldn't download invoice: ${err.message}`)
    } finally {
      setDownloading(null)
    }
  }

  if (loadError) {
    return (
      <div className="py-24 text-center text-muted">
        <Icon name="AlertCircle" size={24} className="mx-auto mb-3" />{loadError}
      </div>
    )
  }

  if (!summary || !plans || !invoices) {
    return (
      <div className="py-24 text-center text-muted">
        <Icon name="Loader" size={24} className="mx-auto mb-3 animate-spin" />Loading billing…
      </div>
    )
  }

  const pct = summary.call_quota ? Math.min(100, Math.round((summary.calls_used / summary.call_quota) * 100)) : null
  const latestInvoice = invoices[0]

  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Billing & plan</h1><p className="text-muted mt-1">Manage your subscription and usage.</p></div>

      {pct != null && pct >= 75 && (
        <Reveal>
          <Card className="p-6 border-warning/40 bg-warning/5">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0"><Icon name="Zap" size={20} /></span>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-ink">You&rsquo;re at {pct}% of your monthly call quota</h3>
                <p className="text-[13px] text-muted mt-0.5 mb-3">{summary.calls_used.toLocaleString()} of {summary.call_quota.toLocaleString()} calls used this cycle.</p>
                <div className="h-2 rounded-full bg-surface-strong overflow-hidden max-w-md"><div className="h-full bg-warning" style={{ width: `${pct}%` }} /></div>
              </div>
            </div>
          </Card>
        </Reveal>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6">
          <SectionTitle title="Usage this cycle" sub={`${fmtDate(summary.current_period_start)} – ${fmtDate(summary.current_period_end)}`} />
          <div className="text-[14px] space-y-2.5">
            <div className="flex justify-between"><span className="text-muted">Calls used</span><span className="text-ink font-medium">{summary.calls_used.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted">Plan quota</span><span className="text-ink font-medium">{summary.call_quota ? summary.call_quota.toLocaleString() : 'Unlimited'}</span></div>
            {summary.call_quota != null && (
              <div className="h-2 rounded-full bg-surface-strong overflow-hidden mt-2"><div className="h-full ai-gradient" style={{ width: `${pct}%` }} /></div>
            )}
          </div>
        </Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="Latest invoice" />
          {latestInvoice ? (
            <>
              <div className="space-y-2.5 text-[14px]">
                <div className="flex justify-between"><span className="text-muted">{summary.plan.name} plan</span><span className="text-ink">{fmtMoney(latestInvoice.amount_cents)}</span></div>
                <div className="flex justify-between pt-2.5 border-t border-hairline font-semibold"><span className="text-ink">Issued {fmtDate(latestInvoice.issued_at)}</span><StatusChip status={latestInvoice.status === 'paid' ? 'pass' : 'review'}>{latestInvoice.status}</StatusChip></div>
              </div>
              <Button variant="secondary" className="w-full mt-4" disabled={downloading === latestInvoice.id} onClick={() => handleDownload(latestInvoice.id)}>
                <Icon name="Download" size={15} /> {downloading === latestInvoice.id ? 'Downloading…' : 'Download invoice'}
              </Button>
              {downloadError && <p className="text-[13px] text-error flex items-center gap-1.5 mt-2"><Icon name="AlertCircle" size={14} /> {downloadError}</p>}
            </>
          ) : (
            <p className="text-[13px] text-muted py-6 text-center">No invoices yet.</p>
          )}
        </Card></Reveal>
      </div>

      {invoices.length > 0 && (
        <Reveal><Card className="p-6"><SectionTitle title="Invoice history" />
          <div className="divide-y divide-hairline">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-3 text-[14px]">
                <div>
                  <div className="text-ink font-medium">{fmtDate(inv.period_start)} &ndash; {fmtDate(inv.period_end)}</div>
                  <div className="text-[12px] text-muted">Issued {fmtDate(inv.issued_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ink">{fmtMoney(inv.amount_cents)}</span>
                  <StatusChip status={inv.status === 'paid' ? 'pass' : 'review'}>{inv.status}</StatusChip>
                  <button
                    type="button"
                    title="Download invoice"
                    disabled={downloading === inv.id}
                    onClick={() => handleDownload(inv.id)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-hairline bg-surface text-body hover:bg-surface-soft transition disabled:opacity-50"
                  >
                    <Icon name="Download" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card></Reveal>
      )}

      {/* Managers may read billing (SON-52) but only admins may change the plan,
          so don't show them a switcher the API would reject. */}
      {role === ROLE_ADMIN && (
      <Reveal>
        <SectionTitle title="Change plan" />
        {switchError && <p className="text-[13px] text-error flex items-center gap-1.5 mb-4"><Icon name="AlertCircle" size={14} /> {switchError}</p>}
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(p => {
            const current = p.code === summary.plan.code
            return (
              <div key={p.code} className={`rounded-lg p-6 relative ${current ? 'bg-[#101010] text-white' : 'border border-hairline bg-surface'}`}>
                {current && <span className="absolute top-4 right-4 text-[11px] font-medium bg-white/15 text-white rounded-full px-2 py-0.5">Current</span>}
                {current && <div className="absolute inset-x-0 top-0 h-1 ai-gradient" />}
                <h3 className={`text-[20px] font-semibold ${current ? 'text-white' : 'text-ink'}`}>{p.name}</h3>
                <div className={`display d-sm mt-1 ${current ? 'text-white' : 'text-ink'}`}>{fmtMoney(p.price_cents)}</div>
                <p className={`text-[13px] mb-5 ${current ? 'text-white/60' : 'text-muted'}`}>{p.call_quota ? `${p.call_quota.toLocaleString()} calls/mo` : 'Unlimited + SSO'}</p>
                <Button variant="secondary" className="w-full" disabled={current || switching === p.code} onClick={() => handleSwitch(p.code)}>
                  {switching === p.code ? 'Switching…' : current ? 'Current plan' : `Switch to ${p.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </Reveal>
      )}
    </div>
  )
}
