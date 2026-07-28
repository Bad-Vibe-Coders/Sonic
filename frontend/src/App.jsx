import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Spotlight from './components/Spotlight'
import RequireAuth from './components/RequireAuth'
import AppShell from './layouts/AppShell'
import AdminShell from './layouts/AdminShell'

import Landing from './screens/Landing'
import Product from './screens/marketing/Product'
import PipelinePage from './screens/marketing/PipelinePage'
import Pricing from './screens/marketing/Pricing'
import Enterprise from './screens/marketing/Enterprise'
import Signup from './screens/Signup'
import Login from './screens/Login'
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

export default function App() {
  return (
    <>
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

      {/* everything below requires a token; unauthenticated hits redirect to /login */}
      <Route element={<RequireAuth />}>
        {/* post-signup flow — reads/writes onboarding progress for the logged-in tenant */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* tenant app */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/admin" replace />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="supervisor" element={<SupervisorDashboard />} />
          <Route path="agent" element={<AgentView />} />
          <Route path="conversations" element={<ConversationList />} />
          <Route path="conversations/:id" element={<ConversationReplay />} />
          <Route path="analytics" element={<ExecAnalytics />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="billing" element={<Billing />} />
          <Route path="states" element={<States />} />
        </Route>

        {/* platform super admin */}
        <Route path="/platform" element={<AdminShell />}>
          <Route index element={<PlatformOverview />} />
          <Route path="tenants" element={<PlatformTenants />} />
          <Route path="billing" element={<PlatformBilling />} />
          <Route path="health" element={<PlatformHealth />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
