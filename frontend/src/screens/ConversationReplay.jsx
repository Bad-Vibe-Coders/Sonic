import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Button, StatusChip, Avatar } from '../components/ui'
import { Ring } from '../components/charts'
import Icon from '../components/Icon'
import { getConversation } from '../lib/api'

const TAG_STYLE = {
  entity: 'bg-info/15 text-info',
  intent: 'bg-ai-to/15 text-ai-to',
  risk: 'bg-error/15 text-error',
}

// Highlight tagged words inline in a transcript line.
function Line({ text, tags }) {
  if (!tags?.length) return <span>{text}</span>
  let parts = [text]
  tags.forEach(({ word, kind }) => {
    parts = parts.flatMap(p => {
      if (typeof p !== 'string') return [p]
      const idx = p.indexOf(word)
      if (idx === -1) return [p]
      return [p.slice(0, idx), <mark key={word} className={`rounded px-1 font-medium ${TAG_STYLE[kind]}`}>{word}</mark>, p.slice(idx + word.length)]
    })
  })
  return <span>{parts}</span>
}

// Map a backend segment onto a transcript line, deriving inline tags from entities/intent.
function segmentToLine(seg) {
  const tags = []
  if (seg.intent) tags.push({ word: seg.text.split(' ').slice(0, 2).join(' '), kind: 'intent' })
  if (Array.isArray(seg.entities)) {
    seg.entities.forEach(e => { if (typeof e === 'string') tags.push({ word: e, kind: 'entity' }) })
  }
  return { t: seg.start, who: seg.speaker, text: seg.text, tags }
}

