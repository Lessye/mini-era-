import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'

import EventDetail from './pages/EventDetail'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminEvents from './pages/AdminEvents'
import AdminParticipants from './pages/AdminParticipants'
import AdminSettings from './pages/AdminSettings'

import ParticipantLogin from './pages/ParticipantLogin'

import BottomNav from './components/BottomNav'
import { getCurrentParticipant } from './utils/participantLoginStorage'

function ProtectedParticipantRoute({ children }) {
  const currentParticipant = getCurrentParticipant()

  if (!currentParticipant) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')
  const isLoginRoute = location.pathname === '/login'

  const shouldShowBottomNav = !isAdminRoute && !isLoginRoute

  return (
    <>
      <Routes>
        <Route path="/login" element={<ParticipantLogin />} />

        <Route
          path="/"
          element={
            <ProtectedParticipantRoute>
              <Dashboard />
            </ProtectedParticipantRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedParticipantRoute>
              <Events />
            </ProtectedParticipantRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedParticipantRoute>
              <Schedule />
            </ProtectedParticipantRoute>
          }
        />

        <Route
          path="/event-detail"
          element={
            <ProtectedParticipantRoute>
              <EventDetail />
            </ProtectedParticipantRoute>
          }
        />

        <Route
          path="/event-detail/:eventId"
          element={
            <ProtectedParticipantRoute>
              <EventDetail />
            </ProtectedParticipantRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedParticipantRoute>
              <Profile />
            </ProtectedParticipantRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/participants" element={<AdminParticipants />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {shouldShowBottomNav && <BottomNav />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App