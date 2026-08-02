"""Baseline security headers on every response (SON-44).

This is a JSON API with no page-serving surface, so the CSP starts maximally
restrictive (`default-src 'none'`) rather than guessing a permissive policy
upfront -- loosen only if something (e.g. /docs in dev) turns out to need it.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_CSP = "default-src 'none'; frame-ancestors 'none'"

# FastAPI's built-in interactive docs load Swagger UI/ReDoc's JS+CSS from a
# CDN and run an inline bootstrap script -- the only page-rendering surface
# on this JSON API, and incompatible with default-src 'none'. Skipping just
# the CSP header here (not the other headers) keeps /docs usable without
# loosening the policy for every real endpoint.
_CSP_EXEMPT_PATHS = {"/docs", "/redoc", "/openapi.json"}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, hsts: bool):
        super().__init__(app)
        self._hsts = hsts

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.url.path not in _CSP_EXEMPT_PATHS:
            response.headers["Content-Security-Policy"] = _CSP
        if self._hsts:
            # Plain-HTTP dev/test servers must never send this: a browser that
            # honours it will remember to force HTTPS on that host, breaking
            # local dev. Gated on settings.env == "prod" by the caller.
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response
