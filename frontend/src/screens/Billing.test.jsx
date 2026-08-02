import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import Billing from './Billing'
import { getBillingSummary, listBillingPlans, listInvoices, downloadInvoice } from '../lib/api'

vi.mock('../lib/api', () => ({
  getBillingSummary: vi.fn(),
  listBillingPlans: vi.fn(),
  listInvoices: vi.fn(),
  changePlan: vi.fn(),
  downloadInvoice: vi.fn(),
}))

vi.mock('../lib/AuthContext', () => ({
  useAuth: vi.fn(() => ({ role: 'admin' })),
}))

const SUMMARY = {
  plan: { code: 'team', name: 'Team', price_cents: 4900, call_quota: 25000 },
  status: 'active',
  current_period_start: '2026-01-01T00:00:00Z',
  current_period_end: '2026-02-01T00:00:00Z',
  calls_used: 10,
  call_quota: 25000,
}
const PLANS = [{ code: 'team', name: 'Team', price_cents: 4900, call_quota: 25000 }]
const INVOICES = [
  { id: 'inv-1', amount_cents: 4900, status: 'paid', period_start: '2026-01-01T00:00:00Z', period_end: '2026-02-01T00:00:00Z', issued_at: '2026-02-01T00:00:00Z' },
  { id: 'inv-0', amount_cents: 4900, status: 'paid', period_start: '2025-12-01T00:00:00Z', period_end: '2026-01-01T00:00:00Z', issued_at: '2026-01-01T00:00:00Z' },
]

describe('Billing', () => {
  beforeEach(() => {
    getBillingSummary.mockReset().mockResolvedValue(SUMMARY)
    listBillingPlans.mockReset().mockResolvedValue(PLANS)
    listInvoices.mockReset().mockResolvedValue(INVOICES)
    downloadInvoice.mockReset().mockResolvedValue(undefined)
  })

  it('enables the download button once an invoice exists and downloads it on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Billing />)

    const button = await screen.findByRole('button', { name: /download invoice/i })
    expect(button).toBeEnabled()

    await user.click(button)

    await waitFor(() => expect(downloadInvoice).toHaveBeenCalledWith('inv-1'))
  })

  it('shows an error and keeps the button usable when the download fails', async () => {
    downloadInvoice.mockRejectedValueOnce(new Error('Network down'))
    const user = userEvent.setup()
    renderWithProviders(<Billing />)

    const button = await screen.findByRole('button', { name: /download invoice/i })
    await user.click(button)

    expect(await screen.findByText(/Couldn't download invoice: Network down/)).toBeInTheDocument()
    expect(button).toBeEnabled()
  })

  it('shows no download button when there are no invoices', async () => {
    listInvoices.mockReset().mockResolvedValue([])
    renderWithProviders(<Billing />)

    expect(await screen.findByText('No invoices yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /download invoice/i })).not.toBeInTheDocument()
  })
})
