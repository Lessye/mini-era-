import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getStoredEvents } from '../utils/eventStorage'
import { getJoinedEvents } from '../utils/joinedEventsStorage'

function Dashboard() {
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

      return {
        ...joinedItem,
        event: freshEvent || joinedItem.event,
      }
    })
    .filter((joinedItem) => joinedItem.event)

  const upcomingEvents = joinedEventsWithFreshData.slice(0, 3)

  return (
    <div className="dashboard">
      <div className="top-banner">
        <div className="status-row">
          <p className="mini-label">DASHBOARD</p>

          <img
            src={logo}
            alt="MiniEra Logo"
            className="dashboard-logo"
          />
        </div>

        <h1 className="main-title">MiniEra</h1>

        <div className="welcome-card">
          <div>
            <p className="small-date">SUNDAY, MAR 30</p>
            <h3>Welcome Day</h3>
          </div>

          <div className="day-counter">
            <h2>1/4</h2>
            <p>DAY</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{publishedEvents.length}</h2>
          <p>Total Events</p>
        </div>

        <div className="stat-card">
          <h2>{joinedEventsWithFreshData.length}</h2>
          <p>Attending</p>
        </div>

        <div className="stat-card">
          <h2>0</h2>
          <p>Completed</p>
        </div>
      </div>

      <div className="action-grid">
        <Link to="/schedule" className="action-link">
          <div className="action-card dark-card">
            <p>Full Schedule</p>
          </div>
        </Link>

        <Link to="/events" className="action-link">
          <div className="action-card orange-card">
            <p>Browse Events</p>
          </div>
        </Link>
      </div>

      <div className="today-section">
        <div className="section-header">
          <h3>My Upcoming Events</h3>

          <Link to="/schedule" className="see-all-link">
            <p>See All</p>
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="today-card">
            <div>
              <p className="event-time">No events yet</p>
              <h4>Your schedule is empty</h4>
              <p className="event-location">
                Join events to see them here.
              </p>
            </div>

            <div className="event-tag blue-tag">
              INFO
            </div>
          </div>
        ) : (
          upcomingEvents.map((joinedItem, index) => (
            <Link
              to="/event-detail"
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
                    ? 'NEXT'
                    : joinedItem.event.category || 'EVENT'}
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