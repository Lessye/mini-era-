import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import { getStoredEvents } from '../utils/eventStorage'
import { getStoredParticipants } from '../utils/participantStorage'
import { supabase } from '../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadDashboardData() {
    setIsLoading(true)

    const storedEvents = getStoredEvents()
    const storedParticipants = await getStoredParticipants()

    setEvents(storedEvents)
    setParticipants(storedParticipants)

    setIsLoading(false)
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('miniEraAdminLoggedIn')

    if (isLoggedIn !== 'true') {
      navigate('/admin-login')
      return
    }

    loadDashboardData()

    window.addEventListener('focus', loadDashboardData)

    return () => {
      window.removeEventListener('focus', loadDashboardData)
    }
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/admin-login')
  }

  function isEventFull(eventItem) {
    const registered = Number(eventItem.registered) || 0
    const capacity = Number(eventItem.capacity) || 0

    return capacity > 0 && registered >= capacity
  }

  const publishedEvents = events.filter((eventItem) => eventItem.published !== false)
  const draftEvents = events.filter((eventItem) => eventItem.published === false)
  const fullEvents = events.filter((eventItem) => isEventFull(eventItem))

  const checkedInParticipants = participants.filter(
    (participant) => participant.checked_in
  )

  const uniqueLocations = [
    ...new Set(events.map((eventItem) => eventItem.location).filter(Boolean)),
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
          <Link to="/admin" className="active-admin-link">
            Prehľad
          </Link>

          <Link to="/admin/events">
            Aktivity
          </Link>

          <Link to="/admin/participants">
            Účastníci
          </Link>

          <Link to="/admin/settings">
            Nastavenia
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
              Tu môžeš rýchlo skontrolovať stav aktivít, účastníkov a kapacít v MiniEra platforme.
            </p>
          </div>
        </header>

        {isLoading && (
          <section className="admin-content-card">
            <div className="admin-empty-state">
              <h3>Načítavam prehľad...</h3>
              <p>Chvíľu počkaj, údaje sa pripravujú.</p>
            </div>
          </section>
        )}

        {!isLoading && (
          <>
            <section className="admin-stats admin-stats-compact">
              <Link to="/admin/events" className="admin-stat-card clickable">
                <p>Zverejnené aktivity</p>
                <h2>{publishedEvents.length}</h2>
                <span>viditeľné pre účastníkov</span>
              </Link>

              <Link to="/admin/events" className="admin-stat-card clickable">
                <p>Koncepty</p>
                <h2>{draftEvents.length}</h2>
                <span>uložené, ale nezverejnené</span>
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

            <section className="admin-stats admin-stats-compact">
              <Link to="/admin/events" className="admin-stat-card clickable">
                <p>Lokality</p>
                <h2>{uniqueLocations.length}</h2>
                <span>miesta použité v aktivitách</span>
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
                    Pridávaj nové aktivity, upravuj informácie, nastav kapacity a rozhodni,
                    čo bude viditeľné pre účastníkov.
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
                    Pridávaj účastníkov, spravuj ich skupiny, programy, statusy a check-in počas podujatia.
                  </p>
                </div>

                <Link to="/admin/participants" className="admin-primary-link">
                  Otvoriť účastníkov
                </Link>
              </div>
            </section>

            <section className="admin-content-card">
              <h2>Ako funguje prehľad</h2>
              <p>
                Prehľad slúži na rýchlu kontrolu stavu platformy. Detailné filtrovanie a správa aktivít
                sa nachádza v sekcii Aktivity. Zverejnené aktivity sú viditeľné pre účastníkov,
                zatiaľ čo koncepty ostávajú uložené iba v admin paneli.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard