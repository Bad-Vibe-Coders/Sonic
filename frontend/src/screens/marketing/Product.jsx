import { Link } from 'react-router-dom'
import { MarketingPage } from '../../components/Marketing'
import { Card, Badge, Button, Reveal } from '../../components/ui'
import Icon from '../../components/Icon'

const modules = [
  { icon: 'MessagesSquare', title: 'Conversation Replay', body: 'A single synced timeline across audio, transcript, emotion and AI insight.', to: '/app/conversations/CV-4471' },
  { icon: 'ShieldCheck', title: 'QA & Compliance', body: 'Policy scoring on every call with inline annotation and escalation.', to: '/app/supervisor' },
  { icon: 'TrendingUp', title: 'Prediction', body: 'Churn and escalation likelihood with live confidence indicators.', to: '/app/analytics' },
  { icon: 'BarChart3', title: 'Analytics', body: 'Cross-team KPIs, cohort filters and exportable executive reports.', to: '/app/analytics' },
  { icon: 'Activity', title: 'System Health', body: 'Live status of all ten pipeline stages per tenant.', to: '/app/health' },
  { icon: 'Building2', title: 'Multi-tenant', body: 'Subdomain isolation and white-label branding out of the box.', to: '/app/settings' },
]

export default function Product() {
  return (
    <MarketingPage>
      <section className="max-w-content mx-auto px-6 pt-20 pb-12 text-center">
        <Reveal>
          <Badge className="mb-5">Platform</Badge>
          <h1 className="display d-xl text-ink max-w-3xl mx-auto">One platform for <span className="ai-text">every conversation</span></h1>
          <p className="text-[18px] text-muted mt-5 max-w-xl mx-auto">From raw audio to a role-based dashboard — every module shares the same design system and the same AI pipeline.</p>
          <div className="flex justify-center gap-3 mt-7"><Button as={Link} to="/signup" size="lg">Start free</Button><Button as={Link} to="/pipeline" variant="secondary" size="lg">See the pipeline</Button></div>
        </Reveal>
      </section>
      <section className="max-w-content mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, i) => (
          <Reveal key={m.title} delay={i * 0.06}>
            <Link to={m.to}><Card className="p-7 h-full hover:shadow-card transition group">
              <div className="w-11 h-11 rounded-lg ai-gradient text-white flex items-center justify-center mb-4"><Icon name={m.icon} size={21} /></div>
              <h3 className="text-[18px] font-semibold text-ink mb-2 flex items-center gap-1.5">{m.title}<Icon name="ArrowUpRight" size={16} className="text-muted opacity-0 group-hover:opacity-100 transition" /></h3>
              <p className="text-[15px] text-body">{m.body}</p>
            </Card></Link>
          </Reveal>
        ))}
      </section>
    </MarketingPage>
  )
}
