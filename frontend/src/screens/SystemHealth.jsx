import { useEffect, useState } from 'react'
import { Card, SectionTitle, StatusChip, Reveal } from '../components/ui'
import Pipeline from '../components/Pipeline'
import { PIPELINE } from '../lib/pipeline'
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
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    pipelineHealth()
      .then(data => { setHealth(PIPELINE.map(s => ({ ...s, state: stateOf(data.stages[STAGE_KEY[s.id]]), detail: data.stages[STAGE_KEY[s.id]] }))); setError(null) })
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return <div className="py-24 text-center text-muted"><Icon name="AlertCircle" size={24} className="mx-auto mb-3" />{error}</div>
  }
  if (!health) {
    return <div className="py-24 text-center text-muted"><Icon name="Loader" size={24} className="mx-auto mb-3 animate-spin" />Loading pipeline health…</div>
  }

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
              <p className="text-[12px] text-muted">
                {s.detail?.backend && <>backend: <span className="text-ink">{s.detail.backend}</span></>}
                {s.detail?.provider && <>provider: <span className="text-ink">{s.detail.provider}</span>{s.detail.model && <> · {s.detail.model}</>}</>}
                {!s.detail?.backend && !s.detail?.provider && (s.detail?.enabled ? 'enabled' : 'disabled')}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
