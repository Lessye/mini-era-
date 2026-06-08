import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getStoredEvents } from '../utils/eventStorage'
import { getJoinedEvents } from '../utils/joinedEventsStorage'
import { getCurrentParticipant } from '../utils/participantLoginStorage'
import { getProgramInfo } from '../utils/programInfoStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'

function Dashboard() {
  const currentParticipant = getCurrentParticipant()
  const programInfo = getProgramInfo()
  const adminOptions = getAdminOptions()

  const storedEvents = getStoredEvents()
  const joinedEvents = getJoinedEvents()

  const publishedEvents = storedEvents.filter((eventItem) => {
    return eventItem.published !== false
  })

  const joinedEventsWithFreshData = joinedEvents
    .map((joinedItem) => {
      const freshEvent = storedEvents.find((eventItem) => {
        return eventItem.id === joinedItem.eventId
      })

      // If the event was deleted in admin, do not show the old backup data.
      if (!freshEvent) {
        return null
      }

      // If the event was hidden/unpublished in admin, remove it from dashboard.
      if (freshEvent.published === false) {
        return null
      }

      return {
        ...joinedItem,
        event: freshEvent,
      }
    })
    .filter((joinedItem) => joinedItem !== null)

  const upcomingEvents = joinedEventsWithFreshData.slice(0, 3)

  function getCategoryLabel(category) {
    const matchingCategory = adminOptions.eventCategories.find((categoryItem) => {
      return categoryItem.value === category || categoryItem.label === category
    })

    if (matchingCategory) {
      return matchingCategory.label
    }

    if (category === 'Lectures') return 'Prednáška'
    if (category === 'Workshops') return 'Workshop'
    if (category === 'Companies') return 'Firma'
    if (category === 'Social') return 'Social'

    return 'Aktivita'
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
              Vitaj, {currentParticipant?.name || 'účastník'}
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

        {upcomingEvents.length === 0 ? (
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
          upcomingEvents.map((joinedItem, index) => (
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

                <div
                  className={
                    index === 0
                      ? 'event-tag blue-tag'
                      : index === 1
                        ? 'event-tag green-tag'
                        : 'event-tag pink-tag'
                  }
                >
                  {index === 0
                    ? 'ĎALŠIE'
                    : getCategoryLabel(joinedItem.event.category)}
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