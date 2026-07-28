import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthed } from '../lib/api'

// Client-side gate for authenticated routes. Used as a pathless layout route so
// the whole /app and /platform trees inherit it (see App.jsx).
//
// This is a UX/defence-in-depth guard, not the security boundary: the token lives
// in localStorage where the user can edit it, so the backend still authorizes
// every request independently. Its job is to stop unauthenticated deep-links from
// rendering an empty, error-filled shell.
//
// Role/tenant-level gating is deliberately NOT handled here — the `role` in
// ThemeContext is demo state (RoleSwitcher), not the JWT claim. That needs the
// real claim decoded server-side-verified first.
export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthed()) {
    // Remember where they were headed so login can return them there.
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children ?? <Outlet />
}
