import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logout, logoutAll, setTokens, getToken } from './api'

const TOKEN_KEY = 'sonic.access_token'
const REFRESH_KEY = 'sonic.refresh_token'

const ok = (status = 204) => ({ ok: true, status, json: async () => null })
const bodyOf = (call) => JSON.parse(call[1].body)
const urlOf = (call) => String(call[0])

describe('logout (SON-61)', () => {
  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn()
  })
  afterEach(() => vi.restoreAllMocks())

  it('revokes the session server-side and clears local tokens', async () => {
    setTokens({ access_token: 'a', refresh_token: 'r' })
    fetch.mockResolvedValueOnce(ok())

    await logout()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(urlOf(fetch.mock.calls[0])).toContain('/auth/logout')
    // The server needs the refresh token to know which family to revoke.
    expect(bodyOf(fetch.mock.calls[0])).toEqual({ refresh_token: 'r' })
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })

  it('ends the local session before the network call returns', async () => {
    // SON-56's menu calls logout() without awaiting and navigates immediately,
    // so the tokens must be gone by then, not after the response.
    setTokens({ access_token: 'a', refresh_token: 'r' })
    let resolveCall
    fetch.mockReturnValueOnce(new Promise(res => { resolveCall = () => res(ok()) }))

    const pending = logout()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()

    resolveCall()
    await pending
  })

  it('still signs the user out locally when the server call fails', async () => {
    setTokens({ access_token: 'a', refresh_token: 'r' })
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(logout()).resolves.toBeUndefined()

    // Leaving them apparently signed in after they asked to leave is worse than
    // a token that outlives the click.
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })

  it('skips the call when there is no refresh token to revoke', async () => {
    localStorage.setItem(TOKEN_KEY, 'a')

    await logout()

    expect(fetch).not.toHaveBeenCalled()
    expect(getToken()).toBeNull()
  })
})

describe('logoutAll (SON-61)', () => {
  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn()
  })
  afterEach(() => vi.restoreAllMocks())

  it('asks the server to revoke every session, then clears local tokens', async () => {
    setTokens({ access_token: 'a', refresh_token: 'r' })
    fetch.mockResolvedValueOnce(ok())

    await logoutAll()

    expect(urlOf(fetch.mock.calls[0])).toContain('/auth/logout-all')
    expect(getToken()).toBeNull()
  })

  it('clears local tokens even if the server refuses', async () => {
    setTokens({ access_token: 'a', refresh_token: 'r' })
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'nope' }) })

    await expect(logoutAll()).resolves.toBeUndefined()
    expect(getToken()).toBeNull()
  })
})

describe('refresh rotation storage (SON-61)', () => {
  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn()
  })
  afterEach(() => vi.restoreAllMocks())

  it('persists the rotated refresh token, not just the access token', async () => {
    // Rotation hands back a new refresh token each time; keeping the old one
    // would present a consumed token next time and trip reuse detection.
    setTokens({ access_token: 'a1', refresh_token: 'r1' })
    setTokens({ access_token: 'a2', refresh_token: 'r2' })

    expect(getToken()).toBe('a2')
    expect(localStorage.getItem(REFRESH_KEY)).toBe('r2')
  })
})
