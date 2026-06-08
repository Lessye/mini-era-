import '../styles/dashboard.css'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getStoredEvents, saveStoredEvents } from '../utils/eventStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'
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
  const adminOptions = getAdminOptions()

  function getFreshClickedEvent() {
    const storedEvents = getStoredEvents()

    if (clickedEvent) {
      const freshEvent = storedEvents.find((eventItem) => {
        return String(eventItem.id) === String(clickedEvent.id)
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

  const initialEvent = getFreshClickedEvent()

  const [currentEvent, setCurrentEvent] = useState(initialEvent)
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false)
  const [joinPopupMessage, setJoinPopupMessage] = useState('')
  const [hasJoinedEvent, setHasJoinedEvent] = useState(
    initialEvent ? isEventJoined(initialEvent.id) : false
  )

  if (!currentEvent || currentEvent.published === false) {
    return (
      <div className="dashboard">
        <div className="detail-content">
          <div className="detail-info-box">
            <h3>Aktivita sa nenašla</h3>

            <p>
              Táto aktivita už neexistuje, nie je zverejnená alebo nebola
              správne načítaná.
            </p>

            <button
              className="main-cta-btn"
              onClick={() => navigate('/events')}
            >
              Späť na aktivity
            </button>
          </div>
        </div>
      </div>
    )
  }

  const capacity = Number(currentEvent.capacity) || 0
  const registered = Number(currentEvent.registered) || 0
  const isFull = capacity > 0 && registered >= capacity
  const spotsLeft = Math.max(capacity - registered, 0)

  const hasMapsUrl =
    currentEvent.mapsUrl && currentEvent.mapsUrl.trim() !== ''

  function getOptionLabel(optionsArray, savedValue) {
    if (!savedValue) {
      return ''
    }

    if (!Array.isArray(optionsArray)) {
      return savedValue
    }

    const matchedOption = optionsArray.find((optionItem) => {
      if (typeof optionItem === 'string') {
        return optionItem === savedValue
      }

      return (
        optionItem.value === savedValue ||
        optionItem.label === savedValue ||
        optionItem.name === savedValue ||
        optionItem.title === savedValue
      )
    })

    if (!matchedOption) {
      return savedValue
    }

    if (typeof matchedOption === 'string') {
      return matchedOption
    }

    return (
      matchedOption.label ||
      matchedOption.name ||
      matchedOption.title ||
      matchedOption.value ||
      savedValue
    )
  }

  function getCategoryLabel(category) {
    const dynamicLabel = getOptionLabel(adminOptions.eventCategories, category)

    if (dynamicLabel && dynamicLabel !== category) {
      return dynamicLabel.toUpperCase()
    }

    if (category === 'Lectures') return 'PREDNÁŠKA'
    if (category === 'Workshops') return 'WORKSHOP'
    if (category === 'Companies') return 'COMPANY VISIT'
    if (category === 'Social') return 'SOCIAL'

    return category ? category.toUpperCase() : 'AKTIVITA'
  }

  function getProgramLabel(program) {
    return getOptionLabel(adminOptions.programs, program)
  }

  function getLocationLabel(locationValue) {
    return getOptionLabel(adminOptions.locations, locationValue)
  }

  function getOrganizerLabel(organizerValue) {
  if (!organizerValue) {
    return ''
  }

  const dynamicLabel = getOptionLabel(adminOptions.locations, organizerValue)

  if (dynamicLabel && dynamicLabel !== organizerValue) {
    return dynamicLabel
  }

  if (organizerValue.includes('Comenius University')) {
    const matchingOrganizer = adminOptions.locations.find((locationItem) => {
      return locationItem.includes('Komenského')
    })

    if (matchingOrganizer) {
      return matchingOrganizer
    }
  }

  return organizerValue
}

function getDayLabel(dayValue) {
  if (!dayValue) {
    return ''
  }

  if (dayValue === 'Day 1') return 'Deň 1'
  if (dayValue === 'Day 2') return 'Deň 2'
  if (dayValue === 'Day 3') return 'Deň 3'
  if (dayValue === 'Day 4') return 'Deň 4'

  return dayValue
}
  function openGoogleMaps() {
    if (!hasMapsUrl) {
      return
    }

    window.open(currentEvent.mapsUrl, '_blank', 'noopener,noreferrer')
  }

  function updateStoredEventCapacity(newRegisteredNumber) {
    const storedEvents = getStoredEvents()

    const updatedEvents = storedEvents.map((eventItem) => {
      if (String(eventItem.id) === String(currentEvent.id)) {
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
      setJoinPopupMessage('Táto aktivita je už obsadená.')
      setShowJoinConfirmation(true)
      return
    }

    if (hasJoinedEvent) {
      const removeResult = removeJoinedEvent(currentEvent.id)

      if (!removeResult.success) {
        setJoinPopupMessage('Táto aktivita nie je v tvojom osobnom programe.')
        setShowJoinConfirmation(true)
        return
      }

      const newRegisteredNumber = Math.max(registered - 1, 0)

      updateStoredEventCapacity(newRegisteredNumber)

      setCurrentEvent({
        ...currentEvent,
        registered: newRegisteredNumber,
      })

      setHasJoinedEvent(false)
      setJoinPopupMessage(
        'Účasť bola zrušená. Aktivita bola odstránená z tvojho osobného programu.'
      )
      setShowJoinConfirmation(true)

      return
    }

    const joinResult = addJoinedEvent(currentEvent)

    if (!joinResult.success && joinResult.message === 'already_joined') {
      setHasJoinedEvent(true)
      setJoinPopupMessage(
        'Už si prihlásený/á. Táto aktivita je už v tvojom osobnom programe.'
      )
      setShowJoinConfirmation(true)
      return
    }

    const newRegisteredNumber = registered + 1

    updateStoredEventCapacity(newRegisteredNumber)

    setCurrentEvent({
      ...currentEvent,
      registered: newRegisteredNumber,
    })

    setHasJoinedEvent(true)
    setJoinPopupMessage(
      'Hotovo. Aktivita bola pridaná do tvojho osobného programu.'
    )
    setShowJoinConfirmation(true)
  }

  const programLabel = getProgramLabel(currentEvent.program)
  const locationLabel = getLocationLabel(currentEvent.location)
  const organizerLabel = getOrganizerLabel(currentEvent.organizer)
  const dayLabel = getDayLabel(currentEvent.day)

  return (
    <div className="dashboard">
      <div className="detail-hero">
        <div className="detail-overlay">
          <button
            className="back-home"
            onClick={() => navigate(-1)}
          >
            ← Späť
          </button>

          <p className="mini-label">
            {getCategoryLabel(currentEvent.category)}
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
              <p>DÁTUM</p>
              <h4>{currentEvent.date || currentEvent.day}</h4>
            </div>

            <div className="detail-meta-card">
              <p>ČAS</p>
              <h4>{currentEvent.time || 'TBA'}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        {currentEvent.image && currentEvent.image.trim() !== '' && (
          <div className="detail-image-wrap">
            <img
              src={currentEvent.image}
              alt={currentEvent.title}
              className="detail-event-image"
            />
          </div>
        )}

        <div className="detail-info-box">
          <h3>O aktivite</h3>

          <p>
            {currentEvent.description ||
              'Viac informácií o tejto aktivite bude doplnených organizátorom.'}
          </p>
        </div>

        {(programLabel || organizerLabel || dayLabel) && (
  <div className="detail-info-box">
    <h3>Informácie</h3>

    {programLabel && (
      <p>
        <strong>Program:</strong> {programLabel}
      </p>
    )}

    {organizerLabel && (
      <p>
        <strong>Organizátor:</strong> {organizerLabel}
      </p>
    )}

    {dayLabel && (
      <p>
        <strong>Deň:</strong> {dayLabel}
      </p>
    )}
  </div>
)}

        <div className="detail-info-box">
          <h3>Kapacita</h3>

          <p>
            {capacity === 0
              ? 'Kapacita zatiaľ nebola nastavená.'
              : spotsLeft > 0
                ? `${spotsLeft} voľných miest`
                : 'Táto aktivita je obsadená'}
          </p>

          {capacity > 0 && (
            <p className="join-confirmation-small">
              {registered} / {capacity} prihlásených účastníkov
            </p>
          )}
        </div>

        <div className="detail-info-box">
          <h3>Miesto</h3>

          <div className="location-action-card">
            <div className="location-icon-box">
              📍
            </div>

            <div className="location-card-content">
              <p className="location-card-label">Miesto aktivity</p>

              <h4>
                {locationLabel || currentEvent.location || 'Miesto bude doplnené'}
              </h4>

              <p className="location-card-note">
                {hasMapsUrl
                  ? 'Otvorí lokalitu v Google Maps.'
                  : 'Navigačný odkaz zatiaľ nebol pridaný.'}
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
            {hasMapsUrl ? 'Otvoriť v Google Maps' : 'Navigácia nie je dostupná'}
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
              ? 'Zrušiť účasť'
              : 'Pridať sa'}
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
              Rozumiem
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetail