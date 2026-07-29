import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import ForgotPassword from './ForgotPassword'
import { forgotPassword } from '../lib/api'

vi.mock('../lib/api', () => ({
  forgotPassword: vi.fn(),
}))

describe('ForgotPassword', () => {
  beforeEach(() => {
    forgotPassword.mockReset()
  })

  it('submits the entered email and shows the generic confirmation', async () => {
    forgotPassword.mockResolvedValueOnce({})
    const user = userEvent.setup()
    renderWithProviders(<ForgotPassword />)

    await user.type(screen.getByPlaceholderText('you@company.com'), 'alice@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => expect(forgotPassword).toHaveBeenCalledWith('alice@example.com'))
    expect(await screen.findByText(/reset link is on its way/i)).toBeInTheDocument()
  })

  it('shows an error message if the request fails', async () => {
    forgotPassword.mockRejectedValueOnce(new Error('Network down'))
    const user = userEvent.setup()
    renderWithProviders(<ForgotPassword />)

    await user.type(screen.getByPlaceholderText('you@company.com'), 'alice@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByText(/something went wrong: network down/i)).toBeInTheDocument()
  })

  it('links back to the sign-in page', () => {
    renderWithProviders(<ForgotPassword />)
    expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/login')
  })
})
