import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EventDetail from './pages/EventDetail'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'

import BottomNav from './components/BottomNav'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/event-detail" element={<EventDetail />} />
      </Routes>

      <BottomNav />
    </BrowserRouter>
  )
}

export default App