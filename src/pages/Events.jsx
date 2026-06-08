import '../styles/dashboard.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import { getProgramInfo } from '../utils/programInfoStorage'
import { refreshCurrentParticipant } from '../utils/participantLoginStorage'
import { getSupabasePublishedEvents } from '../utils/supabaseEventStorage'
import {
  addSupabaseJoinedEvent,
  removeSupabaseJoinedEvent,
  getSupabaseJoinedEvents,
} from '../utils/supabaseJoinedEventsStorage'

function Events() {
  const location = useLocation()
  const navigate = useNavigate()

  const programInfo = getProgramInfo()

  const [activeDay, setActiveDay] = useState('Day 1')
  const [activeFilter, setActiveFilter] = useState('All')
  const [events, setEvents] = useState([])
  const [adminOptions, setAdminOptions] = useState(getAdminOptions())
  const [joinedEventIds, setJoinedEventIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEventsPageData()
  }, [location.pathname, location.key])

  async function loadEventsPageData() {
    setIsLoading(true)

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    const supabaseEvents = await getSupabasePublishedEvents()
    const joinedItems = await getSupabaseJoinedEvents()

    const joinedIds = joinedItems.map((joinedItem) => {
      return joinedItem.eventId
    })

    setEvents(supabaseEvents)
    setJoinedEventIds(joinedIds)
    setAdminOptions(getAdminOptions())
    setIsLoading(false)
  }

  async function loadPublishedEvents() {
    const supabaseEvents = await getSupabasePublishedEvents()

    setEvents(supabaseEvents)
  }

  async function loadJoinedEvents() {
    const joinedItems = await getSupabaseJoinedEvents()

    const joinedIds = joinedItems.map((joinedItem) => {
      return joinedItem.eventId
    })

    setJoinedEventIds(joinedIds)
  }

  const categoryFilters = [
    'All',
    ...(adminOptions.eventCategories || []),
  ]

  function getCategoryLabel(category) {
    if (category === 'Lectures') return 'Prednášky'
    if (category === 'Workshops') return 'Workshopy'
    if (category === 'Companies') return 'Company visits'
    if (category === 'Social') return 'Social'

    return category
  }

  const filteredEvents = events.filter((eventItem) => {
    const eventCategory = getCategoryLabel(eventItem.category)

    const matchesDay = eventItem.day === activeDay
    const matchesFilter =
      activeFilter === 'All' || eventCategory === activeFilter

    return matchesDay && matchesFilter
  })

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

  async function handleToggleJoin(eventItem, event) {
    event.stopPropagation()

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    const alreadyJoined = joinedEventIds.includes(eventItem.id)
    const spotsLeft = Number(eventItem.capacity) - Number(eventItem.registered)
    const isFull = spotsLeft <= 0

    if (!alreadyJoined && isFull) {
      return
    }

    let result

    if (alreadyJoined) {
      result = await removeSupabaseJoinedEvent(eventItem.id)
    } else {
      result = await addSupabaseJoinedEvent(eventItem)
    }

    if (!result.success) {
      alert('Zmena účasti sa nepodarila. Skús to znova.')
      return
    }

    await loadJoinedEvents()
    await loadPublishedEvents()
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

      {isLoading && (
        <div className="empty-events-card">
          <h3>Načítavam aktivity...</h3>

          <p>
            Aktivity sa načítavajú zo Supabase.
          </p>
        </div>
      )}

      {!isLoading && filteredEvents.length === 0 && (
        <div className="empty-events-card">
          <h3>Žiadne aktivity</h3>

          <p>
            Pre tento deň alebo kategóriu zatiaľ nie sú zverejnené žiadne aktivity.
          </p>
        </div>
      )}

      {!isLoading && filteredEvents.map((eventItem) => {
        const spotsLeft =
          Number(eventItem.capacity) - Number(eventItem.registered)

        const isFull = spotsLeft <= 0
        const alreadyJoined = joinedEventIds.includes(eventItem.id)

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