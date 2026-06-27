// Living section backgrounds. Blend modes adapt per theme so colour shows on
// BOTH white (multiply) and dark (screen) surfaces — the light-theme fix.

export function Aurora({ variant = 'a', className = '' }) {
  const sets = {
    a: [
      { c: 'drift-a', cls: '-top-32 -left-24 w-[460px] h-[460px]', o: 'opacity-50 dark:opacity-30' },
      { c: 'drift-b', cls: 'top-10 -right-28 w-[400px] h-[400px]', o: 'opacity-40 dark:opacity-20' },
      { c: 'drift-c', cls: 'bottom-0 left-1/3 w-[360px] h-[360px]', o: 'opacity-30 dark:opacity-20' },
    ],
    b: [
      { c: 'drift-b', cls: '-top-24 right-0 w-[420px] h-[420px]', o: 'opacity-40 dark:opacity-25' },
      { c: 'drift-c', cls: 'bottom-0 -left-20 w-[380px] h-[380px]', o: 'opacity-35 dark:opacity-20' },
    ],
    soft: [
      { c: 'drift-c', cls: 'top-0 left-1/2 -translate-x-1/2 w-[640px] h-[320px]', o: 'opacity-30 dark:opacity-20' },
    ],
  }
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none mix-blend-multiply dark:mix-blend-screen ${className}`} aria-hidden>
      {sets[variant].map((b, i) => (
        <div key={i} className={`absolute rounded-full ai-gradient blur-3xl ${b.cls} ${b.o} ${b.c}`} />
      ))}
    </div>
  )
}

export function Particles({ count = 18, className = '' }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    left: (i * 53) % 100,
    size: 3 + (i % 3) * 1.5,
    dur: 9 + (i % 7) * 2,
    delay: -(i % 11) * 1.4,
    op: 0.45 + (i % 4) * 0.15,
  }))
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {dots.map((d, i) => (
        <span key={i} className="particle absolute bottom-0 rounded-full ai-gradient shadow-[0_0_8px_rgb(var(--ai-to)/0.5)]"
          style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`, opacity: d.op }} />
      ))}
    </div>
  )
}

export function Mesh({ className = '' }) {
  return <div className={`absolute inset-0 grid-bg grid-drift pointer-events-none ${className}`} aria-hidden />
}
