import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import ResetPassword from './ResetPassword'
import { resetPassword } from '../lib/api'

vi.mock('../lib/api', () => ({
  resetPassword: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('ResetPassword', () => {
  beforeEach(() => {
    resetPassword.mockReset()
    mockNavigate.mockReset()
  })

  it('shows a missing-token message when no token is in the URL', () => {
    renderWithProviders(<ResetPassword />, { route: '/reset-password' })
    expect(screen.getByText(/missing its token/i)).toBeInTheDocument()
  })

  it('rejects mismatched passwords without calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=abc123' })

    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'password1234')
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'password5678')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it('rejects a too-short password without calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=abc123' })

    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'short')
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'short')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it('submits the token and new password, then shows success', async () => {
    resetPassword.mockResolvedValueOnce()
    const user = userEvent.setup()
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=abc123' })

    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'brandnewpass123')
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'brandnewpass123')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => expect(resetPassword).toHaveBeenCalledWith('abc123', 'brandnewpass123'))
    expect(await screen.findByText(/password has been reset/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows a used/expired message on a 400 response', async () => {
    const err = new Error('Bad request')
    err.status = 400
    resetPassword.mockRejectedValueOnce(err)
    const user = userEvent.setup()
    renderWithProviders(<ResetPassword />, { route: '/reset-password?token=abc123' })

    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'brandnewpass123')
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'brandnewpass123')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByText(/invalid, expired, or already used/i)).toBeInTheDocument()
  })
})
