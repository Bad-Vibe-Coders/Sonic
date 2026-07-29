import { Navigate, Outlet } from 'react-router-dom'
import { isPlatformAuthed } from '../lib/platformApi'
import { usePlatformAuth } from '../lib/PlatformAuthContext'

// Client-side gate for the platform control plane — the tenant equivalent is
// RequireAuth, but this deliberately does not share code with it (SON-64):
// it reads platform-only state (isPlatformAuthed/usePlatformAuth) and always
// sends a rejected visitor to /platform/login, never /login. The real
// boundary is server-side (see backend get_current_platform_admin); this is
// just the UX layer that stops a browser rendering the shell at all.
export default function RequirePlatformAuth() {
  const { admin, loading } = usePlatformAuth()

  if (!isPlatformAuthed()) {
    return <Navigate to="/platform/login" replace />
  }
  if (loading) return null
  if (!admin) {
    return <Navigate to="/platform/login" replace />
  }
  return <Outlet />
}
