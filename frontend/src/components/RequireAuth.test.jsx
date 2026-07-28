import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Routes, Route, useLocation } from 'react-router-dom'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import RequireAuth from './RequireAuth'
import { isAuthed } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { ADMIN_ONLY, MANAGEMENT } from '../lib/roles'

vi.mock('../lib/api', () => ({
  isAuthed: vi.fn(),
}))

// The provider's own fetch behaviour is covered in AuthContext.test.jsx; here we
// drive identity directly so each guard case is deterministic.
vi.mock('../lib/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function signedIn({ role = 'admin', platformAdmin = false } = {}) {
  isAuthed.mockReturnValue(true)
  useAuth.mockReturnValue({ role, platformAdmin, loading: false, user: { role } })
}

function signedOut() {
  isAuthed.mockReturnValue(false)
  useAuth.mockReturnValue({ role: null, platformAdmin: false, loading: false, user: null })
}

function LoginProbe({ onLocation }) {
  onLocation(useLocation())
  return <div>login screen</div>
}

function renderTree(route, { onLocation = () => {}, guard = <RequireAuth /> } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginProbe onLocation={onLocation} />} />
      {/* landing spots the guard can bounce an unauthorized user to */}
      <Route path="/app/admin" element={<div>admin home</div>} />
      <Route path="/app/supervisor" element={<div>supervisor home</div>} />
      <Route path="/app/agent" element={<div>agent home</div>} />
      <Route element={guard}>
        <Route path="/app/billing" element={<div>billing screen</div>} />
        <Route path="/app/conversations" element={<div>conversations screen</div>} />
        <Route path="/platform" element={<div>platform screen</div>} />
      </Route>
    </Routes>,
    { route }
  )
}

describe('RequireAuth — authentication', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    useAuth.mockReset()
  })

  it('renders the protected route when authenticated', () => {
    signedIn()
    renderTree('/app/billing')

    expect(screen.getByText('billing screen')).toBeInTheDocument()
    expect(screen.queryByText('login screen')).not.toBeInTheDocument()
  })

  it('redirects to /login when there is no token', () => {
    signedOut()
    renderTree('/app/billing')

    expect(screen.getByText('login screen')).toBeInTheDocument()
    expect(screen.queryByText('billing screen')).not.toBeInTheDocument()
  })

  it('passes the attempted location (with query) to /login', () => {
    signedOut()
    let seen
    renderTree('/app/conversations?page=2', { onLocation: (l) => { seen = l } })

    expect(seen.state.from).toBe('/app/conversations?page=2')
  })

  it('renders nothing while identity is still resolving', () => {
    isAuthed.mockReturnValue(true)
    useAuth.mockReturnValue({ role: null, platformAdmin: false, loading: true, user: null })
    renderTree('/app/billing')

    // Crucially not the protected screen, and not a premature redirect either.
    expect(screen.queryByText('billing screen')).not.toBeInTheDocument()
    expect(screen.queryByText('login screen')).not.toBeInTheDocument()
  })

  it('redirects to /login when a token exists but /auth/me rejected it', () => {
    isAuthed.mockReturnValue(true)
    useAuth.mockReturnValue({ role: null, platformAdmin: false, loading: false, user: null })
    renderTree('/app/billing')

    expect(screen.getByText('login screen')).toBeInTheDocument()
    expect(screen.queryByText('billing screen')).not.toBeInTheDocument()
  })

  it('renders children instead of an Outlet when given them', () => {
    signedIn()
    renderWithProviders(<RequireAuth><div>wrapped child</div></RequireAuth>, { route: '/app/admin' })

    expect(screen.getByText('wrapped child')).toBeInTheDocument()
  })
})

describe('RequireAuth — role gating', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    useAuth.mockReset()
  })

  it('allows a role that is on the list', () => {
    signedIn({ role: 'admin' })
    renderTree('/app/billing', { guard: <RequireAuth roles={ADMIN_ONLY} /> })

    expect(screen.getByText('billing screen')).toBeInTheDocument()
  })

  it.each([
    ['agent', 'agent home'],
    ['manager', 'supervisor home'],
  ])('sends %s away from an admin-only route to their own home', (role, home) => {
    signedIn({ role })
    renderTree('/app/billing', { guard: <RequireAuth roles={ADMIN_ONLY} /> })

    expect(screen.queryByText('billing screen')).not.toBeInTheDocument()
    expect(screen.getByText(home)).toBeInTheDocument()
  })

  it('does not send an unauthorized user to /login — they are signed in', () => {
    signedIn({ role: 'agent' })
    renderTree('/app/billing', { guard: <RequireAuth roles={ADMIN_ONLY} /> })

    expect(screen.queryByText('login screen')).not.toBeInTheDocument()
  })

  it('lets a manager through a management route', () => {
    signedIn({ role: 'manager' })
    renderTree('/app/billing', { guard: <RequireAuth roles={MANAGEMENT} /> })

    expect(screen.getByText('billing screen')).toBeInTheDocument()
  })

  it('shows a no-access message instead of looping when the fallback is the current route', () => {
    // An unrecognised role resolves home to /app/agent; asking for /app/agent
    // itself must not redirect to /app/agent forever.
    signedIn({ role: 'future-role' })
    renderWithProviders(
      <Routes>
        <Route element={<RequireAuth roles={ADMIN_ONLY} />}>
          <Route path="/app/agent" element={<div>agent screen</div>} />
        </Route>
      </Routes>,
      { route: '/app/agent' }
    )

    expect(screen.getByText(/don’t have access/i)).toBeInTheDocument()
    expect(screen.queryByText('agent screen')).not.toBeInTheDocument()
  })
})

describe('RequireAuth — platform admin gating', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    useAuth.mockReset()
  })

  it('allows a platform admin', () => {
    signedIn({ role: 'admin', platformAdmin: true })
    renderTree('/platform', { guard: <RequireAuth platformAdmin /> })

    expect(screen.getByText('platform screen')).toBeInTheDocument()
  })

  it('blocks a tenant admin who is not a platform admin', () => {
    signedIn({ role: 'admin', platformAdmin: false })
    renderTree('/platform', { guard: <RequireAuth platformAdmin /> })

    expect(screen.queryByText('platform screen')).not.toBeInTheDocument()
    expect(screen.getByText('admin home')).toBeInTheDocument()
  })

  it('blocks an agent from the platform area', () => {
    signedIn({ role: 'agent', platformAdmin: false })
    renderTree('/platform', { guard: <RequireAuth platformAdmin /> })

    expect(screen.queryByText('platform screen')).not.toBeInTheDocument()
    expect(screen.getByText('agent home')).toBeInTheDocument()
  })
})
