import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/utils'
import ConversationList from './ConversationList'
import { listConversations, isAuthed } from '../lib/api'

vi.mock('../lib/api', () => ({
  listConversations: vi.fn(),
  uploadConversation: vi.fn(),
  isAuthed: vi.fn(),
}))

describe('ConversationList', () => {
  beforeEach(() => {
    listConversations.mockReset()
    isAuthed.mockReset()
    isAuthed.mockReturnValue(true)
  })

  it('shows a loading state before the API resolves', () => {
    listConversations.mockReturnValue(new Promise(() => {}))
    renderWithProviders(<ConversationList />)

    expect(screen.getByText('Loading conversations…')).toBeInTheDocument()
  })

  it('renders conversations mapped from the API response', async () => {
    listConversations.mockResolvedValueOnce([
      {
        id: 'c1',
        title: 'Support call with Jane',
        created_at: '2026-01-05T00:00:00Z',
        duration_seconds: 125,
        status: 'completed',
        current_stage: null,
      },
    ])
    renderWithProviders(<ConversationList />)

    expect(await screen.findByText('Support call with Jane')).toBeInTheDocument()
    expect(screen.getByText('2:05')).toBeInTheDocument()
    expect(screen.getByText('1 of 1 conversations')).toBeInTheDocument()
  })

  it('shows the empty state when there are no conversations', async () => {
    listConversations.mockResolvedValueOnce([])
    renderWithProviders(<ConversationList />)

    expect(await screen.findByText('No conversations match your filters.')).toBeInTheDocument()
  })

  it('shows a sign-in prompt and skips the API call when not authenticated', async () => {
    isAuthed.mockReturnValue(false)
    renderWithProviders(<ConversationList />)

    expect(await screen.findByText('Sign in to view conversations.')).toBeInTheDocument()
    expect(listConversations).not.toHaveBeenCalled()
  })

  it('shows the load error message when the API call fails', async () => {
    listConversations.mockRejectedValueOnce(new Error('Backend unreachable'))
    renderWithProviders(<ConversationList />)

    await waitFor(() => expect(screen.getByText('Backend unreachable')).toBeInTheDocument())
  })
})
