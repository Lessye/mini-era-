import '../styles/dashboard.css'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProgramInfo } from '../utils/programInfoStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import { refreshCurrentParticipant } from '../utils/participantLoginStorage'
import { getSupabasePublishedEvents } from '../utils/supabaseEventStorage'
import { getSupabaseJoinedEvents } from '../utils/supabaseJoinedEventsStorage'

function Schedule() {
  const navigate = useNavigate()

  const [activeDay, setActiveDay] = useState(1)
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const programInfo = getProgramInfo()
  const adminOptions = getAdminOptions()

  useEffect(() => {
    loadScheduleEvents()
  }, [])

  async function loadScheduleEvents() {
    setIsLoading(true)

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    const publishedEvents = await getSupabasePublishedEvents()
    const supabaseJoinedEvents = await getSupabaseJoinedEvents()

    setEvents(publishedEvents)
    setJoinedEvents(supabaseJoinedEvents)
    setIsLoading(false)
  }

  const joinedEventsWithFreshData = joinedEvents
    .map((joinedItem) => {
      const freshEvent = events.find((eventItem) => {
        return String(eventItem.id) === String(joinedItem.eventId)
      })

      if (!freshEvent) {
        return null
      }

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

  function getProgramLabel(program) {
    if (!program) {
      return ''
    }

    if (!Array.isArray(adminOptions.programs)) {
      return program
    }

    const matchingProgram = adminOptions.programs.find((programItem) => {
      if (typeof programItem === 'string') {
        return programItem === program
      }

      return programItem.value === program || programItem.label === program
    })

    if (!matchingProgram) {
      return program
    }

    if (typeof matchingProgram === 'string') {
      return matchingProgram
    }

    return matchingProgram.label || matchingProgram.value || program
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
        {isLoading ? (
          <div className="detail-info-box">
            <h3>Načítavam program...</h3>

            <p>
              Tvoj osobný program sa načítava zo Supabase.
            </p>
          </div>
        ) : filteredJoinedEvents.length === 0 ? (
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