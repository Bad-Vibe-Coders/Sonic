import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { render } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { me, isAuthed, getTenantSettings, setSessionExpiredHandler } from './api'

vi.mock('./api', () => ({
  me: vi.fn(),
  isAuthed: vi.fn(),
  clearTokens: vi.fn(),
  getTenantSettings: vi.fn(),
  setSessionExpiredHandler: vi.fn(() => () => {}),
}))

// Captures whatever AuthProvider registered as the global expiry handler, so we
// can fire it the way lib/api does when both tokens are confirmed dead.
const registeredHandler = () => {
  const calls = setSessionExpiredHandler.mock.calls
  return calls.length ? calls[calls.length - 1][0] : null
}

function LocationProbe() {
  const loc = useLocation()
  return (
    <div>
      <span data-testid="path">{loc.pathname}</span>
      <span data-testid="from">{String(loc.state?.from)}</span>
      <span data-testid="expired">{String(Boolean(loc.state?.expired))}</span>
    </div>
  )
}

function renderApp(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<><div>login screen</div><LocationProbe /></>} />
          <Route path="/app/conversations" element={<><div>conversations</div><LocationProbe /></>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('session expiry redirect (SON-60)', () => {
  beforeEach(() => {
    me.mockReset()
    isAuthed.mockReset()
    getTenantSettings.mockReset()
    getTenantSettings.mockResolvedValue({ id: 't1', name: 'Helix Health', timezone: 'UTC' })
    setSessionExpiredHandler.mockClear()
    setSessionExpiredHandler.mockImplementation(() => () => {})
  })

  it('sends an expired session to /login, remembering where it was', async () => {
    isAuthed.mockReturnValue(true)
    me.mockResolvedValue({ id: 'u1', role: 'agent', platform_admin: false })
    renderApp('/app/conversations?page=2')

    await waitFor(() => expect(screen.getByText('conversations')).toBeInTheDocument())

    // The API client has just confirmed both tokens are dead.
    await act(async () => { registeredHandler()() })

    await waitFor(() => expect(screen.getByText('login screen')).toBeInTheDocument())
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    // Deep link preserved so the user can be returned after signing in...
    expect(screen.getByTestId('from')).toHaveTextContent('/app/conversations?page=2')
    // ...and flagged as an expiry so Login can explain the bounce.
    expect(screen.getByTestId('expired')).toHaveTextContent('true')
  })

  it('does not navigate when already sitting on /login', async () => {
    isAuthed.mockReturnValue(false)
    renderApp('/login')

    await waitFor(() => expect(screen.getByText('login screen')).toBeInTheDocument())

    await act(async () => { registeredHandler()() })

    // Still on /login, and no expiry banner state was pushed onto it.
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    expect(screen.getByTestId('expired')).toHaveTextContent('false')
  })

  it('registers a handler on mount', () => {
    isAuthed.mockReturnValue(false)
    renderApp('/login')

    expect(setSessionExpiredHandler).toHaveBeenCalled()
    expect(typeof registeredHandler()).toBe('function')
  })
})
