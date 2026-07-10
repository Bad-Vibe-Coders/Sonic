import { useEffect, useRef, useState } from 'react'

const uid = () => Math.random().toString(36).slice(2, 8)

function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.3 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, seen]
}

/* Area / line chart with gradient fill + draw-in */
export function AreaChart({ data, height = 90, stroke = 'ai', className = '' }) {
  const [ref, seen] = useInView()
  const id = useRef(uid()).current
  const w = 600
  if (!data?.length) data = [0, 0]
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, height - 8 - ((d - min) / (max - min || 1)) * (height - 16)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${height} L0,${height} Z`
  const strokeUrl = stroke === 'ai' ? `url(#s${id})` : stroke
  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={`spark w-full ${seen ? 'in' : ''} ${className}`} style={{ height }}>
      <defs>
        <linearGradient id={`s${id}`} x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--ai-from))" /><stop offset="1" stopColor="rgb(var(--ai-to))" /></linearGradient>
        <linearGradient id={`f${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgb(var(--ai-to))" stopOpacity="0.18" /><stop offset="1" stopColor="rgb(var(--ai-to))" stopOpacity="0" /></linearGradient>
      </defs>
      <path d={area} fill={`url(#f${id})`} stroke="none" style={{ opacity: seen ? 1 : 0, transition: 'opacity .8s ease .3s' }} />
      <path d={line} fill="none" stroke={strokeUrl} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Vertical bars with hover tooltip */
export function BarChart({ data, height = 120, labels = [], format = (v) => Math.round(v).toLocaleString('en-US') }) {
  const [ref, seen] = useInView()
  const [hover, setHover] = useState(null)
  if (!data?.length) data = labels.length ? labels.map(() => 0) : [0]
  const max = Math.max(...data) || 1
  return (
    <div ref={ref} className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group relative flex-1 flex flex-col items-center justify-end gap-1.5 h-full"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          {/* tooltip */}
          <div className={`absolute -top-1 z-10 pointer-events-none transition-all duration-150 ${hover === i ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'}`}>
            <div className="rounded-md bg-ink text-canvas text-[12px] font-semibold px-2.5 py-1 shadow-card whitespace-nowrap">
              {format(d)}{labels[i] ? <span className="font-normal text-canvas/60"> · {labels[i]}</span> : null}
            </div>
            <div className="w-2 h-2 bg-ink rotate-45 mx-auto -mt-1" />
          </div>
          <div className={`w-full rounded-md ai-gradient transition-all ${hover === i ? 'brightness-110 saturate-150' : ''} ${hover !== null && hover !== i ? 'opacity-50' : ''}`}
            style={{ height: seen ? `${(d / max) * (height - 22)}px` : 0, transitionProperty: 'height, opacity, filter', transitionDuration: '.8s', transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)', transitionDelay: seen ? `${i * 0.05}s` : '0s' }} />
          {labels[i] && <span className="text-[10px] text-muted">{labels[i]}</span>}
        </div>
      ))}
    </div>
  )
}

/* Donut / confidence ring */
export function Ring({ value, size = 96, label, color = 'ai' }) {
  const [ref, seen] = useInView()
  const id = useRef(uid()).current
  const r = (size - 12) / 2, c = 2 * Math.PI * r
  const stroke = color === 'ai' ? `url(#r${id})` : color
  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs><linearGradient id={`r${id}`} x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--ai-from))" /><stop offset="1" stopColor="rgb(var(--ai-to))" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--surface-strong))" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={seen ? c * (1 - value / 100) : c} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="display d-sm text-ink leading-none">{value}<span className="text-[14px]">%</span></div>
        {label && <div className="text-[10px] text-muted mt-0.5">{label}</div>}
      </div>
    </div>
  )
}
