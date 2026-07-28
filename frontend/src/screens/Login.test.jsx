import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import Login from './Login'
import { login, getOnboardingStatus } from '../lib/api'

vi.mock('../lib/api', () => ({
  login: vi.fn(),
  // Login awaits this after a successful sign-in to decide onboarding vs app
  // (SON-26). Without it the call throws and the navigate never happens.
  getOnboardingStatus: vi.fn(),
}))

// Login refreshes the shared identity after sign-in and uses the returned role
// to pick a landing page (SON-54).
const mockRefresh = vi.fn()
vi.mock('../lib/AuthContext', () => ({
  useAuth: vi.fn(() => ({ refresh: mockRefresh })),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('Login', () => {
  beforeEach(() => {
    login.mockReset()
    mockNavigate.mockReset()
    // Default: onboarding already finished, so login goes straight to the app.
    getOnboardingStatus.mockReset()
    getOnboardingStatus.mockResolvedValue({ completed_at: '2026-01-01T00:00:00Z' })
    mockRefresh.mockReset()
    mockRefresh.mockResolvedValue({ id: 'u1', role: 'admin', platform_admin: false })
  })

  it('calls login with the entered credentials and navigates on success', async () => {
    login.mockResolvedValueOnce({ access_token: 'tok' })
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByPlaceholderText('you@company.com'), 'demo@sonic.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'demo1234')
    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith('demo@sonic.dev', 'demo1234'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app/admin'))
  })

  it.each([
    ['admin', '/app/admin'],
    ['manager', '/app/supervisor'],
    ['agent', '/app/agent'],
  ])('lands a %s on %s instead of always /app/admin', async (role, home) => {
    login.mockResolvedValueOnce({ access_token: 'tok' })
    mockRefresh.mockResolvedValueOnce({ id: 'u1', role, platform_admin: false })
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(home))
  })

  it('falls back to the most restricted home when the role lookup fails', async () => {
    login.mockResolvedValueOnce({ access_token: 'tok' })
    mockRefresh.mockResolvedValueOnce(null)
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app/agent'))
  })

  it('returns to the route RequireAuth bounced from, when there is one', async () => {
    login.mockResolvedValueOnce({ access_token: 'tok' })
    const user = userEvent.setup()
    // RequireAuth hands the attempted path over in location state.
    renderWithProviders(<Login />, { route: '/login', state: { from: '/app/billing' } })

    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app/billing'))
  })

  it('sends users with unfinished onboarding to /onboarding, ignoring any from', async () => {
    login.mockResolvedValueOnce({ access_token: 'tok' })
    getOnboardingStatus.mockResolvedValueOnce({ completed_at: null })
    const user = userEvent.setup()
    renderWithProviders(<Login />, { route: '/login', state: { from: '/app/billing' } })

    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/onboarding'))
  })

  it('explains the bounce when the session expired', () => {
    renderWithProviders(<Login />, { route: '/login', state: { from: '/app/billing', expired: true } })

    expect(screen.getByText('Your session expired. Please sign in again.')).toBeInTheDocument()
  })

  it('shows no expiry notice on a normal visit to /login', () => {
    renderWithProviders(<Login />)

    expect(screen.queryByText(/session expired/i)).not.toBeInTheDocument()
  })

  it('shows an invalid-credentials message on a 401 response', async () => {
    const err = new Error('Unauthorized')
    err.status = 401
    login.mockRejectedValueOnce(err)
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.type(screen.getByPlaceholderText('you@company.com'), 'demo@sonic.dev')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a generic error message for non-401 failures', async () => {
    login.mockRejectedValueOnce(new Error('Network down'))
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: /sign in to/i }))

    expect(await screen.findByText('Sign-in failed: Network down')).toBeInTheDocument()
  })

  it('fills demo credentials when the demo button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: /fill demo credentials/i }))

    expect(screen.getByPlaceholderText('you@company.com')).toHaveValue('demo@sonic.dev')
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('demo1234')
  })
})
