import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'

// `state` seeds react-router location state (e.g. the `from` path RequireAuth
// passes to /login).
export function renderWithProviders(ui, { route = '/', state } = {}) {
  const entry = state === undefined ? route : { pathname: route, state }
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>
  )
}

export * from '@testing-library/react'
