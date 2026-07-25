import { Card, Button, SectionTitle, Reveal } from '../components/ui'
import { BarChart } from '../components/charts'
import Icon from '../components/Icon'

const plans = [
  { name: 'Team', price: '$499', note: '25k calls/mo', current: false },
  { name: 'Business', price: '$1,499', note: '150k calls/mo', current: true },
  { name: 'Enterprise', price: 'Custom', note: 'Unlimited + SSO', current: false },
]

export default function Billing() {
  return (
    <div className="space-y-8">
      <div><h1 className="display d-lg text-ink">Billing & plan</h1><p className="text-muted mt-1">Manage your subscription and usage.</p></div>

      {/* usage / paywall warning */}
      <Reveal>
        <Card className="p-6 border-warning/40 bg-warning/5">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-warning/15 text-warning flex items-center justify-center shrink-0"><Icon name="Zap" size={20} /></span>
            <div className="flex-1">
              <h3 className="text-[15px] font-semibold text-ink">You&rsquo;re at 78% of your monthly call quota</h3>
              <p className="text-[13px] text-muted mt-0.5 mb-3">117,000 of 150,000 calls used. Upgrade to avoid overage charges.</p>
              <div className="h-2 rounded-full bg-surface-strong overflow-hidden max-w-md"><div className="h-full bg-warning" style={{ width: '78%' }} /></div>
            </div>
            <Button variant="ai" size="sm">Upgrade</Button>
          </div>
        </Card>
      </Reveal>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6"><SectionTitle title="Usage this cycle" sub="Calls processed per day" /><BarChart data={[3.2, 4.1, 3.8, 4.6, 5.2, 4.9, 5.8, 6.1, 5.4, 6.7].map(x => x * 100)} height={170} /></Card></Reveal>
        <Reveal delay={0.1}><Card className="p-6"><SectionTitle title="Invoice" />
          <div className="space-y-2.5 text-[14px]">
            {[['Business plan', '$1,499'], ['Overage (0)', '$0'], ['Add-on seats (12)', '$240'], ['Tax', '$174']].map(([l, v]) => <div key={l} className="flex justify-between"><span className="text-muted">{l}</span><span className="text-ink">{v}</span></div>)}
            <div className="flex justify-between pt-2.5 border-t border-hairline font-semibold"><span className="text-ink">Total due Jul 1</span><span className="text-ink">$1,913</span></div>
          </div>
          <Button variant="secondary" className="w-full mt-4"><Icon name="Download" size={15} /> Download invoice</Button>
        </Card></Reveal>
      </div>

      <Reveal>
        <SectionTitle title="Change plan" />
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <div key={p.name} className={`rounded-lg p-6 relative ${p.current ? 'bg-[#101010] text-white' : 'border border-hairline bg-surface'}`}>
              {p.current && <span className="absolute top-4 right-4 text-[11px] font-medium bg-white/15 text-white rounded-full px-2 py-0.5">Current</span>}
              {p.current && <div className="absolute inset-x-0 top-0 h-1 ai-gradient" />}
              <h3 className={`text-[20px] font-semibold ${p.current ? 'text-white' : 'text-ink'}`}>{p.name}</h3>
              <div className={`display d-sm mt-1 ${p.current ? 'text-white' : 'text-ink'}`}>{p.price}</div>
              <p className={`text-[13px] mb-5 ${p.current ? 'text-white/60' : 'text-muted'}`}>{p.note}</p>
              <Button variant="secondary" className="w-full" disabled={p.current}>{p.current ? 'Current plan' : `Switch to ${p.name}`}</Button>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
