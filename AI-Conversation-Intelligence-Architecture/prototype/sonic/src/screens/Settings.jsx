import { useState } from 'react'
import { useTheme, TENANTS } from '../theme/ThemeContext'
import { Card, Button, Toggle, StatusChip, Avatar } from '../components/ui'
import Icon from '../components/Icon'

const TABS = [
  { id: 'branding', label: 'Branding', icon: 'Palette' },
  { id: 'team', label: 'Team & roles', icon: 'Users' },
  { id: 'integrations', label: 'Integrations', icon: 'Plug' },
  { id: 'api', label: 'API keys', icon: 'KeyRound' },
  { id: 'data', label: 'Data & retention', icon: 'Database' },
]

export default function Settings() {
  const [tab, setTab] = useState('branding')
  const { tenant } = useTheme()
  const t = TENANTS[tenant]

  return (
    <div className="space-y-6">
      <div><h1 className="display d-lg text-ink">Settings</h1><p className="text-muted mt-1">Configure {t.name}.</p></div>
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map(x => (
            <button key={x.id} onClick={() => setTab(x.id)} className={`flex items-center gap-2.5 px-3 h-10 rounded-md text-[14px] font-medium whitespace-nowrap transition ${tab === x.id ? 'bg-primary-soft text-ink' : 'text-body hover:bg-surface-soft'}`}>
              <Icon name={x.icon} size={17} /> {x.label}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          {tab === 'branding' && <>
            <Card className="p-6">
              <h3 className="text-[16px] font-semibold text-ink mb-1">White-label branding</h3>
              <p className="text-[13px] text-muted mb-5">Loads on your subdomain before sign-in. Switch tenants from the top bar to preview.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-2">Logo</label>
                  <div className="flex items-center gap-3"><span className="w-14 h-14 rounded-xl text-white font-bold text-[18px] flex items-center justify-center" style={{ background: 'rgb(var(--primary))' }}>{t.initials}</span><Button variant="secondary" size="sm">Upload</Button></div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-2">Primary brand color</label>
                  <div className="flex items-center gap-2"><span className="w-10 h-10 rounded-md border border-hairline" style={{ background: 'rgb(var(--primary))' }} /><span className="font-mono text-[13px] text-body">via .{t.id} tenant theme</span></div>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-hairline p-4 flex items-center justify-between"><span className="text-[14px] text-ink">Custom domain (CNAME)</span><span className="font-mono text-[13px] text-muted">app.{t.id}.com</span></div>
            </Card>
          </>}

          {tab === 'team' && <Card className="p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[16px] font-semibold text-ink">Team members</h3><Button size="sm"><Icon name="UserPlus" size={15} /> Invite</Button></div>
            <div className="divide-y divide-hairline">
              {[['Maya Chen', 'Supervisor / QA', 'active'], ['Liam Ortiz', 'Agent', 'active'], ['Priya Nair', 'QA Analyst', 'active'], ['Tom Becker', 'Agent', 'review']].map(([n, r, s]) => (
                <div key={n} className="flex items-center gap-3 py-3"><Avatar name={n} size={34} /><span className="flex-1"><span className="block text-[14px] font-medium text-ink">{n}</span><span className="block text-[12px] text-muted">{r}</span></span><StatusChip status={s === 'active' ? 'active' : 'review'} /><Button variant="ghost" size="sm"><Icon name="MoreHorizontal" size={16} /></Button></div>
              ))}
            </div>
          </Card>}

          {tab === 'integrations' && <div className="grid sm:grid-cols-2 gap-4">
            {[['Twilio', 'Telephony', true], ['Genesys', 'Contact center', true], ['Salesforce', 'CRM', false], ['Slack', 'Alerts', true], ['Snowflake', 'Data warehouse', false], ['Zendesk', 'Ticketing', false]].map(([n, d, on]) => (
              <Card key={n} className="p-5 flex items-center gap-3"><span className="w-10 h-10 rounded-md bg-surface-card flex items-center justify-center text-ink"><Icon name="Plug" size={18} /></span><span className="flex-1"><span className="block text-[14px] font-semibold text-ink">{n}</span><span className="block text-[12px] text-muted">{d}</span></span><Toggle on={on} onChange={() => {}} /></Card>
            ))}
          </div>}

          {tab === 'api' && <Card className="p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[16px] font-semibold text-ink">API keys</h3><Button size="sm"><Icon name="Plus" size={15} /> Generate</Button></div>
            <div className="space-y-3">
              {[['Production', 'sk_live_••••••••4f2a', 'Jun 2026'], ['Staging', 'sk_test_••••••••9c01', 'May 2026']].map(([n, k, d]) => (
                <div key={n} className="flex items-center gap-3 p-3 rounded-lg border border-hairline"><span className="text-[14px] font-medium text-ink w-24">{n}</span><code className="flex-1 font-mono text-[13px] text-body">{k}</code><span className="text-[12px] text-muted">{d}</span><Button variant="ghost" size="sm"><Icon name="Copy" size={15} /></Button></div>
              ))}
            </div>
          </Card>}

          {tab === 'data' && <Card className="p-6">
            <h3 className="text-[16px] font-semibold text-ink mb-4">Data & retention</h3>
            <div className="space-y-4">
              {[['Store call audio', 'Keep raw recordings after processing', true], ['PII redaction', 'Mask sensitive data in transcripts', true], ['Allow model training', 'Use anonymized data to improve models', false]].map(([t1, d, on]) => (
                <div key={t1} className="flex items-center justify-between"><span><span className="block text-[14px] font-medium text-ink">{t1}</span><span className="block text-[12px] text-muted">{d}</span></span><Toggle on={on} onChange={() => {}} /></div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-hairline"><span className="text-[14px] text-ink">Retention period</span><select className="h-9 rounded-md border border-hairline bg-surface px-2 text-[13px] text-ink"><option>30 days</option><option>90 days</option><option>1 year</option><option>Forever</option></select></div>
            </div>
          </Card>}
        </div>
      </div>
    </div>
  )
}
