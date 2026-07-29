import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from './test/utils'
import App from './App'
import { isAuthed, me, getTenantSettings } from './lib/api'
import { isPlatformAuthed, platformMe } from './lib/platformApi'

// Keep every real export (App pulls in screens that import many of them) and
// stub only the two the guard path depends on.
vi.mock('./lib/api', async (importOriginal) => ({
  ...(await importOriginal()),
  isAuthed: vi.fn(),
  me: vi.fn(),
  getTenantSettings: vi.fn(),
}))

// Platform auth is a fully separate module (SON-64) — stubbed independently
// so tenant and platform identity can never accidentally leak into each other
// inside a test the way they would if this shared the mock above.
vi.mock('./lib/platformApi', async (importOriginal) => ({
  ...(await importOriginal()),
  isPlatformAuthed: vi.fn(),
  platformMe: vi.fn(),
}))

// Routes a browser could previously reach just by typing the URL.
const PROTECTED_ROUTES = [
  '/app', '/app/admin', '/app/supervisor', '/app/agent', '/app/conversations',
  '/app/conversations/CV-1', '/app/analytics', '/app/health', '/app/settings',
  '/app/notifications', '/app/billing', '/app/states',
  '/onboarding',
]

const PLATFORM_ROUTES = ['/platform', '/platform/tenants', '/platform/billing', '/platform/health']

const signedInAs = (role) => {
  isAuthed.mockReturnValue(true)
  me.mockResolvedValue({ id: 'u1', tenant_id: 't1', email: 'u@e.com', role })
  getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
}

const signedInAsPlatformAdmin = () => {
  isPlatformAuthed.mockReturnValue(true)
  platformMe.mockResolvedValue({ id: 'p1', email: 'ops@sonic.dev', name: 'Platform Ops' })
}

const onLoginScreen = () => screen.queryByText('Preview branding:') !== null
const onPlatformLoginScreen = () => screen.queryByText('Platform admin sign-in') !== null

describe('App route guarding — unauthenticated', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
    getTenantSettings.mockReset()
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
  })

  it.each(PROTECTED_ROUTES)('redirects %s to /login', (route) => {
    isAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route })

    // Login is identifiable by its tenant-simulation control.
    expect(screen.getByText('Preview branding:')).toBeInTheDocument()
    expect(me).not.toHaveBeenCalled()
  })
})

describe('App route guarding — platform, unauthenticated', () => {
  beforeEach(() => {
    isPlatformAuthed.mockReset()
    platformMe.mockReset()
  })

  it.each(PLATFORM_ROUTES)('redirects %s to /platform/login, never /login', (route) => {
    isPlatformAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route })

    expect(screen.getByText('Platform admin sign-in')).toBeInTheDocument()
    expect(onLoginScreen()).toBe(false)
    expect(platformMe).not.toHaveBeenCalled()
  })
})

describe('App route guarding — role enforcement', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
    getTenantSettings.mockReset()
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
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

  it.each(['agent', 'manager', 'admin'])('a tenant %s (no platform session) is sent to /platform/login, not the dashboard', async (role) => {
    signedInAs(role)
    isPlatformAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route: '/platform/tenants' })

    await waitFor(() => expect(me).toHaveBeenCalled())
    // Being a signed-in tenant admin grants nothing here — there is no
    // platform_admin flag left to spoof or accidentally satisfy (SON-64).
    expect(screen.queryByText('Subdomain, seats, and conversation volume')).not.toBeInTheDocument()
    expect(screen.getByText('Platform admin sign-in')).toBeInTheDocument()
  })
})

describe('App route guarding — platform, authenticated', () => {
  beforeEach(() => {
    isPlatformAuthed.mockReset()
    platformMe.mockReset()
    isAuthed.mockReset()
    me.mockReset()
  })

  it('lets a platform admin into /platform', async () => {
    signedInAsPlatformAdmin()
    renderWithProviders(<App />, { route: '/platform/tenants' })

    expect(await screen.findByText('Subdomain, seats, and conversation volume')).toBeInTheDocument()
  })

  it("a platform session alone never resolves into the tenant app", async () => {
    signedInAsPlatformAdmin()
    isAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route: '/app/admin' })

    // No tenant token at all, so the tenant guard still sends this to /login —
    // a platform session carries no tenant identity to resolve into.
    expect(await screen.findByText('Preview branding:')).toBeInTheDocument()
    expect(me).not.toHaveBeenCalled()
  })
})

describe('App tenant identity', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
    getTenantSettings.mockReset()
  })

  it('shows the real tenant from /settings/tenant, with no way to switch it', async () => {
    signedInAs('admin')
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'NorthBank', timezone: 'UTC' })
    renderWithProviders(<App />, { route: '/app/admin' })

    expect(await screen.findByText('NorthBank')).toBeInTheDocument()
    // The demo simulator must not appear anywhere inside the authenticated app.
    expect(screen.queryByText('Preview branding (demo)')).not.toBeInTheDocument()
    expect(screen.queryByText('Preview branding:')).not.toBeInTheDocument()
  })

  it('labels the manager view "Team" rather than a non-existent supervisor role', async () => {
    signedInAs('manager')
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
    renderWithProviders(<App />, { route: '/app/supervisor' })

    expect(await screen.findByRole('link', { name: /Team/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Supervisor/i })).not.toBeInTheDocument()
  })
})

describe('App public routes', () => {
  beforeEach(() => {
    isAuthed.mockReset()
    me.mockReset()
    getTenantSettings.mockReset()
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
  })

  it.each(['/', '/pricing', '/login', '/signup'])('leaves %s reachable', (route) => {
    isAuthed.mockReturnValue(false)
    const { container } = renderWithProviders(<App />, { route })

    expect(container).not.toBeEmptyDOMElement()
  })
})
