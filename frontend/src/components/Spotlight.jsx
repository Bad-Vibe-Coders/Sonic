import { useEffect, useRef } from 'react'

// Global cursor-follow spotlight. Fixed, viewport-wide, pointer-events-none.
// Screen-blend so it reads as a soft glow on dark AND light themes.
export default function Spotlight() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    let raf = 0
    const move = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--sx', `${e.clientX}px`)
        el.style.setProperty('--sy', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={ref} aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
      style={{
        background: 'radial-gradient(240px circle at var(--sx, 50%) var(--sy, 30%), rgb(var(--ai-to) / 0.084), rgb(var(--ai-from) / 0.036) 45%, transparent 70%)',
      }} />
  )
}
