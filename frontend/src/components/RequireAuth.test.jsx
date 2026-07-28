import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Routes, Route, useLocation } from 'react-router-dom'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import RequireAuth from './RequireAuth'
import { isAuthed } from '../lib/api'

vi.mock('../lib/api', () => ({
  isAuthed: vi.fn(),
}))

// Stand-in for the real Login screen that also reports the location it was
// reached with, so we can assert the attempted path was handed over.
function LoginProbe({ onLocation }) {
  onLocation(useLocation())
  return <div>login screen</div>
}

// Minimal route tree mirroring App.jsx's shape: a pathless RequireAuth layout
// wrapping protected children, plus a public /login to land on.
function renderTree(route, { onLocation = () => {} } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginProbe onLocation={onLocation} />} />
      <Route element={<RequireAuth />}>
        <Route path="/app/billing" element={<div>billing screen</div>} />
        <Route path="/app/conversations" element={<div>conversations screen</div>} />
      </Route>
    </Routes>,
    { route }
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    isAuthed.mockReset()
  })

  it('renders the protected route when authenticated', () => {
    isAuthed.mockReturnValue(true)
    renderTree('/app/billing')

    expect(screen.getByText('billing screen')).toBeInTheDocument()
    expect(screen.queryByText('login screen')).not.toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    isAuthed.mockReturnValue(false)
    renderTree('/app/billing')

    expect(screen.getByText('login screen')).toBeInTheDocument()
    // The protected screen must never render, not even briefly.
    expect(screen.queryByText('billing screen')).not.toBeInTheDocument()
  })

  it('passes the attempted location (with query) to /login so it can redirect back', () => {
    isAuthed.mockReturnValue(false)
    let seen
    renderTree('/app/conversations?page=2', { onLocation: (l) => { seen = l } })

    expect(seen.state.from).toBe('/app/conversations?page=2')
  })

  it('renders children instead of an Outlet when given them', () => {
    isAuthed.mockReturnValue(true)
    renderWithProviders(
      <RequireAuth><div>wrapped child</div></RequireAuth>,
      { route: '/app/admin' }
    )

    expect(screen.getByText('wrapped child')).toBeInTheDocument()
  })
})
