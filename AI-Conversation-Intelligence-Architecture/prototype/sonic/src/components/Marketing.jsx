import { Link, NavLink } from 'react-router-dom'
import { Button } from './ui'
import Logo from './Logo'
import { Aurora, Mesh } from './Backdrop'
import { ThemeToggle } from '../layouts/Controls'

const LINKS = [
  { to: '/product', label: 'Platform' },
  { to: '/pipeline', label: 'AI Pipeline' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/enterprise', label: 'Enterprise' },
]

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-canvas/90 backdrop-blur border-b border-hairline-soft">
      <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={30} />
          <span className="display text-ink text-[18px]">Sonic</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `transition ${isActive ? 'text-ink' : 'text-body hover:text-ink'}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:inline text-[14px] font-semibold text-ink">Sign in</Link>
          <Button as={Link} to="/signup" size="md">Start free</Button>
        </div>
      </div>
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="bg-[#101010] text-[#a1a1aa]">
      <div className="max-w-content mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3"><Logo size={26} /><span className="display text-white text-[16px]">Sonic</span></div>
          <p className="text-[13px]">Conversation intelligence for the modern contact center.</p>
        </div>
        {[['Product', ['Pipeline', 'Analytics', 'Compliance', 'Predictions']], ['Solutions', ['Healthcare', 'Financial', 'Telecom', 'Retail']], ['Company', ['About', 'Security', 'Careers', 'Contact']], ['Resources', ['Docs', 'API', 'Status', 'Changelog']]].map(([h, items]) => (
          <div key={h}><div className="text-white font-semibold text-[14px] mb-3">{h}</div><ul className="space-y-2 text-[14px]">{items.map(x => <li key={x}>{x}</li>)}</ul></div>
        ))}
      </div>
      <div className="border-t border-[#1a1a1a]"><div className="max-w-content mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-[#71717a]">
        <span>© 2026 Sonic AI, Inc.</span><span className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">DPA</a></span>
      </div></div>
    </footer>
  )
}

// Shared wrapper for marketing sub-pages — carries the landing's living backdrop
export function MarketingPage({ children }) {
  return (
    <div className="text-body min-h-screen flex flex-col relative overflow-hidden">
      {/* living backdrop behind everything (sections sit on top via z) */}
      <div className="absolute inset-x-0 top-0 h-[640px] pointer-events-none">
        <Mesh />
        <Aurora variant="a" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <MarketingNav />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  )
}
