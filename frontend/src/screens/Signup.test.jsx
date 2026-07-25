import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import Signup from './Signup'
import { register } from '../lib/api'

vi.mock('../lib/api', () => ({
  register: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

async function advanceToWorkspaceStep(user) {
  await user.type(screen.getByPlaceholderText('you@company.com'), 'jordan@acme.com')
  await user.type(screen.getByPlaceholderText('••••••••'), 'demo1234')
  await user.click(screen.getByRole('button', { name: /continue/i }))
  await screen.findByPlaceholderText('Acme Corp')
}

describe('Signup', () => {
  beforeEach(() => {
    register.mockReset()
    mockNavigate.mockReset()
  })

  it('calls register with the collected fields when reaching the final step', async () => {
    register.mockResolvedValueOnce({ access_token: 'tok' })
    const user = userEvent.setup()
    renderWithProviders(<Signup />)

    await advanceToWorkspaceStep(user)
    await user.type(screen.getByPlaceholderText('Acme Corp'), 'Acme Corp')
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        tenant_name: 'Acme Corp',
        subdomain: 'acme',
        email: 'jordan@acme.com',
        password: 'demo1234',
      })
    )
  })

  it('shows a taken-subdomain error and returns to the workspace step on 409', async () => {
    const err = new Error('Conflict')
    err.status = 409
    register.mockRejectedValueOnce(err)
    const user = userEvent.setup()
    renderWithProviders(<Signup />)

    await advanceToWorkspaceStep(user)
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(await screen.findByText('That subdomain or email is already taken.')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a generic error message for non-409 signup failures', async () => {
    register.mockRejectedValueOnce(new Error('Server exploded'))
    const user = userEvent.setup()
    renderWithProviders(<Signup />)

    await advanceToWorkspaceStep(user)
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(await screen.findByText('Signup failed: Server exploded')).toBeInTheDocument()
  })

  it('sanitizes the subdomain field to lowercase alphanumerics and hyphens', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Signup />)

    await advanceToWorkspaceStep(user)
    const subInput = screen.getByDisplayValue('acme')
    await user.clear(subInput)
    await user.type(subInput, 'My Org!!')

    expect(subInput).toHaveValue('myorg')
  })
})
