import { PIPELINE } from '../lib/data'
import Icon from './Icon'

// Animated horizontal pipeline: flowing pulse + data packets travel left->right.
export default function Pipeline({ compact = false }) {
  return (
    <div className="relative">
      {/* wire */}
      <div className="absolute left-0 right-0 top-[26px] h-0.5 bg-hairline overflow-visible">
        <div className="pipe-flow animate-flow" />
        {[0, 1.1, 2.2].map((d, i) => (
          <span key={i} className="pipe-packet animate-packet" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
      <div className={`relative grid grid-cols-5 lg:grid-cols-10 gap-y-7 gap-x-1`}>
        {PIPELINE.map((s) => (
          <div key={s.id} className="group flex flex-col items-center text-center gap-2">
            <div className={`w-[52px] h-[52px] rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1
              ${s.ai ? 'ai-gradient text-white shadow-glow' : 'bg-surface border border-hairline text-ink shadow-soft'}`}>
              <Icon name={s.icon} size={20} />
            </div>
            <span className="text-[12px] font-semibold text-ink leading-tight">{s.label}</span>
            {!compact && <span className="text-[11px] text-muted leading-tight hidden lg:block">{s.desc}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
