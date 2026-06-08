import '../styles/dashboard.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import event1 from '../assets/event1.jpg'
import event2 from '../assets/event2.jpg'
import { getStoredEvents, saveStoredEvents } from '../utils/eventStorage'
import {
  addJoinedEvent,
  removeJoinedEvent,
  isEventJoined,
} from '../utils/joinedEventsStorage'

function Events() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeDay, setActiveDay] = useState('Day 1')
  const [activeFilter, setActiveFilter] = useState('All')
  const [events, setEvents] = useState([])

  useEffect(() => {
    const storedEvents = getStoredEvents()
    setEvents(storedEvents)
  }, [location.pathname, location.key])

  const publishedEvents = events.filter((eventItem) => {
    return eventItem.published !== false
  })

  const filteredEvents = publishedEvents.filter((eventItem) => {
    const matchesDay = eventItem.day === activeDay
    const matchesFilter =
      activeFilter === 'All' || eventItem.category === activeFilter

    return matchesDay && matchesFilter
  })

  function getEventImage(index) {
    return index % 2 === 0 ? event1 : event2
  }

  function getEventGradient(category) {
    if (category === 'Social') return 'pink-gradient'
    if (category === 'Lectures') return 'purple-gradient'
    if (category === 'Workshops') return 'green-gradient'
    if (category === 'Companies') return 'orange-event-gradient'

    return 'purple-gradient'
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
              Bratislava, Slovakia
            </h1>
          </div>

          <div className="date-box">
            <p>JUN 2026</p>
            <h3>10.06 — 13.06</h3>
          </div>
        </div>

        <div className="day-tabs">
          {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map((day) => (
            <div
              key={day}
              className={activeDay === day ? 'active-day' : ''}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-row">
        {['All', 'Lectures', 'Workshops', 'Companies', 'Social'].map((filter) => (
          <div
            key={filter}
            className={activeFilter === filter ? 'active-filter' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
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

      {filteredEvents.map((eventItem, index) => {
        const spotsLeft =
          Number(eventItem.capacity) - Number(eventItem.registered)

        const isFull = spotsLeft <= 0
        const alreadyJoined = isEventJoined(eventItem.id)

        return (
          <div
            key={eventItem.id}
            className={`event-large-card ${getEventGradient(eventItem.category)}`}
            onClick={() => openEventDetail(eventItem)}
          >
            <div
              className="event-large-top"
              style={{
                backgroundImage: `url(${getEventImage(index)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
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

              <p className="event-capacity">
                Kapacita: {eventItem.registered}/{eventItem.capacity}
              </p>

              <p className={isFull ? 'spots-left-text full-text' : 'spots-left-text'}>
                {isFull ? 'Obsadené' : `${spotsLeft} spots left`}
              </p>

              <div className="event-card-actions">
  <p className="event-details-link">
    More Info 
  </p>

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
        ? 'Cancel Event'
        : 'Join Event'}
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