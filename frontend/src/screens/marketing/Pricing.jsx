import { Link } from 'react-router-dom'
import { MarketingPage } from '../../components/Marketing'
import { Card, Badge, Button, Reveal } from '../../components/ui'
import Icon from '../../components/Icon'

const tiers = [
  { name: 'Starter', price: '$0', note: 'Up to 500 calls/mo', feats: ['ASR + diarization', 'Basic dashboard', '1 seat', 'Community support'] },
  { name: 'Team', price: '$499', note: 'Up to 25k calls/mo', feats: ['Full AI pipeline', 'Compliance scoring', 'Up to 25 seats', 'Email support'] },
  { name: 'Business', price: '$1,499', note: 'Up to 150k calls/mo', feats: ['Prediction & analytics', 'White-label branding', 'Up to 150 seats', 'Priority support'], featured: true },
  { name: 'Enterprise', price: 'Custom', note: 'Unlimited', feats: ['SSO + SCIM', 'Custom retention', 'Unlimited seats', 'Dedicated CSM'] },
]
const faqs = [
  ['What counts as a call?', 'Any conversation processed through the pipeline — live or recorded.'],
  ['Can I white-label?', 'Yes, on Business and above. Your subdomain loads your brand before login.'],
  ['Is there a free trial?', 'Starter is free forever. Upgrade any time as your volume grows.'],
]

export default function Pricing() {
  return (
    <MarketingPage>
      <section className="max-w-content mx-auto px-6 pt-20 pb-12 text-center">
        <Reveal><Badge className="mb-5">Pricing</Badge>
          <h1 className="display d-xl text-ink">Scales with your floor</h1>
          <p className="text-[18px] text-muted mt-5 max-w-lg mx-auto">Start free. Upgrade when your call volume does.</p>
        </Reveal>
      </section>
      <section className="max-w-content mx-auto px-6 pb-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06}>
            <div className={`rounded-lg p-7 h-full relative overflow-hidden flex flex-col ${t.featured ? 'bg-[#101010] text-white' : 'border border-hairline bg-surface'}`}>
              {t.featured && <><div className="absolute inset-x-0 top-0 h-1 ai-gradient" /><span className="absolute top-5 right-5 text-[11px] font-medium bg-white/15 text-white rounded-full px-2 py-0.5">Popular</span></>}
              <h3 className={`text-[22px] font-semibold ${t.featured ? 'text-white' : 'text-ink'}`}>{t.name}</h3>
              <div className={`display d-sm mt-2 ${t.featured ? 'text-white' : 'text-ink'}`}>{t.price}</div>
              <p className={`text-[13px] mb-5 ${t.featured ? 'text-white/60' : 'text-muted'}`}>{t.note}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {t.feats.map(f => <li key={f} className={`flex items-center gap-2 text-[14px] ${t.featured ? 'text-white/80' : 'text-body'}`}><Icon name="Check" size={15} className={t.featured ? 'text-white' : 'text-success'} /> {f}</li>)}
              </ul>
              <Button as={Link} to="/signup" variant="secondary" className="w-full">{t.price === 'Custom' ? 'Talk to sales' : 'Get started'}</Button>
            </div>
          </Reveal>
        ))}
      </section>
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <Reveal><h2 className="display d-md text-ink text-center mb-8">Frequently asked</h2></Reveal>
        <div className="space-y-3">
          {faqs.map(([q, a], i) => <Reveal key={q} delay={i * 0.05}><Card className="p-5"><h3 className="text-[15px] font-semibold text-ink mb-1">{q}</h3><p className="text-[14px] text-muted">{a}</p></Card></Reveal>)}
        </div>
      </section>
    </MarketingPage>
  )
}
