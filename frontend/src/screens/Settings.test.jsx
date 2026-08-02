import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import Settings from './Settings'
import { getTenantSettings, uploadTenantLogo, removeTenantLogo, fetchTenantLogoUrl } from '../lib/api'

vi.mock('../lib/api', () => ({
  getUserSettings: vi.fn().mockResolvedValue({ email: 'a@b.com', name: '', notify_email: true, notify_in_app: true }),
  updateUserSettings: vi.fn(),
  changePassword: vi.fn(),
  getTenantSettings: vi.fn(),
  updateTenantSettings: vi.fn(),
  uploadTenantLogo: vi.fn(),
  removeTenantLogo: vi.fn(),
  fetchTenantLogoUrl: vi.fn(),
  listTeamMembers: vi.fn().mockResolvedValue([]),
  listInvitations: vi.fn().mockResolvedValue([]),
  inviteTeamMember: vi.fn(),
  revokeInvitation: vi.fn(),
  updateMemberRole: vi.fn(),
  removeTeamMember: vi.fn(),
}))

vi.mock('../lib/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'u1' }, tenantName: 'Acme Corp' })),
}))

const NO_LOGO = { id: 't1', name: 'Acme Corp', timezone: 'UTC', qa_rules_path: null, has_logo: false }
const WITH_LOGO = { ...NO_LOGO, has_logo: true }

async function openBrandingTab() {
  const user = userEvent.setup()
  renderWithProviders(<Settings />)
  await user.click(screen.getByRole('button', { name: /branding/i }))
  return user
}

describe('Settings — Branding tab', () => {
  beforeEach(() => {
    getTenantSettings.mockReset().mockResolvedValue(NO_LOGO)
    uploadTenantLogo.mockReset()
    removeTenantLogo.mockReset()
    fetchTenantLogoUrl.mockReset()
  })

  it('shows the initials placeholder and an enabled Upload button when there is no logo', async () => {
    await openBrandingTab()

    expect(await screen.findByText('AC')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^upload$/i })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('uploads the chosen file and shows the logo once uploaded', async () => {
    uploadTenantLogo.mockResolvedValue(WITH_LOGO)
    fetchTenantLogoUrl.mockResolvedValue('blob:fake-logo-url')
    const user = await openBrandingTab()
    await screen.findByRole('button', { name: /^upload$/i })

    const file = new File(['fake'], 'logo.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, file)

    await waitFor(() => expect(uploadTenantLogo).toHaveBeenCalledWith(file))
    expect(await screen.findByAltText('Organization logo')).toHaveAttribute('src', 'blob:fake-logo-url')
    expect(await screen.findByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('rejects an oversized file client-side without calling the API', async () => {
    const user = await openBrandingTab()
    await screen.findByRole('button', { name: /^upload$/i })

    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'logo.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, big)

    expect(await screen.findByText('Logo must be under 2MB.')).toBeInTheDocument()
    expect(uploadTenantLogo).not.toHaveBeenCalled()
  })

  it('rejects a disallowed file type client-side without calling the API', async () => {
    const user = await openBrandingTab()
    await screen.findByRole('button', { name: /^upload$/i })

    const gif = new File(['fake'], 'logo.gif', { type: 'image/gif' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, gif)

    expect(await screen.findByText('Use PNG, JPEG, SVG, or WebP.')).toBeInTheDocument()
    expect(uploadTenantLogo).not.toHaveBeenCalled()
  })

  it('shows an error message when the upload fails', async () => {
    uploadTenantLogo.mockRejectedValue(new Error('Storage unavailable'))
    const user = await openBrandingTab()
    await screen.findByRole('button', { name: /^upload$/i })

    const file = new File(['fake'], 'logo.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, file)

    expect(await screen.findByText('Storage unavailable')).toBeInTheDocument()
  })

  it('removes the logo and falls back to the initials placeholder', async () => {
    getTenantSettings.mockResolvedValue(WITH_LOGO)
    fetchTenantLogoUrl.mockResolvedValue('blob:fake-logo-url')
    removeTenantLogo.mockResolvedValue(NO_LOGO)
    const user = await openBrandingTab()

    const removeBtn = await screen.findByRole('button', { name: /remove/i })
    await user.click(removeBtn)

    await waitFor(() => expect(removeTenantLogo).toHaveBeenCalled())
    expect(await screen.findByText('AC')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })
})
