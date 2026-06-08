import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import EventDetail from './pages/EventDetail'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'
import AdminLogin from './pages/AdminLogin'
import BottomNav from './components/BottomNav'
import AdminDashboard from './pages/AdminDashboard'
import AdminEvents from './pages/AdminEvents'
import AdminParticipants from './pages/AdminParticipants'
import AdminSettings from "./pages/AdminSettings"


function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')


  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/event-detail" element={<EventDetail />} />
        <Route path="/event-detail/:eventId" element={<EventDetail />} />


        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/participants" element={<AdminParticipants />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>

      {!isAdminRoute && <BottomNav />}
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