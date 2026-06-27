import { Link } from 'react-router-dom'
import { MarketingPage } from '../../components/Marketing'
import { Card, Badge, Button, Reveal } from '../../components/ui'
import Pipeline from '../../components/Pipeline'
import Icon from '../../components/Icon'
import { PIPELINE } from '../../lib/data'

export default function PipelinePage() {
  return (
    <MarketingPage>
      <section className="max-w-content mx-auto px-6 pt-20 pb-10 text-center">
        <Reveal>
          <Badge className="mb-5">AI Pipeline</Badge>
          <h1 className="display d-xl text-ink max-w-3xl mx-auto">Ten stages, <span className="ai-text">one journey</span></h1>
          <p className="text-[18px] text-muted mt-5 max-w-xl mx-auto">Every call flows through the same pipeline — recognizable across every screen in the product.</p>
        </Reveal>
      </section>
      <section className="max-w-content mx-auto px-6 pb-16"><Reveal><Card className="p-8"><Pipeline /></Card></Reveal></section>
      <section className="max-w-content mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {PIPELINE.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <Card className="p-5 h-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.ai ? 'ai-gradient text-white' : 'bg-surface-card text-ink'}`}><Icon name={s.icon} size={19} /></div>
              <div className="text-[11px] text-muted mb-0.5">Stage {i + 1}</div>
              <h3 className="text-[15px] font-semibold text-ink">{s.label}</h3>
              <p className="text-[13px] text-muted mt-1">{s.desc}</p>
            </Card>
          </Reveal>
        ))}
      </section>
      <section className="max-w-content mx-auto px-6 pb-24"><Reveal><Card soft className="p-12 text-center">
        <h2 className="display d-sm text-ink">See it run on a real call.</h2>
        <p className="text-[16px] text-muted mt-2 mb-6">Open the Conversation Replay demo.</p>
        <Button as={Link} to="/app/conversations/CV-4471" size="lg">Open live demo <Icon name="ArrowRight" size={16} /></Button>
      </Card></Reveal></section>
    </MarketingPage>
  )
}
