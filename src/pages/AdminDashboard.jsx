import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import { getStoredEvents } from '../utils/eventStorage'
import { getStoredParticipants } from '../utils/participantStorage'

function AdminDashboard() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [participants, setParticipants] = useState([])

  function loadDashboardData() {
    setEvents(getStoredEvents())
    setParticipants(getStoredParticipants())
  }

  useEffect(() => {
    loadDashboardData()

    window.addEventListener('focus', loadDashboardData)

    return () => {
      window.removeEventListener('focus', loadDashboardData)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/profile')
  }

  const publishedEvents = events.filter((eventItem) => eventItem.published)
  const hiddenEvents = events.filter((eventItem) => !eventItem.published)

  const fullEvents = events.filter(
    (eventItem) => eventItem.registered >= eventItem.capacity
  )

  const checkedInParticipants = participants.filter(
    (participant) => participant.checkedIn
  )

  const uniqueLocations = [
    ...new Set(events.map((eventItem) => eventItem.location).filter(Boolean))
  ]

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">M</div>

          <div>
            <h2>MiniEra</h2>
            <p>Admin panel</p>
          </div>
        </div>

        <nav className="admin-menu">
          <Link to="/admin" className="active">
            Prehľad
          </Link>

          <Link to="/admin/events">
            Aktivity
          </Link>

          <Link to="/admin/participants">
            Účastníci
          </Link>

          <Link to="/admin/settings">Nastavenia
          </Link>

          <button onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-small-label">PREHĽAD</p>
            <h1>Vitaj späť, organizátor</h1>
            <p>
              Tu môžeš spravovať Mini Erasmus aktivity, kapacity a informácie pre účastníkov.
            </p>
          </div>
        </header>

        <section className="admin-stats">
          <Link to="/admin/events" className="admin-stat-card clickable">
            <p>Zverejnené aktivity</p>
            <h2>{publishedEvents.length}</h2>
            <span>viditeľné v účastníckej aplikácii</span>
          </Link>

          <Link to="/admin/events" className="admin-stat-card clickable">
            <p>Koncepty</p>
            <h2>{hiddenEvents.length}</h2>
            <span>skryté aktivity</span>
          </Link>

          <Link to="/admin/participants" className="admin-stat-card clickable">
            <p>Účastníci</p>
            <h2>{participants.length}</h2>
            <span>registrovaní študenti</span>
          </Link>

          <Link to="/admin/participants" className="admin-stat-card clickable">
            <p>Check-in</p>
            <h2>{checkedInParticipants.length}</h2>
            <span>účastníci už prišli</span>
          </Link>
        </section>

        <section className="admin-stats">
          <Link to="/admin/events" className="admin-stat-card clickable">
            <p>Lokality</p>
            <h2>{uniqueLocations.length}</h2>
            <span>miesta v Bratislave</span>
          </Link>

          <Link to="/admin/events" className="admin-stat-card clickable warning">
            <p>Kapacity</p>
            <h2>{fullEvents.length}</h2>
            <span>naplnené aktivity</span>
          </Link>
        </section>

        <section className="admin-dashboard-actions">
          <div className="admin-panel-card">
            <div>
              <h2>Správa aktivít</h2>
              <p>
                Pridávaj, upravuj alebo zverejňuj aktivity, ktoré sa zobrazia účastníkom v aplikácii.
              </p>
            </div>

            <Link to="/admin/events" className="admin-primary-link">
              Otvoriť aktivity
            </Link>
          </div>

          <div className="admin-panel-card">
            <div>
              <h2>Správa účastníkov</h2>
              <p>
                Sleduj registrovaných študentov, ich skupiny, status a check-in počas programu.
              </p>
            </div>

            <Link to="/admin/participants" className="admin-primary-link">
              Otvoriť účastníkov
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard