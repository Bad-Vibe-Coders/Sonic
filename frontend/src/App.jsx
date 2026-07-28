import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Spotlight from './components/Spotlight'
import RequireAuth from './components/RequireAuth'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { MANAGEMENT, ADMIN_ONLY, homeFor } from './lib/roles'
import AppShell from './layouts/AppShell'
import AdminShell from './layouts/AdminShell'

import Landing from './screens/Landing'
import Product from './screens/marketing/Product'
import PipelinePage from './screens/marketing/PipelinePage'
import Pricing from './screens/marketing/Pricing'
import Enterprise from './screens/marketing/Enterprise'
import Signup from './screens/Signup'
import Login from './screens/Login'
import AcceptInvite from './screens/AcceptInvite'
import Onboarding from './screens/Onboarding'

import AdminDashboard from './screens/AdminDashboard'
import SupervisorDashboard from './screens/SupervisorDashboard'
import ConversationList from './screens/ConversationList'
import ConversationReplay from './screens/ConversationReplay'
import ExecAnalytics from './screens/ExecAnalytics'
import AgentView from './screens/AgentView'
import SystemHealth from './screens/SystemHealth'
import Settings from './screens/Settings'
import Notifications from './screens/Notifications'
import Billing from './screens/Billing'
import States from './screens/States'

import { PlatformOverview, PlatformTenants, PlatformBilling, PlatformHealth } from './screens/SuperAdmin'

// Land each role on a page it can actually open, instead of bouncing everyone
// through /app/admin and letting the guard reject non-admins.
function RoleHome() {
  const { role, loading } = useAuth()
  if (loading) return null
  return <Navigate to={homeFor(role)} replace />
}

export default function App() {
  return (
    <AuthProvider>
    <ScrollToTop />
    <Spotlight />
    <Routes>
      {/* marketing + auth */}
      <Route path="/" element={<Landing />} />
      <Route path="/product" element={<Product />} />
      <Route path="/pipeline" element={<PipelinePage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* everything below requires a token; unauthenticated hits redirect to /login */}
      <Route element={<RequireAuth />}>
        {/* post-signup flow — reads/writes onboarding progress for the logged-in tenant */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* tenant app. Roles are the real backend ones (admin|manager|agent);
            each route re-declares what it needs so a URL can't outrun the nav. */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<RoleHome />} />
          <Route path="conversations" element={<ConversationList />} />
          <Route path="conversations/:id" element={<ConversationReplay />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="agent" element={<AgentView />} />

          {/* admin + manager, mirroring SON-52's require_role on the analytics
              and billing GET routes. Billing's plan switcher is admin-only
              server-side, so the screen hides it for managers. */}
          <Route element={<RequireAuth roles={MANAGEMENT} />}>
            <Route path="supervisor" element={<SupervisorDashboard />} />
            <Route path="analytics" element={<ExecAnalytics />} />
            <Route path="billing" element={<Billing />} />
          </Route>

          <Route element={<RequireAuth roles={ADMIN_ONLY} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="health" element={<SystemHealth />} />
            <Route path="settings" element={<Settings />} />
            <Route path="states" element={<States />} />
          </Route>
        </Route>

        {/* platform super admin — gated on the platform_admin flag from /auth/me,
            the same flag the backend's require_platform_admin enforces. */}
        <Route element={<RequireAuth platformAdmin />}>
          <Route path="/platform" element={<AdminShell />}>
            <Route index element={<PlatformOverview />} />
            <Route path="tenants" element={<PlatformTenants />} />
            <Route path="billing" element={<PlatformBilling />} />
            <Route path="health" element={<PlatformHealth />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthProvider>
  )
}
