import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  listConversations, login, setTokens, clearTokens, getToken,
  setSessionExpiredHandler, resetSessionExpiry,
} from './api'

const TOKEN_KEY = 'sonic.access_token'
const REFRESH_KEY = 'sonic.refresh_token'

const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})
const unauthorized = () => json({ detail: 'Invalid token' }, 401)

// Signed in with both tokens, as a live session would be.
function seedSession() {
  localStorage.setItem(TOKEN_KEY, 'access-1')
  localStorage.setItem(REFRESH_KEY, 'refresh-1')
  resetSessionExpiry()
}

const urlOf = (call) => String(call[0])

describe('api request — session expiry (SON-60)', () => {
  let onExpired
  let unregister

  beforeEach(() => {
    localStorage.clear()
    resetSessionExpiry()
    onExpired = vi.fn()
    unregister = setSessionExpiredHandler(onExpired)
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    unregister()
    vi.restoreAllMocks()
  })

  it('reports expiry and clears tokens when the refresh is rejected', async () => {
    seedSession()
    fetch
      .mockResolvedValueOnce(unauthorized())            // original request
      .mockResolvedValueOnce(json({}, 401))             // refresh rejected

    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })

  it('reports expiry when there is no refresh token to try', async () => {
    localStorage.setItem(TOKEN_KEY, 'access-only')
    resetSessionExpiry()
    fetch.mockResolvedValueOnce(unauthorized())

    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    // Previously this path left the dead access token in place, so the app
    // still believed it was signed in.
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(getToken()).toBeNull()
  })

  it('reports expiry when the retried request is also rejected', async () => {
    seedSession()
    fetch
      .mockResolvedValueOnce(unauthorized())                                  // original
      .mockResolvedValueOnce(json({ access_token: 'a2', refresh_token: 'r2' })) // refresh ok
      .mockResolvedValueOnce(unauthorized())                                  // retry still 401

    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(getToken()).toBeNull()
  })

  it('recovers silently when the refresh succeeds', async () => {
    seedSession()
    fetch
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(json({ access_token: 'a2', refresh_token: 'r2' }))
      .mockResolvedValueOnce(json([{ id: 'c1' }]))

    await expect(listConversations()).resolves.toEqual([{ id: 'c1' }])

    expect(onExpired).not.toHaveBeenCalled()
    expect(getToken()).toBe('a2')
  })

  it('keeps the session when the refresh call itself fails to send', async () => {
    seedSession()
    fetch
      .mockResolvedValueOnce(unauthorized())
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    // Offline is not a verdict on the token — logging the user out here would
    // turn a flaky connection into a lost session.
    expect(onExpired).not.toHaveBeenCalled()
    expect(getToken()).toBe('access-1')
  })

  it('does not treat a bad password on /auth/login as an expired session', async () => {
    // A stale refresh token must not cause a login failure to trigger a refresh.
    localStorage.setItem(REFRESH_KEY, 'stale')
    resetSessionExpiry()
    fetch.mockResolvedValueOnce(unauthorized())

    await expect(login('a@b.com', 'wrong')).rejects.toMatchObject({ status: 401 })

    expect(onExpired).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(urlOf(fetch.mock.calls[0])).toContain('/auth/login')
  })

  it('ignores a 401 when no credentials were sent at all', async () => {
    // Not signed in: the route guard owns this, not the session-expiry path.
    fetch.mockResolvedValueOnce(unauthorized())

    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    expect(onExpired).not.toHaveBeenCalled()
  })

  it('reports expiry once even when several requests fail together', async () => {
    seedSession()
    fetch.mockResolvedValue(unauthorized()) // every call, including refreshes

    await Promise.allSettled([listConversations(), listConversations(), listConversations()])

    // A dashboard firing parallel requests should cause one redirect, not three.
    expect(onExpired).toHaveBeenCalledTimes(1)
  })

  it('shares a single refresh across concurrent 401s', async () => {
    seedSession()
    let refreshCalls = 0
    fetch.mockImplementation(async (url) => {
      if (String(url).includes('/auth/refresh')) {
        refreshCalls++
        return json({ access_token: 'a2', refresh_token: 'r2' })
      }
      // First attempt from each caller 401s; anything sent with the new token passes.
      return getToken() === 'a2' ? json([]) : unauthorized()
    })

    await Promise.all([listConversations(), listConversations(), listConversations()])

    // Without single-flight, later refreshes send an already-rotated token and
    // tear down the session that was just renewed.
    expect(refreshCalls).toBe(1)
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('re-arms expiry reporting after signing in again', async () => {
    seedSession()
    fetch.mockResolvedValue(unauthorized())
    await expect(listConversations()).rejects.toMatchObject({ status: 401 })
    expect(onExpired).toHaveBeenCalledTimes(1)

    // New session…
    setTokens({ access_token: 'fresh', refresh_token: 'fresh-r' })
    fetch.mockResolvedValue(unauthorized())
    await expect(listConversations()).rejects.toMatchObject({ status: 401 })

    expect(onExpired).toHaveBeenCalledTimes(2)
  })

  it('unregisters the handler cleanly', async () => {
    unregister()
    seedSession()
    fetch.mockResolvedValue(unauthorized())

    // With no handler and jsdom sitting on "/", the fallback would navigate;
    // assert only that the tokens are still cleared and nothing throws.
    await expect(listConversations()).rejects.toMatchObject({ status: 401 })
    expect(onExpired).not.toHaveBeenCalled()
    expect(getToken()).toBeNull()
  })
})

describe('clearTokens', () => {
  it('removes both tokens', () => {
    setTokens({ access_token: 'a', refresh_token: 'r' })
    clearTokens()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })
})
