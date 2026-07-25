import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import AdminDashboard from './AdminDashboard'
import { analyticsOverview, analyticsVolume, pipelineHealth, listNotifications } from '../lib/api'

vi.mock('../lib/api', () => ({
  analyticsOverview: vi.fn(),
  analyticsVolume: vi.fn(),
  pipelineHealth: vi.fn(),
  listNotifications: vi.fn(),
}))

const overview = {
  total_conversations: 120,
  completed_conversations: 100,
  failed_conversations: 5,
  avg_qa_score: 0.87,
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    analyticsOverview.mockReset()
    analyticsVolume.mockReset()
    pipelineHealth.mockReset()
    listNotifications.mockReset()
  })

  it('renders KPIs from a successful analytics overview response', async () => {
    analyticsOverview.mockResolvedValueOnce(overview)
    analyticsVolume.mockResolvedValueOnce([])
    pipelineHealth.mockResolvedValueOnce({ stages: {} })
    listNotifications.mockResolvedValueOnce([])

    renderWithProviders(<AdminDashboard />)

    expect(await screen.findByText('120', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
  })

  it('shows an "analytics not available" message when the overview call fails', async () => {
    analyticsOverview.mockRejectedValueOnce(new Error('down'))
    analyticsVolume.mockResolvedValueOnce([])
    pipelineHealth.mockResolvedValueOnce({ stages: {} })
    listNotifications.mockResolvedValueOnce([])

    renderWithProviders(<AdminDashboard />)

    await waitFor(() => expect(screen.getByText('Analytics not available.')).toBeInTheDocument())
  })

  it('renders recent notifications when present', async () => {
    analyticsOverview.mockResolvedValueOnce(overview)
    analyticsVolume.mockResolvedValueOnce([])
    pipelineHealth.mockResolvedValueOnce({ stages: {} })
    listNotifications.mockResolvedValueOnce([
      { id: 'n1', kind: 'warning', title: 'QA score dipped', body: 'Team B fell below target' },
    ])

    renderWithProviders(<AdminDashboard />)

    expect(await screen.findByText('QA score dipped')).toBeInTheDocument()
    expect(screen.getByText('Team B fell below target')).toBeInTheDocument()
  })

  it('shows "No alerts yet." when there are no notifications', async () => {
    analyticsOverview.mockResolvedValueOnce(overview)
    analyticsVolume.mockResolvedValueOnce([])
    pipelineHealth.mockResolvedValueOnce({ stages: {} })
    listNotifications.mockResolvedValueOnce([])

    renderWithProviders(<AdminDashboard />)

    expect(await screen.findByText('No alerts yet.')).toBeInTheDocument()
  })
})
