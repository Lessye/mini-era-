import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getStoredEvents } from '../utils/eventStorage'
import { getJoinedEvents } from '../utils/joinedEventsStorage'

function Schedule() {
  const [activeDay, setActiveDay] = useState(1)

  const storedEvents = getStoredEvents()
  const joinedEvents = getJoinedEvents()

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

  function getEventDayNumber(eventItem) {
    if (!eventItem.day) {
      return 1
    }

    if (typeof eventItem.day === 'number') {
      return eventItem.day
    }

    if (eventItem.day.includes('1')) {
      return 1
    }

    if (eventItem.day.includes('2')) {
      return 2
    }

    if (eventItem.day.includes('3')) {
      return 3
    }

    if (eventItem.day.includes('4')) {
      return 4
    }

    return 1
  }

  const filteredJoinedEvents = joinedEventsWithFreshData.filter((joinedItem) => {
    return getEventDayNumber(joinedItem.event) === activeDay
  })

  return (
    <div className="dashboard">
      <div className="top-banner">
        <div className="events-header-row">
          <div>
            <p className="mini-label">MINIERA</p>

            <h1 className="events-title">
              My Schedule
            </h1>
          </div>

          <div className="date-box">
            <p>JUN 2026</p>
            <h3>10.06 — 13.06</h3>
          </div>
        </div>

        <div className="day-tabs">
          {[1, 2, 3, 4].map((day) => (
            <div
              key={day}
              className={activeDay === day ? 'active-day' : ''}
              onClick={() => setActiveDay(day)}
            >
              Day {day}
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-list">
        {filteredJoinedEvents.length === 0 ? (
          <div className="detail-info-box">
            <h3>No joined events yet</h3>

            <p>
              Events you join will appear here in your personal schedule.
            </p>

            <Link to="/events">
              <button className="main-cta-btn">
                Browse Events
              </button>
            </Link>
          </div>
        ) : (
          filteredJoinedEvents.map((joinedItem) => {
            return (
              <Link
                to="/event-detail"
                state={{ eventItem: joinedItem.event }}
                key={joinedItem.eventId}
                className="schedule-link"
              >
                <div className="schedule-item">
                  <div className="schedule-dot"></div>

                  <div className="schedule-card-new">
                    <div>
                      <p className="schedule-time">
                        {joinedItem.event.time}
                      </p>

                      <h3>
                        {joinedItem.event.title}
                      </h3>

                      <p>
                        {joinedItem.event.location}
                      </p>
                    </div>

                    <span className="schedule-tag">
                      {joinedItem.event.category || 'Event'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Schedule