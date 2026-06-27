import { useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Authentic macOS-style window:
 *  - traffic lights reveal ✕ − + glyphs on hover (like real macOS)
 *  - red = close (fades out, offers reopen), yellow = minimize (collapse to titlebar),
 *    green = maximize (expands)
 *  - pointer parallax tilt for a "live", physical feel
 */
export default function MacWindow({ title = 'sonic.ai', children, className = '', tilt = true, glow = false }) {
  const [status, setStatus] = useState('open') // open | min | closed
  const [maxed, setMaxed] = useState(false)
  const ref = useRef(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 15 })

  const onMove = (e) => {
    if (!tilt) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const Light = ({ color, glyph, onClick, label }) => (
    <button onClick={onClick} aria-label={label}
      className="group/light w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform active:scale-90"
      style={{ background: color }}>
      <span className="opacity-0 group-hover/tl:opacity-100 transition text-[9px] font-bold leading-none text-black/55">{glyph}</span>
    </button>
  )

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <AnimatePresence mode="wait">
        {status === 'closed' ? (
          <motion.div key="closed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-hairline bg-surface-card h-48 flex flex-col items-center justify-center gap-3">
            <span className="text-[13px] text-muted">Window closed</span>
            <button onClick={() => setStatus('open')} className="h-9 px-4 rounded-md ai-gradient text-white text-[13px] font-semibold shadow-glow">Reopen window</button>
          </motion.div>
        ) : (
          <motion.div key="win" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
            style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, scale: maxed ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className={`rounded-xl border border-hairline bg-surface shadow-card overflow-hidden ${glow ? 'glow-border' : ''}`}>
            {/* titlebar */}
            <div className="relative z-[1] h-9 bg-surface-soft border-b border-hairline flex items-center px-3">
              <div className="group/tl flex items-center gap-2">
                <Light color="#ff5f57" glyph="✕" label="Close" onClick={() => setStatus('closed')} />
                <Light color="#febc2e" glyph="–" label="Minimize" onClick={() => setStatus(status === 'min' ? 'open' : 'min')} />
                <Light color="#28c840" glyph="+" label="Maximize" onClick={() => setMaxed(m => !m)} />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 text-[12px] text-muted font-mono truncate max-w-[60%]">{title}</span>
            </div>
            {/* body */}
            <AnimatePresence initial={false}>
              {status !== 'min' && (
                <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }} className="relative z-[1]" style={{ transform: 'translateZ(40px)' }}>
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