export default function ConversationReplay() {
  const { id } = useParams()
  const [conv, setConv] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getConversation(id)
      .then(data => { if (!cancelled) { setConv(data); setError(null) } })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const transcript = useMemo(() => (conv?.segments || []).map(segmentToLine), [conv])
  const D = conv?.duration_seconds || (transcript.length ? transcript[transcript.length - 1].t + 8 : 0)

  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showSummary, setShowSummary] = useState(true)
  const raf = useRef(0)
  const last = useRef(0)
  const scrollRef = useRef(null)

  // playback loop
  useEffect(() => {
    if (!playing || !D) return
    last.current = performance.now()
    const loop = (now) => {
      const dt = (now - last.current) / 1000
      last.current = now
      setT(prev => {
        const n = prev + dt
        if (n >= D) { setPlaying(false); return D }
        return n
      })
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, D])

  const activeIdx = useMemo(() => {
    let idx = 0
    transcript.forEach((l, i) => { if (t >= l.t) idx = i })
    return idx
  }, [t, transcript])

  // auto-scroll transcript to active line
  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-line="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeIdx])

  const pct = D ? (t / D) * 100 : 0
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  // emotion path, built from real segment emotion confidence (falls back flat if absent)
  const emotionPts = useMemo(() => {
    const segs = conv?.segments || []
    if (!segs.length || !D) return []
    return segs.map(s => {
      const v = s.emotion?.label === 'positive' ? 70 + (s.emotion.confidence || 0) * 30
        : s.emotion?.label === 'negative' ? 30 - (s.emotion.confidence || 0) * 30
        : 50
      return [(s.start / D) * 600, 70 - (v / 100) * 60]
    })
  }, [conv, D])
  const path = emotionPts.length ? emotionPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') : ''

  const seek = (e) => {
    if (!D) return
    const r = e.currentTarget.getBoundingClientRect()
    setT(Math.max(0, Math.min(D, ((e.clientX - r.left) / r.width) * D)))
  }

  if (loading) {
    return <div className="py-24 text-center text-muted"><Icon name="Loader" size={24} className="mx-auto mb-3 animate-spin" />Loading conversation…</div>
  }
  if (error || !conv) {
    return (
      <div className="py-24 text-center text-muted">
        <Icon name="AlertCircle" size={24} className="mx-auto mb-3" />
        <p>{error || 'Conversation not found.'}</p>
        <Button as={Link} to="/app/conversations" variant="ghost" size="sm" className="mt-4"><Icon name="ArrowLeft" size={16} /> Back to conversations</Button>
      </div>
    )
  }

  const qaFindings = conv.qa_result?.findings || []
  const qaScore = conv.qa_result?.score != null ? Math.round(conv.qa_result.score * 100) : null
  const churnRisk = conv.prediction?.churn_risk != null ? Math.round(conv.prediction.churn_risk * 100) : null
  const escalationRisk = conv.prediction?.escalation_risk != null ? Math.round(conv.prediction.escalation_risk * 100) : null
  const speakers = [...new Set((conv.segments || []).map(s => s.speaker))]

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button as={Link} to="/app/conversations" variant="ghost" size="sm"><Icon name="ArrowLeft" size={16} /> Back</Button>
        <div className="flex items-center gap-3">
          <Avatar name={conv.title} size={38} />
          <div><h1 className="text-[18px] font-semibold text-ink leading-tight">{conv.title}</h1><p className="text-[13px] text-muted">{speakers.join(' ↔ ') || conv.id} · {conv.id}</p></div>
        </div>
        <div className="flex-1" />
        {conv.qa_result && <StatusChip status={conv.qa_result.passed ? 'pass' : 'fail'}>{qaFindings.filter(f => !f.passed).length} compliance flag{qaFindings.filter(f => !f.passed).length === 1 ? '' : 's'}</StatusChip>}
        <Button variant="ai" size="sm"><Icon name="Flag" size={14} /> Escalate</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* LEFT: transcript + player (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* player */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <button onClick={() => { if (t >= D) setT(0); setPlaying(p => !p) }} disabled={!D} className="w-12 h-12 rounded-full ai-gradient text-white flex items-center justify-center shadow-glow shrink-0 disabled:opacity-40">
                <Icon name={playing ? 'Pause' : 'Play'} size={22} />
              </button>
              <div className="flex-1">
                <div className="flex justify-between text-[12px] text-muted font-mono mb-1.5"><span>{fmt(t)}</span><span>{fmt(D)}</span></div>
                <div onClick={seek} className="group relative h-2.5 rounded-full bg-surface-strong cursor-pointer">
                  <div className="absolute inset-y-0 left-0 rounded-full ai-gradient" style={{ width: `${pct}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-ai-to shadow" style={{ left: `${pct}%` }} />
                </div>
              </div>
              <button className="w-9 h-9 rounded-md border border-hairline text-body flex items-center justify-center hover:bg-surface-soft shrink-0"><Icon name="Volume2" size={16} /></button>
            </div>
          </Card>

          {/* emotion timeline (shares the same playhead) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-semibold text-ink flex items-center gap-2"><Icon name="Activity" size={15} /> Emotion timeline</span><span className="text-[12px] text-muted">sentiment over call</span></div>
            {path ? (
              <div className="relative">
                <svg viewBox="0 0 600 80" preserveAspectRatio="none" className="w-full h-20">
                  <defs><linearGradient id="emo" x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--ai-from))" /><stop offset="1" stopColor="rgb(var(--ai-to))" /></linearGradient></defs>
                  <path d={`${path} L600,80 L0,80 Z`} fill="rgb(var(--ai-to))" opacity="0.10" />
                  <path d={path} fill="none" stroke="url(#emo)" strokeWidth="2.5" />
                </svg>
                <div className="absolute top-0 bottom-0 w-0.5 bg-ai-to pointer-events-none" style={{ left: `${pct}%` }}>
                  <span className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-ai-to" />
                </div>
              </div>
            ) : <p className="text-[13px] text-muted py-6 text-center">No emotion data for this conversation yet.</p>}
          </Card>

          {/* diarized transcript */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-ink">Diarized transcript</span>
              <div className="flex gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> entity</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ai-to" /> intent</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> risk</span>
              </div>
            </div>
            {transcript.length ? (
              <div ref={scrollRef} className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                {transcript.map((l, i) => {
                  const active = i === activeIdx
                  const speakerIdx = speakers.indexOf(l.who)
                  return (
                    <button key={i} data-line={i} onClick={() => setT(l.t)}
                      className={`w-full text-left flex gap-3 p-2.5 rounded-lg transition ${active ? 'bg-surface-soft ring-1 ring-ai-to/40' : 'hover:bg-surface-soft'}`}>
                      <span className="text-[11px] font-mono text-muted pt-0.5 w-9 shrink-0">{fmt(l.t)}</span>
                      <span className={`w-1 rounded-full shrink-0 ${speakerIdx === 0 ? 'bg-info' : 'bg-warning'}`} />
                      <span className="min-w-0">
                        <span className={`block text-[12px] font-semibold mb-0.5 ${speakerIdx === 0 ? 'text-info' : 'text-warning'}`}>{l.who}</span>
                        <span className={`block text-[14px] ${active ? 'text-ink' : 'text-body'}`}><Line text={l.text} tags={l.tags} /></span>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : <p className="text-[13px] text-muted py-6 text-center">Transcript not available yet — this conversation may still be processing.</p>}
          </Card>
        </div>

        {/* RIGHT: AI panels */}
        <div className="space-y-5">
          {/* prediction */}
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full ai-gradient" /> Prediction</div>
            {conv.prediction ? (
              <>
                <div className="flex items-center justify-around">
                  <Ring value={churnRisk} label="churn risk" />
                  <Ring value={escalationRisk} label="escalation" />
                </div>
                {churnRisk >= 60 && <div className="mt-4 rounded-lg bg-error/10 text-error text-[13px] p-3 flex gap-2"><Icon name="AlertTriangle" size={16} className="shrink-0 mt-0.5" /> High churn likelihood — recommend supervisor callback.</div>}
              </>
            ) : <p className="text-[13px] text-muted text-center py-4">Prediction not available yet.</p>}
          </Card>

          {/* LLM summary (collapsible) */}
          <Card className="p-5">
            <button onClick={() => setShowSummary(s => !s)} className="w-full flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink flex items-center gap-2"><span className="w-5 h-5 rounded ai-gradient text-white inline-flex items-center justify-center"><Icon name="Sparkles" size={12} /></span> AI summary</span>
              <Icon name={showSummary ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted" />
            </button>
            {showSummary && (
              conv.llm_summary
                ? <p className="text-[14px] text-body mt-3 leading-relaxed">{typeof conv.llm_summary === 'string' ? conv.llm_summary : conv.llm_summary.text || JSON.stringify(conv.llm_summary)}</p>
                : <p className="text-[13px] text-muted mt-3">LLM summary not available for this conversation.</p>
            )}
          </Card>

          {/* QA checklist */}
          <Card className="p-5">
            <div className="text-[13px] font-semibold text-ink mb-3 flex items-center gap-2"><Icon name="ShieldCheck" size={15} /> QA / Compliance</div>
            {qaFindings.length ? (
              <div className="space-y-2">
                {qaFindings.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="flex items-center gap-2 text-body">
                      <Icon name={c.passed ? 'CheckCircle2' : 'XCircle'} size={16} className={c.passed ? 'text-success' : 'text-error'} />
                      {c.rule}
                    </span>
                    {!c.passed && <button className="text-[11px] text-ai-to font-medium">Annotate</button>}
                  </div>
                ))}
              </div>
            ) : <p className="text-[13px] text-muted py-2">QA results not available yet.</p>}
            {qaScore != null && <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between"><span className="text-[13px] text-muted">Overall score</span><span className={`display d-sm ${qaScore >= 80 ? 'text-success' : qaScore >= 50 ? 'text-warning' : 'text-error'}`}>{qaScore}%</span></div>}
          </Card>
        </div>
      </div>
    </div>
  )
}
