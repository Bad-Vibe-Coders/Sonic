import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import { AuthProvider, useAuth } from './AuthContext'
import { me, isAuthed, clearTokens } from './api'

vi.mock('./api', () => ({
  me: vi.fn(),
  isAuthed: vi.fn(),
  clearTokens: vi.fn(),
}))

function Probe() {
  const { role, platformAdmin, loading } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="role">{String(role)}</span>
      <span data-testid="platformAdmin">{String(platformAdmin)}</span>
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

  it('throws if useAuth is used outside the provider', () => {
    expect(() => renderWithProviders(<Probe />)).toThrow(/useAuth must be used inside/)
  })
})
