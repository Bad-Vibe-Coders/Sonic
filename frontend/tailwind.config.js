/** @type {import('tailwindcss').Config} */
// Semantic tokens resolve to CSS variables (see index.css) so dark mode + tenant
// brand can flip at runtime. Base palette from design.md (Cal.com analysis).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // surfaces
        canvas: v('canvas'),
        surface: v('surface'),
        'surface-soft': v('surface-soft'),
        'surface-card': v('surface-card'),
        'surface-strong': v('surface-strong'),
        elevated: v('elevated'),
        // text
        ink: v('ink'),
        body: v('body'),
        muted: v('muted'),
        'muted-soft': v('muted-soft'),
        // lines
        hairline: v('hairline'),
        'hairline-soft': v('hairline-soft'),
        // brand / action (tenant-swappable)
        primary: v('primary'),
        'primary-soft': v('primary-soft'),
        'on-primary': v('on-primary'),
        // ai accent (the "AI is doing something" signal)
        'ai-from': v('ai-from'),
        'ai-to': v('ai-to'),
        // semantic
        success: v('success'),
        warning: v('warning'),
        error: v('error'),
        info: v('info'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { md: '8px', lg: '12px', xl: '16px' },
      maxWidth: { content: '1200px' },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.05)',
        card: '0 4px 12px rgba(0,0,0,0.08)',
        glow: '0 0 24px -4px rgb(var(--ai-to) / 0.45)',
      },
      keyframes: {
        flow: { '0%': { left: '-15%' }, '100%': { left: '100%' } },
        packet: {
          '0%': { left: '-2%', opacity: 0 },
          '8%': { opacity: 1 }, '92%': { opacity: 1 },
          '100%': { left: '102%', opacity: 0 },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgb(var(--ai-to) / 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgb(var(--ai-to) / 0)' },
        },
      },
      animation: {
        flow: 'flow 3.2s linear infinite',
        packet: 'packet 3.2s linear infinite',
        marquee: 'marquee 28s linear infinite',
        pulseGlow: 'pulseGlow 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
