import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketingPage } from '../../components/Marketing'
import { Card, Badge, Button, Reveal } from '../../components/ui'
import Icon from '../../components/Icon'
import { LeadFormModal } from '../../components/LeadForm'

const items = [
  { icon: 'KeyRound', title: 'SSO & SCIM', body: 'SAML/OIDC single sign-on with automated user provisioning.' },
  { icon: 'Lock', title: 'Tenant isolation', body: 'Each org runs on its own isolated subdomain and data boundary.' },
  { icon: 'ShieldCheck', title: 'Compliance', body: 'SOC 2 Type II, GDPR and HIPAA with configurable data retention.' },
  { icon: 'Database', title: 'Data residency', body: 'Choose where your call data is stored and processed.' },
  { icon: 'Webhook', title: 'API & webhooks', body: 'Stream insights into your warehouse, CRM or ticketing system.' },
  { icon: 'Headset', title: 'Dedicated CSM', body: 'A named success manager and priority 24/7 support.' },
]

export default function Enterprise() {
  const [leadOpen, setLeadOpen] = useState(false)
  return (
    <MarketingPage>
      <section className="bg-[#0b0b0d] text-white">
        <div className="max-w-content mx-auto px-6 py-24 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] ai-gradient opacity-20 blur-3xl" />
          <Reveal>
            <Badge className="mb-5 !bg-white/10 !text-white">Enterprise</Badge>
            <h1 className="display d-xl max-w-3xl mx-auto relative">Security and scale for the <span className="ai-text">largest floors</span></h1>
            <p className="text-[18px] text-white/60 mt-5 max-w-xl mx-auto relative">Subdomain isolation, SSO, custom retention and a dedicated team — built for regulated, high-volume contact centers.</p>
            <div className="flex justify-center gap-3 mt-8 relative"><Button onClick={() => setLeadOpen(true)} size="lg">Talk to sales</Button><Button as={Link} to="/signup" variant="secondary" size="lg" className="!bg-white/10 !text-white !border-white/20">Start free</Button></div>
          </Reveal>
        </div>
      </section>
      <section className="max-w-content mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((m, i) => (
          <Reveal key={m.title} delay={i * 0.05}>
            <Card className="p-7 h-full"><div className="w-11 h-11 rounded-lg bg-surface-card text-ink flex items-center justify-center mb-4"><Icon name={m.icon} size={21} /></div>
              <h3 className="text-[18px] font-semibold text-ink mb-2">{m.title}</h3><p className="text-[15px] text-body">{m.body}</p></Card>
          </Reveal>
        ))}
      </section>
      <section className="max-w-content mx-auto px-6 pb-24"><Reveal><Card soft className="p-12 text-center">
        <h2 className="display d-sm text-ink">Bring Sonic to your enterprise.</h2>
        <p className="text-[16px] text-muted mt-2 mb-6">Talk to our team about a tailored rollout.</p>
        <Button onClick={() => setLeadOpen(true)} size="lg">Contact sales</Button>
      </Card></Reveal></section>
      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} source="enterprise" />
    </MarketingPage>
  )
}
