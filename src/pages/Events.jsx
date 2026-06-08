import '../styles/dashboard.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStoredEvents, saveStoredEvents } from '../utils/eventStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import {
  addJoinedEvent,
  removeJoinedEvent,
  isEventJoined,
} from '../utils/joinedEventsStorage'
import { getProgramInfo } from '../utils/programInfoStorage'

function Events() {
  const location = useLocation()
  const navigate = useNavigate()

  const programInfo = getProgramInfo()

  const [activeDay, setActiveDay] = useState('Day 1')
  const [activeFilter, setActiveFilter] = useState('All')
  const [events, setEvents] = useState([])
  const [adminOptions, setAdminOptions] = useState(getAdminOptions())

  useEffect(() => {
    const storedEvents = getStoredEvents()
    const storedAdminOptions = getAdminOptions()

    setEvents(storedEvents)
    setAdminOptions(storedAdminOptions)
  }, [location.pathname, location.key])

  const categoryFilters = [
    'All',
    ...(adminOptions.eventCategories || []),
  ]

  const publishedEvents = events.filter((eventItem) => {
    return eventItem.published !== false
  })

  const filteredEvents = publishedEvents.filter((eventItem) => {
    const eventCategory = getCategoryLabel(eventItem.category)

    const matchesDay = eventItem.day === activeDay
    const matchesFilter =
      activeFilter === 'All' || eventCategory === activeFilter

    return matchesDay && matchesFilter
  })

  function getCategoryLabel(category) {
    if (category === 'Lectures') return 'Prednášky'
    if (category === 'Workshops') return 'Workshopy'
    if (category === 'Companies') return 'Company visits'
    if (category === 'Social') return 'Social'

    return category
  }

  function getEventGradient(category) {
    const categoryLabel = getCategoryLabel(category).toLowerCase()

    if (categoryLabel.includes('social')) return 'pink-gradient'
    if (categoryLabel.includes('prednáš')) return 'purple-gradient'
    if (categoryLabel.includes('workshop')) return 'green-gradient'
    if (categoryLabel.includes('company')) return 'orange-event-gradient'
    if (categoryLabel.includes('firm')) return 'orange-event-gradient'
    if (categoryLabel.includes('campus')) return 'green-gradient'

    return 'purple-gradient'
  }

  function getFilterLabel(filter) {
    if (filter === 'All') return 'Všetko'

    return filter
  }

  function getDayLabel(day) {
    if (day === 'Day 1') return 'Deň 1'
    if (day === 'Day 2') return 'Deň 2'
    if (day === 'Day 3') return 'Deň 3'
    if (day === 'Day 4') return 'Deň 4'

    return day
  }

  function openEventDetail(eventItem) {
    navigate(`/event-detail/${eventItem.id}`, {
      state: { eventItem },
    })
  }

  function handleToggleJoin(eventItem, event) {
    event.stopPropagation()

    const alreadyJoined = isEventJoined(eventItem.id)
    const spotsLeft = Number(eventItem.capacity) - Number(eventItem.registered)
    const isFull = spotsLeft <= 0

    if (!alreadyJoined && isFull) {
      return
    }

    let newRegisteredNumber = Number(eventItem.registered)

    if (alreadyJoined) {
      const removeResult = removeJoinedEvent(eventItem.id)

      if (!removeResult.success) {
        return
      }

      newRegisteredNumber = Math.max(Number(eventItem.registered) - 1, 0)
    } else {
      const joinResult = addJoinedEvent(eventItem)

      if (!joinResult.success) {
        return
      }

      newRegisteredNumber = Number(eventItem.registered) + 1
    }

    const updatedEvents = events.map((storedEvent) => {
      if (storedEvent.id === eventItem.id) {
        return {
          ...storedEvent,
          registered: newRegisteredNumber,
        }
      }

      return storedEvent
    })

    saveStoredEvents(updatedEvents)
    setEvents(updatedEvents)
  }

  return (
    <div className="dashboard">
      <div className="top-banner">
        <div className="events-header-row">
          <div>
            <p className="mini-label">MINIERA</p>

            <h1 className="events-title">
              {programInfo.city}, {programInfo.country}
            </h1>
          </div>

          <div className="date-box">
            <p>{programInfo.monthLabel}</p>
            <h3>{programInfo.startDate} — {programInfo.endDate}</h3>
          </div>
        </div>

        <div className="day-tabs">
          {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map((day) => (
            <div
              key={day}
              className={activeDay === day ? 'active-day' : ''}
              onClick={() => setActiveDay(day)}
            >
              {getDayLabel(day)}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-row">
        {categoryFilters.map((filter) => (
          <div
            key={filter}
            className={activeFilter === filter ? 'active-filter' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {getFilterLabel(filter)}
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="empty-events-card">
          <h3>Žiadne aktivity</h3>

          <p>
            Pre tento deň alebo kategóriu zatiaľ nie sú zverejnené žiadne aktivity.
          </p>
        </div>
      )}

      {filteredEvents.map((eventItem) => {
        const spotsLeft =
          Number(eventItem.capacity) - Number(eventItem.registered)

        const isFull = spotsLeft <= 0
        const alreadyJoined = isEventJoined(eventItem.id)

        const hasImage =
          eventItem.image && eventItem.image.trim() !== ''

        return (
          <div
            key={eventItem.id}
            className={`event-large-card ${getEventGradient(eventItem.category)}`}
            onClick={() => openEventDetail(eventItem)}
          >
            <div
              className={
                hasImage
                  ? 'event-large-top'
                  : 'event-large-top event-image-placeholder'
              }
              style={
                hasImage
                  ? {
                      backgroundImage: `url(${eventItem.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            ></div>

            <div className="event-large-content">
              <p className="event-time">
                {eventItem.time}
              </p>

              <h3>
                {eventItem.title}
              </h3>

              <p className="event-location">
                {eventItem.location}
              </p>

              {eventItem.program && (
                <p className="event-program-label">
                  {eventItem.program}
                </p>
              )}

              <p className="event-capacity">
                Kapacita: {Number(eventItem.registered) || 0}/{Number(eventItem.capacity) || 0}
              </p>

              <p className={isFull ? 'spots-left-text full-text' : 'spots-left-text'}>
                {isFull ? 'Obsadené' : `${spotsLeft} voľných miest`}
              </p>

              <div className="event-card-actions">
                <button
                  className="event-details-link"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openEventDetail(eventItem)
                  }}
                >
                  Viac info
                </button>

                <button
                  className={
                    isFull && !alreadyJoined
                      ? 'join-btn full-btn'
                      : alreadyJoined
                        ? 'join-btn cancel-event-btn'
                        : 'join-btn dark-btn'
                  }
                  disabled={isFull && !alreadyJoined}
                  onClick={(event) => handleToggleJoin(eventItem, event)}
                >
                  {isFull && !alreadyJoined
                    ? 'Obsadené'
                    : alreadyJoined
                      ? 'Zrušiť účasť'
                      : 'Pridať sa'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Events