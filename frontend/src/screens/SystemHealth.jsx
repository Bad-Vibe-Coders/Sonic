import { useEffect, useState } from 'react'
import { Card, SectionTitle, StatusChip, Reveal } from '../components/ui'
import { AreaChart } from '../components/charts'
import Pipeline from '../components/Pipeline'
import { HEALTH } from '../lib/data'
import { pipelineHealth } from '../lib/api'
import Icon from '../components/Icon'

// Frontend pipeline card id → backend stage key in /health/pipeline.
const STAGE_KEY = { audio: 'audio', asr: 'asr', diar: 'diarization', emotion: 'emotion', nlp: 'nlp', llm: 'llm', qa: 'qa', predict: 'prediction', analytics: 'analytics', dash: 'indexing' }

function stateOf(stage) {
  if (!stage || !stage.enabled) return 'idle'
  // Enabled but missing a core dependency → degraded (falls back to stub).
  const deps = Object.entries(stage).filter(([k, v]) => typeof v === 'boolean' && k !== 'enabled')
  return deps.length && deps.every(([, v]) => v === false) ? 'degraded' : 'healthy'
}

export default function SystemHealth() {
  const [health, setHealth] = useState(HEALTH)

  useEffect(() => {
    pipelineHealth()
      .then(data => setHealth(HEALTH.map(s => ({ ...s, state: stateOf(data.stages[STAGE_KEY[s.id]]) }))))
      .catch(() => {}) // backend unreachable — keep demo data
  }, [])

  const counts = health.reduce((a, s) => (a[s.state] = (a[s.state] || 0) + 1, a), {})
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><h1 className="display d-lg text-ink">System health</h1><p className="text-muted mt-1">Live status of every AI pipeline stage.</p></div>
        <div className="flex gap-2">
          <StatusChip status="healthy">{counts.healthy || 0} healthy</StatusChip>
          <StatusChip status="degraded">{counts.degraded || 0} degraded</StatusChip>
          <StatusChip status="idle">{counts.idle || 0} idle</StatusChip>
        </div>
      </div>

      <Reveal><Card className="p-8"><SectionTitle title="Pipeline flow" sub="Data moving through the stack in real time" /><Pipeline /></Card></Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {health.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2.5">
                  <span className={`w-9 h-9 rounded-md flex items-center justify-center ${s.ai ? 'ai-gradient text-white' : 'bg-surface-card text-ink'}`}><Icon name={s.icon} size={18} /></span>
                  <span className="text-[14px] font-semibold text-ink">{s.label}</span>
                </span>
                <StatusChip status={s.state} />
              </div>
              <AreaChart data={Array.from({ length: 12 }, (_, k) => 30 + Math.round(Math.abs(Math.sin(i + k)) * 60))} height={50} />
              <div className="flex justify-between text-[12px] text-muted mt-3"><span>Latency <span className="text-ink font-medium">{s.latency}ms</span></span><span>Throughput <span className="text-ink font-medium">{s.throughput}/s</span></span></div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
