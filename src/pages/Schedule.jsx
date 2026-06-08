import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getStoredEvents } from '../utils/eventStorage'
import { getJoinedEvents } from '../utils/joinedEventsStorage'
import { getProgramInfo } from '../utils/programInfoStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'

function Schedule() {
  const [activeDay, setActiveDay] = useState(1)

  const programInfo = getProgramInfo()
  const adminOptions = getAdminOptions()

  const storedEvents = getStoredEvents()
  const joinedEvents = getJoinedEvents()

  const joinedEventsWithFreshData = joinedEvents
    .map((joinedItem) => {
      const freshEvent = storedEvents.find((eventItem) => {
        return eventItem.id === joinedItem.eventId
      })

      // IMPORTANT:
      // If the original event was deleted from admin, return null.
      // We do NOT want to keep showing the old joinedItem.event backup.
      if (!freshEvent) {
        return null
      }

      // IMPORTANT:
      // If the event was hidden/unpublished in admin, return null.
      // This removes it from the participant schedule.
      if (freshEvent.published === false) {
        return null
      }

      return {
        ...joinedItem,
        event: freshEvent,
      }
    })
    .filter((joinedItem) => joinedItem !== null)

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

  function getProgramLabel(program) {
    if (!program) {
      return ''
    }

    const matchingProgram = adminOptions.programs.find((programItem) => {
      return programItem.value === program || programItem.label === program
    })

    if (matchingProgram) {
      return matchingProgram.label
    }

    return program
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
              Môj program
            </h1>
          </div>

          <div className="date-box">
            <p>{programInfo.monthLabel}</p>
            <h3>{programInfo.startDate} — {programInfo.endDate}</h3>
          </div>
        </div>

        <div className="day-tabs">
          {[1, 2, 3, 4].map((day) => (
            <div
              key={day}
              className={activeDay === day ? 'active-day' : ''}
              onClick={() => setActiveDay(day)}
            >
              Deň {day}
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-list">
        {filteredJoinedEvents.length === 0 ? (
          <div className="detail-info-box">
            <h3>Žiadne aktivity v tomto dni</h3>

            <p>
              Aktivity, ku ktorým sa pridáš, sa zobrazia tu v tvojom osobnom programe.
              Ak organizátor aktivitu skryje alebo vymaže, automaticky zmizne aj odtiaľto.
            </p>

            <Link to="/events">
              <button className="main-cta-btn">
                Prezrieť aktivity
              </button>
            </Link>
          </div>
        ) : (
          filteredJoinedEvents.map((joinedItem) => {
            return (
              <Link
                to={`/event-detail/${joinedItem.event.id}`}
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

                      {joinedItem.event.program && (
                        <p className="schedule-program">
                          Program: {getProgramLabel(joinedItem.event.program)}
                        </p>
                      )}
                    </div>

                    <span className="schedule-tag">
                      {getCategoryLabel(joinedItem.event.category)}
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