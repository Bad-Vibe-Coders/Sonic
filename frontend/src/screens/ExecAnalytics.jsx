import { useState } from 'react'
import { KPICard, Card, SectionTitle, Button, Reveal, StatusChip } from '../components/ui'
import { AreaChart, BarChart, Ring } from '../components/charts'
import { KPIS } from '../lib/data'
import Icon from '../components/Icon'

const cohorts = ['All teams', 'Healthcare', 'Billing', 'Retention', 'Tier-1']

export default function ExecAnalytics() {
  const [cohort, setCohort] = useState('All teams')
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">Executive analytics</h1><p className="text-muted mt-1">Cross-team KPIs and predictive insight.</p></div>
        <div className="flex gap-2">
          <select value={cohort} onChange={e => setCohort(e.target.value)} className="h-10 rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink outline-none">
            {cohorts.map(c => <option key={c}>{c}</option>)}
          </select>
          <Button variant="secondary"><Icon name="Download" size={16} /> Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.exec.map((k, i) => <KPICard key={k.label} {...k} index={i} ai={i === 1} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Reveal className="lg:col-span-2"><Card className="p-6 h-full">
          <SectionTitle title="Conversation volume & sentiment" sub="12-month trend" />
          <AreaChart data={[30, 38, 35, 44, 50, 47, 58, 62, 60, 70, 68, 78]} height={200} />
          <div className="grid grid-cols-12 gap-1 mt-2 text-[10px] text-muted">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => <span key={i} className="text-center">{m}</span>)}</div>
        </Card></Reveal>

        <Reveal delay={0.1}><Card className="p-6 h-full flex flex-col items-center justify-center text-center">
          <SectionTitle title="Predicted churn" sub="Next 30 days" />
          <Ring value={4} label="at risk" />
          <p className="text-[13px] text-muted mt-4">≈ <span className="ai-text font-semibold">$248K</span> revenue at risk across 1,240 accounts.</p>
          <Button variant="ai" size="sm" className="mt-4">View at-risk cohort</Button>
        </Card></Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Reveal><Card className="p-6"><SectionTitle title="Calls by outcome" /><BarChart data={[64, 48, 30, 22, 16]} height={140} labels={['Resolved', 'Escalated', 'Callback', 'Churn', 'Other']} /></Card></Reveal>
        <Reveal delay={0.08}><Card className="p-6"><SectionTitle title="Compliance by category" />
          <div className="space-y-3 mt-2">
            {[['Disclosure', 92], ['Identity verify', 98], ['Escalation path', 85], ['Data handling', 96]].map(([l, v]) => (
              <div key={l}><div className="flex justify-between text-[13px] mb-1"><span className="text-body">{l}</span><span className="text-ink font-medium">{v}%</span></div><div className="h-1.5 rounded-full bg-surface-strong overflow-hidden"><div className="h-full ai-gradient" style={{ width: `${v}%` }} /></div></div>
            ))}
          </div>
        </Card></Reveal>
        <Reveal delay={0.16}><Card className="p-6"><SectionTitle title="Top predicted risks" />
          <div className="space-y-3 mt-1">
            {[['Billing disputes', 'High', 'fail'], ['Long hold times', 'Medium', 'review'], ['Repeat contacts', 'Medium', 'review'], ['Negative sentiment', 'High', 'fail']].map(([l, lvl, st]) => (
              <div key={l} className="flex items-center justify-between"><span className="text-[14px] text-ink">{l}</span><StatusChip status={st}>{lvl}</StatusChip></div>
            ))}
          </div>
        </Card></Reveal>
      </div>
    </div>
  )
}
