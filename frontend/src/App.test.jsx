import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from './test/utils'
import App from './App'
import { isAuthed, me } from './lib/api'

// Keep every real export (App pulls in screens that import many of them) and
// stub only the two the guard path depends on.
vi.mock('./lib/api', async (importOriginal) => ({
  ...(await importOriginal()),
  isAuthed: vi.fn(),
  me: vi.fn(),
}))

// Routes a browser could previously reach just by typing the URL.
const PROTECTED_ROUTES = [
  '/app', '/app/admin', '/app/supervisor', '/app/agent', '/app/conversations',
  '/app/conversations/CV-1', '/app/analytics', '/app/health', '/app/settings',
  '/app/notifications', '/app/billing', '/app/states',
  '/platform', '/platform/tenants', '/platform/billing', '/platform/health',
  '/onboarding',
]

const signedInAs = (role, platform_admin = false) => {
  isAuthed.mockReturnValue(true)
  me.mockResolvedValue({ id: 'u1', tenant_id: 't1', email: 'u@e.com', role, platform_admin })
}

const onLoginScreen = () => screen.queryByText('Simulate tenant:') !== null

describe('App route guarding — unauthenticated', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
  })

  it.each(PROTECTED_ROUTES)('redirects %s to /login', (route) => {
    isAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route })

    // Login is identifiable by its tenant-simulation control.
    expect(screen.getByText('Simulate tenant:')).toBeInTheDocument()
    expect(me).not.toHaveBeenCalled()
  })
})

describe('App route guarding — role enforcement', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
  })

  // Admin-only screens, identified by copy unique to each, paired with the
  // home screen the guard should divert each role to instead.
  const HOME_MARKER = { agent: 'Your calls and quality score.', manager: 'Team overview' }
  it.each([
    ['/app/settings', 'agent', 'Configure'],
    ['/app/settings', 'manager', 'Configure'],
    ['/app/billing', 'agent', 'Manage your subscription and usage.'],
    ['/app/health', 'agent', 'Live status of every AI pipeline stage.'],
    ['/app/health', 'manager', 'Live status of every AI pipeline stage.'],
    ['/app/admin', 'agent', 'Good morning, Operator'],
    ['/app/admin', 'manager', 'Good morning, Operator'],
  ])('keeps %s away from a %s', async (route, role, marker) => {
    signedInAs(role)
    renderWithProviders(<App />, { route })

    // Diverted to their own home instead...
    expect(await screen.findByText(HOME_MARKER[role], { exact: false })).toBeInTheDocument()
    // ...never onto the admin screen, and never to login (they ARE signed in).
    expect(screen.queryByText(marker, { exact: false })).not.toBeInTheDocument()
    expect(onLoginScreen()).toBe(false)
  })

  it('still lets an admin reach an admin-only route', async () => {
    signedInAs('admin')
    renderWithProviders(<App />, { route: '/app/billing' })

    // The admin-only nav entries only render for the real admin role, which also
    // proves the sidebar is driven by /auth/me rather than a client-side toggle.
    expect(await screen.findByRole('link', { name: /Settings/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /System Health/i })).toBeInTheDocument()
    // Not diverted to anyone else's home, and not sent to login.
    expect(screen.queryByText('Your calls and quality score.')).not.toBeInTheDocument()
    expect(screen.queryByText('Team overview')).not.toBeInTheDocument()
    expect(onLoginScreen()).toBe(false)
  })

  it('lets a manager into billing, matching SON-52 backend RBAC', async () => {
    signedInAs('manager')
    renderWithProviders(<App />, { route: '/app/billing' })

    // Not diverted to the manager home — the route is permitted for them.
    await waitFor(() => expect(me).toHaveBeenCalled())
    expect(screen.queryByText('Team overview')).not.toBeInTheDocument()
    expect(onLoginScreen()).toBe(false)
  })

  it('hides admin-only and platform nav entries from an agent', async () => {
    signedInAs('agent')
    renderWithProviders(<App />, { route: '/app/agent' })

    expect(await screen.findByRole('link', { name: /My Calls/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /System Health/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Settings/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Platform Admin/i })).not.toBeInTheDocument()
  })

  it.each(['agent', 'manager'])('blocks %s from the platform area', async (role) => {
    signedInAs(role)
    renderWithProviders(<App />, { route: '/platform/tenants' })

    await waitFor(() => expect(me).toHaveBeenCalled())
    // The tenant table heading only renders on the real platform screen.
    expect(screen.queryByText('Subdomain, seats, and conversation volume')).not.toBeInTheDocument()
  })

  it('blocks a tenant admin who is not a platform admin from /platform', async () => {
    signedInAs('admin', false)
    renderWithProviders(<App />, { route: '/platform/tenants' })

    await waitFor(() => expect(me).toHaveBeenCalled())
    expect(screen.queryByText('Subdomain, seats, and conversation volume')).not.toBeInTheDocument()
  })

  it('lets a platform admin into /platform', async () => {
    signedInAs('admin', true)
    renderWithProviders(<App />, { route: '/platform/tenants' })

    expect(await screen.findByText('Subdomain, seats, and conversation volume')).toBeInTheDocument()
  })
})

describe('App public routes', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
  })

  it.each(['/', '/pricing', '/login', '/signup'])('leaves %s reachable', (route) => {
    isAuthed.mockReturnValue(false)
    const { container } = renderWithProviders(<App />, { route })

    expect(container).not.toBeEmptyDOMElement()
  })
})
