import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import { getSupabaseEvents } from '../utils/supabaseEventStorage'
import { getSupabaseParticipants } from '../utils/supabaseParticipantStorage'
import { supabase } from '../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [events, setEvents] = useState([])
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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
  }, [navigate, location.pathname, location.key])

  async function loadDashboardData() {
    setIsLoading(true)

    const supabaseEvents = await getSupabaseEvents()
    const supabaseParticipants = await getSupabaseParticipants()

    setEvents(supabaseEvents)
    setParticipants(supabaseParticipants)

    setIsLoading(false)
  }

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

  function isParticipantCheckedIn(participant) {
    return participant.checked_in === true || participant.checkedIn === true
  }

  const publishedEvents = events.filter((eventItem) => {
    return eventItem.published !== false
  })

  const draftEvents = events.filter((eventItem) => {
    return eventItem.published === false
  })

  const fullEvents = events.filter((eventItem) => {
    return isEventFull(eventItem)
  })

  const checkedInParticipants = participants.filter((participant) => {
    return isParticipantCheckedIn(participant)
  })

  const waitingParticipants = participants.filter((participant) => {
    return participant.status === 'Čaká'
  })

  const uniqueLocations = [
    ...new Set(events.map((eventItem) => eventItem.location).filter(Boolean)),
  ]

  const totalCapacity = events.reduce((total, eventItem) => {
    return total + (Number(eventItem.capacity) || 0)
  }, 0)

  const totalRegistered = events.reduce((total, eventItem) => {
    return total + (Number(eventItem.registered) || 0)
  }, 0)

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
              Tu môžeš rýchlo skontrolovať stav aktivít, účastníkov a kapacít
              v MiniEra platforme. Údaje sa načítavajú zo Supabase.
            </p>
          </div>

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={loadDashboardData}
          >
            Obnoviť dáta
          </button>
        </header>

        {isLoading && (
          <section className="admin-content-card">
            <div className="admin-empty-state">
              <h3>Načítavam prehľad...</h3>

              <p>
                Údaje sa načítavajú zo Supabase.
              </p>
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

              <Link to="/admin/events" className="admin-stat-card clickable">
                <p>Prihlásenia</p>
                <h2>{totalRegistered}</h2>
                <span>celkovo na aktivitách</span>
              </Link>

              <Link to="/admin/participants" className="admin-stat-card clickable warning">
                <p>Čakajú</p>
                <h2>{waitingParticipants.length}</h2>
                <span>registrácie na kontrolu</span>
              </Link>
            </section>

            <section className="admin-dashboard-actions">
              <div className="admin-panel-card">
                <div>
                  <h2>Správa aktivít</h2>

                  <p>
                    Pridávaj nové aktivity, upravuj informácie, nastav kapacity
                    a rozhodni, čo bude viditeľné pre účastníkov.
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
                    Pridávaj účastníkov, spravuj ich skupiny, programy, statusy
                    a check-in počas podujatia.
                  </p>
                </div>

                <Link to="/admin/participants" className="admin-primary-link">
                  Otvoriť účastníkov
                </Link>
              </div>
            </section>

            <section className="admin-content-card">
              <h2>Stav kapacít</h2>

              <p>
                Aktuálne je prihlásených {totalRegistered} účastí z celkovej
                kapacity {totalCapacity} miest naprieč všetkými aktivitami.
                Naplnené aktivity sa zobrazujú v karte Kapacity.
              </p>
            </section>

            <section className="admin-content-card">
              <h2>Ako funguje prehľad</h2>

              <p>
                Prehľad slúži na rýchlu kontrolu stavu platformy. Detailné
                filtrovanie a správa aktivít sa nachádza v sekcii Aktivity.
                Zverejnené aktivity sú viditeľné pre účastníkov, zatiaľ čo
                koncepty ostávajú uložené iba v admin paneli.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard