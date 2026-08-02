// SON-66: after login resolves the user's tenant server-side, send the
// browser to that tenant's subdomain if it isn't there already, so the
// dashboard always loads from `<subdomain>.{baseDomain}` rather than a
// shared universal host.
//
// Mirrors backend/app/core/tenant_resolution.py's extract_subdomain so both
// sides agree on what counts as a tenant subdomain vs. the bare/reserved host.
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'app', 'admin', 'static', 'assets'])

const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || 'sonic.app'

export function extractSubdomain(hostname, baseDomain = BASE_DOMAIN) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  const suffix = `.${baseDomain.toLowerCase()}`
  if (!host.endsWith(suffix)) return null
  const slug = host.slice(0, -suffix.length)
  if (!slug || slug.includes('.') || RESERVED_SUBDOMAINS.has(slug)) return null
  return slug
}

export function buildTenantUrl(subdomain, path, baseDomain = BASE_DOMAIN) {
  const { protocol, port } = window.location
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${subdomain}.${baseDomain}${portSuffix}${path}`
}

// Tokens can't follow a cross-subdomain redirect through localStorage (it's
// origin-scoped), so they're handed over once via a URL fragment and consumed
// by consumeHandoffTokens() on the landing page. A fragment (not a query
// param) never leaves the browser — it isn't sent to the server or logged.
export function redirectToTenant(subdomain, path, tokens) {
  const url = new URL(buildTenantUrl(subdomain, path))
  url.hash = `handoff=${encodeURIComponent(JSON.stringify(tokens))}`
  window.location.assign(url.toString())
}

export function consumeHandoffTokens() {
  const hash = window.location.hash
  const match = hash.match(/(?:^#|&)handoff=([^&]+)/)
  if (!match) return null
  try {
    const tokens = JSON.parse(decodeURIComponent(match[1]))
    // Strip the fragment immediately so the tokens never linger in history.
    const clean = window.location.pathname + window.location.search
    window.history.replaceState(null, '', clean)
    return tokens
  } catch {
    return null
  }
}
