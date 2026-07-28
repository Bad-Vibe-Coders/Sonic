import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './test/utils'
import App from './App'
import { isAuthed } from './lib/api'

// Keep every real export (App pulls in screens that import many of them) and
// stub only the auth check.
vi.mock('./lib/api', async (importOriginal) => ({
  ...(await importOriginal()),
  isAuthed: vi.fn(),
}))

// The protected routes a browser could previously reach by typing the URL.
const PROTECTED_ROUTES = [
  '/app',
  '/app/admin',
  '/app/supervisor',
  '/app/agent',
  '/app/conversations',
  '/app/conversations/CV-1',
  '/app/analytics',
  '/app/health',
  '/app/settings',
  '/app/notifications',
  '/app/billing',
  '/app/states',
  '/platform',
  '/platform/tenants',
  '/platform/billing',
  '/platform/health',
  '/onboarding',
]

describe('App route guarding', () => {
  beforeEach(() => {
    isAuthed.mockReset()
  })

  it.each(PROTECTED_ROUTES)('redirects %s to /login when unauthenticated', (route) => {
    isAuthed.mockReturnValue(false)
    renderWithProviders(<App />, { route })

    // Landing on Login: its tenant-simulation control is unique to that screen.
    expect(screen.getByText('Simulate tenant:')).toBeInTheDocument()
    // And none of the app chrome (sidebar nav) rendered.
    expect(screen.queryByRole('link', { name: /Platform Admin/i })).not.toBeInTheDocument()
  })

  it.each(['/', '/pricing', '/login', '/signup'])('leaves public route %s reachable', (route) => {
    isAuthed.mockReturnValue(false)
    const { container } = renderWithProviders(<App />, { route })

    expect(container).not.toBeEmptyDOMElement()
  })
})
