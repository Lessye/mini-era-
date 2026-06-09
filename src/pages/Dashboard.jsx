import '../styles/dashboard.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.svg'
import {
  getCurrentParticipant,
  refreshCurrentParticipant,
} from '../utils/participantLoginStorage'
import { getProgramInfo } from '../utils/programInfoStorage'
import { getSupabasePublishedEvents } from '../utils/supabaseEventStorage'
import { getSupabaseJoinedEvents } from '../utils/supabaseJoinedEventsStorage'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const programInfo = getProgramInfo()

  const [currentParticipant, setCurrentParticipant] = useState(getCurrentParticipant())
  const [publishedEvents, setPublishedEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardEvents()
  }, [location.pathname, location.key])

  async function loadDashboardEvents() {
    setIsLoading(true)

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    const supabaseEvents = await getSupabasePublishedEvents()
    const supabaseJoinedEvents = await getSupabaseJoinedEvents()

    setCurrentParticipant(participant)
    setPublishedEvents(supabaseEvents)
    setJoinedEvents(supabaseJoinedEvents)
    setIsLoading(false)
  }

  function getJoinedEventId(joinedItem) {
    return joinedItem.eventId || joinedItem.event_id || joinedItem.event?.id || ''
  }

  const joinedEventsWithFreshData = joinedEvents
    .map((joinedItem) => {
      const joinedEventId = getJoinedEventId(joinedItem)

      const freshEvent = publishedEvents.find((eventItem) => {
        return String(eventItem.id) === String(joinedEventId)
      })

      if (!freshEvent) {
        return null
      }

      if (freshEvent.published === false) {
        return null
      }

      return {
        ...joinedItem,
        eventId: joinedEventId,
        event: freshEvent,
      }
    })
    .filter((joinedItem) => joinedItem !== null)

  const upcomingEvents = joinedEventsWithFreshData.slice(0, 3)

  if (!currentParticipant) {
    return null
  }

  return (
    <div className="dashboard">
      <div className="top-banner">
        <div className="status-row">
          <p className="mini-label">DOMOV</p>

          <img
            src={logo}
            alt="MiniEra Logo"
            className="dashboard-logo"
          />
        </div>

        <h1 className="main-title">MiniEra</h1>

        <div className="welcome-card">
          <div>
            <p className="small-date">
              {programInfo.programName}
            </p>

            <h3>
              Vitaj, {currentParticipant.name || 'účastník'}
            </h3>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{publishedEvents.length}</h2>
          <p>Aktivity</p>
        </div>

        <div className="stat-card">
          <h2>{joinedEventsWithFreshData.length}</h2>
          <p>Prihlásené</p>
        </div>

        <div className="stat-card">
          <h2>{programInfo.programDays}</h2>
          <p>Dni</p>
        </div>
      </div>

      <div className="action-grid">
        <Link to="/schedule" className="action-link">
          <div className="action-card dark-card">
            <p>Môj program</p>
          </div>
        </Link>

        <Link to="/events" className="action-link">
          <div className="action-card orange-card">
            <p>Aktivity</p>
          </div>
        </Link>
      </div>

      <div className="today-section">
        <div className="section-header">
          <h3>Moje najbližšie aktivity</h3>

          <Link to="/schedule" className="see-all-link">
            <p>Zobraziť všetko</p>
          </Link>
        </div>

        {isLoading ? (
          <div className="today-card">
            <div>
              <p className="event-time">Načítavam...</p>

              <h4>Načítavam tvoj program</h4>

              <p className="event-location">
                Aktivity sa načítavajú zo Supabase.
              </p>
            </div>

            <div className="event-tag blue-tag">
              INFO
            </div>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="today-card">
            <div>
              <p className="event-time">Zatiaľ bez aktivít</p>

              <h4>Tvoj program je prázdny</h4>

              <p className="event-location">
                Pridaj sa k aktivitám a zobrazia sa tu.
              </p>
            </div>

            <div className="event-tag blue-tag">
              INFO
            </div>
          </div>
        ) : (
          upcomingEvents.map((joinedItem) => (
            <Link
              to={`/event-detail/${joinedItem.event.id}`}
              state={{ eventItem: joinedItem.event }}
              key={joinedItem.event.id}
              className="dashboard-event-link"
            >
              <div className="today-card">
                <div>
                  <p className="event-time">
                    {joinedItem.event.time}
                  </p>

                  <h4>
                    {joinedItem.event.title}
                  </h4>

                  <p className="event-location">
                    {joinedItem.event.location}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard