import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import { AuthProvider, useAuth } from './AuthContext'
import { me, isAuthed, clearTokens, getTenantSettings } from './api'

vi.mock('./api', () => ({
  me: vi.fn(),
  isAuthed: vi.fn(),
  clearTokens: vi.fn(),
  getTenantSettings: vi.fn(),
}))

function Probe() {
  const { role, platformAdmin, loading, tenantName } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="role">{String(role)}</span>
      <span data-testid="platformAdmin">{String(platformAdmin)}</span>
      <span data-testid="tenantName">{String(tenantName)}</span>
    </div>
  )
}

const renderProvider = () =>
  renderWithProviders(<AuthProvider><Probe /></AuthProvider>)

describe('AuthProvider', () => {
  beforeEach(() => {
    me.mockReset()
    isAuthed.mockReset()
    clearTokens.mockReset()
    getTenantSettings.mockReset()
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
  })

  it('does not call /auth/me when there is no token', () => {
    isAuthed.mockReturnValue(false)
    renderProvider()

    expect(me).not.toHaveBeenCalled()
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('role')).toHaveTextContent('null')
  })

  it('exposes the server-verified role and platform_admin flag', async () => {
    isAuthed.mockReturnValue(true)
    me.mockResolvedValueOnce({ id: 'u1', role: 'manager', platform_admin: true })
    renderProvider()

    // Starts in a loading state so guards do not decide too early.
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('manager'))
    expect(screen.getByTestId('platformAdmin')).toHaveTextContent('true')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('defaults platform_admin to false when the field is absent', async () => {
    isAuthed.mockReturnValue(true)
    me.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('admin'))
    expect(screen.getByTestId('platformAdmin')).toHaveTextContent('false')
  })

  it('clears a rejected token so the app cannot sit half-authenticated', async () => {
    isAuthed.mockReturnValue(true)
    const err = new Error('Unauthorized')
    err.status = 401
    me.mockRejectedValueOnce(err)
    renderProvider()

    await waitFor(() => expect(clearTokens).toHaveBeenCalled())
    expect(screen.getByTestId('role')).toHaveTextContent('null')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('keeps the token on a non-401 failure but still resolves', async () => {
    isAuthed.mockReturnValue(true)
    me.mockRejectedValueOnce(new Error('Network down'))
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(clearTokens).not.toHaveBeenCalled()
    expect(screen.getByTestId('role')).toHaveTextContent('null')
  })

  it('exposes the real tenant name from /settings/tenant', async () => {
    isAuthed.mockReturnValue(true)
    me.mockResolvedValueOnce({ id: 'u1', role: 'agent' })
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('tenantName')).toHaveTextContent('Helix Health'))
  })

  it('does not fetch the tenant when signed out', () => {
    isAuthed.mockReturnValue(false)
    renderProvider()

    expect(getTenantSettings).not.toHaveBeenCalled()
    expect(screen.getByTestId('tenantName')).toHaveTextContent('null')
  })

  it('keeps the session usable when the tenant lookup fails', async () => {
    isAuthed.mockReturnValue(true)
    me.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    getTenantSettings.mockRejectedValueOnce(new Error('boom'))
    renderProvider()

    // Role still resolves; only the cosmetic name is missing.
    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('admin'))
    expect(screen.getByTestId('tenantName')).toHaveTextContent('null')
    expect(clearTokens).not.toHaveBeenCalled()
  })

  it('re-resolves identity on refresh() after a sign-in', async () => {
    // Regression guard: the provider mounts while signed out, so if refresh()
    // did not re-run the lookup the guards would keep seeing no role and bounce
    // the user straight back to /login after a successful login (SON-54).
    isAuthed.mockReturnValue(false)
    let ctx
    function Grab() {
      ctx = useAuth()
      return <Probe />
    }
    renderWithProviders(<AuthProvider><Grab /></AuthProvider>)

    expect(screen.getByTestId('role')).toHaveTextContent('null')

    // Simulate login(): a token now exists and /auth/me answers.
    isAuthed.mockReturnValue(true)
    me.mockResolvedValueOnce({ id: 'u1', role: 'manager', platform_admin: false })

    let returned
    await act(async () => { returned = await ctx.refresh() })

    expect(returned.role).toBe('manager')
    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('manager'))
  })

  it('throws if useAuth is used outside the provider', () => {
    expect(() => renderWithProviders(<Probe />)).toThrow(/useAuth must be used inside/)
  })
})
