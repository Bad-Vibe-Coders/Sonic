import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthed } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { homeFor } from '../lib/roles'

// Client-side gate for authenticated routes. Used as a pathless layout route so
// whole subtrees inherit it (see App.jsx).
//
// This is a UX/defence-in-depth guard, not the security boundary: the token
// lives in localStorage where the user can edit it, so the backend still
// authorizes every request. Its job is to stop a browser reaching screens the
// user has no business on — whether by deep-link or by editing the URL bar.
//
//   <RequireAuth>                              signed in
//   <RequireAuth roles={['admin']}>            signed in AND role matches
//   <RequireAuth platformAdmin>                signed in AND platform_admin
//
// Roles come from /auth/me (server-verified), never from the demo RoleSwitcher.
export default function RequireAuth({ children, roles, platformAdmin = false }) {
  const location = useLocation()
  const { role, platformAdmin: isPlatformAdmin, loading } = useAuth()

  // No token at all — cheap check, no need to wait on the network.
  if (!isAuthed()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  // Token present but identity not resolved yet. Render nothing rather than the
  // protected screen, so an unauthorized user never sees it even briefly.
  if (loading) return null

  // Token was rejected by /auth/me (expired, revoked, tampered with).
  if (!role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  // Signed in, but not entitled: send them somewhere they are allowed to be
  // rather than to /login, which would look like a session problem.
  const roleAllowed = !roles || roles.includes(role)
  const platformAllowed = !platformAdmin || isPlatformAdmin
  if (!roleAllowed || !platformAllowed) {
    const home = homeFor(role)
    // Never redirect to the route we are already on — an unrecognised role
    // (e.g. one added to the backend later) would otherwise ping-pong forever.
    if (home === location.pathname) return <NoAccess />
    return <Navigate to={home} replace />
  }

  return children ?? <Outlet />
}

function NoAccess() {
  return (
    <div className="py-24 text-center text-muted">
      You don&rsquo;t have access to this area.
    </div>
  )
}
