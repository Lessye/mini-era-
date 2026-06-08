import '../styles/dashboard.css'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getStoredEvents, saveStoredEvents } from '../utils/eventStorage'
import {
  addJoinedEvent,
  removeJoinedEvent,
  isEventJoined,
} from '../utils/joinedEventsStorage'

function EventDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { eventId } = useParams()

  const clickedEvent = location.state?.eventItem

function getFreshClickedEvent() {
  const storedEvents = getStoredEvents()

  if (clickedEvent) {
    const freshEvent = storedEvents.find((eventItem) => {
      return eventItem.id === clickedEvent.id
    })

    return freshEvent || clickedEvent
  }

  if (eventId) {
    const freshEvent = storedEvents.find((eventItem) => {
      return String(eventItem.id) === String(eventId)
    })

    return freshEvent || null
  }

  return null
}

const [currentEvent, setCurrentEvent] = useState(getFreshClickedEvent())


  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false)
  const [joinPopupMessage, setJoinPopupMessage] = useState('')
  const [hasJoinedEvent, setHasJoinedEvent] = useState(
    clickedEvent ? isEventJoined(clickedEvent.id) : false
  )

  if (!currentEvent) {
    return (
      <div className="dashboard">
        <div className="detail-content">
          <div className="detail-info-box">
            <h3>Event not found</h3>
            <p>Please go back and choose an event again.</p>

            <button
              className="main-cta-btn"
              onClick={() => navigate('/events')}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isFull = Number(currentEvent.registered) >= Number(currentEvent.capacity)
  const spotsLeft = Number(currentEvent.capacity) - Number(currentEvent.registered)
  const hasMapsUrl = currentEvent.mapsUrl && currentEvent.mapsUrl.trim() !== ''

  function openGoogleMaps() {
    if (!hasMapsUrl) {
      return
    }

    window.open(currentEvent.mapsUrl, '_blank', 'noopener,noreferrer')
  }

  function updateStoredEventCapacity(newRegisteredNumber) {
    const storedEvents = getStoredEvents()

    const updatedEvents = storedEvents.map((eventItem) => {
      if (eventItem.id === currentEvent.id) {
        return {
          ...eventItem,
          registered: newRegisteredNumber,
        }
      }

      return eventItem
    })

    saveStoredEvents(updatedEvents)
  }

  function handleJoinEvent() {
    if (!currentEvent) {
      return
    }

    if (!hasJoinedEvent && isFull) {
      setJoinPopupMessage('This event is already full.')
      setShowJoinConfirmation(true)
      return
    }

    if (hasJoinedEvent) {
      const removeResult = removeJoinedEvent(currentEvent.id)

      if (!removeResult.success) {
        setJoinPopupMessage('This event is not in your personal schedule.')
        setShowJoinConfirmation(true)
        return
      }

      const newRegisteredNumber = Math.max(
        Number(currentEvent.registered) - 1,
        0
      )

      updateStoredEventCapacity(newRegisteredNumber)

      setCurrentEvent({
        ...currentEvent,
        registered: newRegisteredNumber,
      })

      setHasJoinedEvent(false)
      setJoinPopupMessage(
        'Event cancelled — it was removed from your personal schedule.'
      )
      setShowJoinConfirmation(true)

      return
    }

    const joinResult = addJoinedEvent(currentEvent)

    if (!joinResult.success && joinResult.message === 'already_joined') {
      setHasJoinedEvent(true)
      setJoinPopupMessage(
        'Already joined — this event is already in your personal schedule.'
      )
      setShowJoinConfirmation(true)
      return
    }

    const newRegisteredNumber = Number(currentEvent.registered) + 1

    updateStoredEventCapacity(newRegisteredNumber)

    setCurrentEvent({
      ...currentEvent,
      registered: newRegisteredNumber,
    })

    setHasJoinedEvent(true)
    setJoinPopupMessage(
      'Joined successfully — this event was added to your personal schedule.'
    )
    setShowJoinConfirmation(true)
  }

  return (
    <div className="dashboard">
      <div className="detail-hero">
        <div className="detail-overlay">
          <button
            className="back-home"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <p className="mini-label">
            {currentEvent.category || 'EVENT'}
          </p>

          <h1 className="detail-title">
            {currentEvent.title}
          </h1>

          <img
            src={logo}
            alt="MiniEra Logo"
            className="dashboard-logo"
          />

          <div className="detail-meta-row">
            <div className="detail-meta-card">
              <p>DATE</p>
              <h4>{currentEvent.date || currentEvent.day}</h4>
            </div>

            <div className="detail-meta-card">
              <p>TIME</p>
              <h4>{currentEvent.time}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-info-box">
          <h3>About Event</h3>

          <p>
            {currentEvent.description ||
              'More information about this activity will be added soon.'}
          </p>
        </div>

        <div className="detail-info-box">
          <h3>Capacity</h3>

          <p>
            {spotsLeft > 0
              ? `${spotsLeft} spots left`
              : 'This event is fully booked'}
          </p>

          <p className="join-confirmation-small">
            {currentEvent.registered} / {currentEvent.capacity} participants registered
          </p>
        </div>

        <div className="detail-info-box">
          <h3>Location</h3>

          <div className="location-action-card">
            <div className="location-icon-box">
              📍
            </div>

            <div className="location-card-content">
              <p className="location-card-label">Event location</p>

              <h4>
                {currentEvent.location}
              </h4>

              <p className="location-card-note">
                {hasMapsUrl
                  ? 'Opens the organizer’s Google Maps location.'
                  : 'Navigation link has not been added yet.'}
              </p>
            </div>
          </div>

          <button
            className={
              hasMapsUrl
                ? 'maps-action-btn'
                : 'maps-action-btn disabled-map-btn'
            }
            onClick={openGoogleMaps}
            disabled={!hasMapsUrl}
          >
            {hasMapsUrl ? 'Open in Google Maps' : 'Navigation unavailable'}
          </button>
        </div>

        <button
          className={
            isFull && !hasJoinedEvent
              ? 'main-cta-btn full-btn'
              : hasJoinedEvent
                ? 'main-cta-btn cancel-event-btn'
                : 'main-cta-btn'
          }
          disabled={isFull && !hasJoinedEvent}
          onClick={handleJoinEvent}
        >
          {isFull && !hasJoinedEvent
            ? 'Obsadené'
            : hasJoinedEvent
              ? 'Cancel Event'
              : 'Join Event'}
        </button>
      </div>

      {showJoinConfirmation && (
        <div className="join-confirmation-overlay">
          <div className="join-confirmation-card">
            <div className="join-confirmation-icon">
              {hasJoinedEvent ? '✓' : '–'}
            </div>

            <h2>MiniEra</h2>

            <p>
              {joinPopupMessage}
            </p>

            <p className="join-confirmation-small">
              {currentEvent.title}
            </p>

            <button
              className="main-cta-btn"
              onClick={() => setShowJoinConfirmation(false)}
            >
              Great
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetail