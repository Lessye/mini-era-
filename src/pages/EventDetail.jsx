import '../styles/dashboard.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import { refreshCurrentParticipant } from '../utils/participantLoginStorage'
import { getSupabaseEventById } from '../utils/supabaseEventStorage'
import {
  addSupabaseJoinedEvent,
  removeSupabaseJoinedEvent,
  isSupabaseEventJoined,
} from '../utils/supabaseJoinedEventsStorage'

function EventDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { eventId } = useParams()

  const clickedEvent = location.state?.eventItem
  const adminOptions = getAdminOptions()

  const [currentEvent, setCurrentEvent] = useState(clickedEvent || null)
  const [isLoading, setIsLoading] = useState(true)
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false)
  const [joinPopupMessage, setJoinPopupMessage] = useState('')
  const [hasJoinedEvent, setHasJoinedEvent] = useState(false)
  const [isSavingJoinChange, setIsSavingJoinChange] = useState(false)

  useEffect(() => {
    loadEventDetail()
  }, [eventId])

  async function loadEventDetail() {
    setIsLoading(true)

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    if (!eventId && clickedEvent) {
      const joinedStatus = await isSupabaseEventJoined(clickedEvent.id)

      setCurrentEvent(clickedEvent)
      setHasJoinedEvent(joinedStatus)
      setIsLoading(false)
      return
    }

    if (!eventId) {
      setCurrentEvent(null)
      setIsLoading(false)
      return
    }

    const freshEvent = await getSupabaseEventById(eventId)

    if (!freshEvent || freshEvent.published === false) {
      setCurrentEvent(null)
      setIsLoading(false)
      return
    }

    const joinedStatus = await isSupabaseEventJoined(freshEvent.id)

    setCurrentEvent(freshEvent)
    setHasJoinedEvent(joinedStatus)
    setIsLoading(false)
  }

  async function refreshEventAfterJoinChange(eventIdToRefresh) {
    if (!eventIdToRefresh) {
      return
    }

    const freshEvent = await getSupabaseEventById(eventIdToRefresh)

    if (!freshEvent || freshEvent.published === false) {
      setCurrentEvent(null)
      setHasJoinedEvent(false)
      return
    }

    const joinedStatus = await isSupabaseEventJoined(freshEvent.id)

    setCurrentEvent(freshEvent)
    setHasJoinedEvent(joinedStatus)
  }

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
    if (!currentEvent || !currentEvent.mapsUrl) {
      return
    }

    window.open(currentEvent.mapsUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleJoinEvent() {
    if (!currentEvent || isSavingJoinChange) {
      return
    }

    const participant = await refreshCurrentParticipant()

    if (!participant) {
      navigate('/login')
      return
    }

    const capacity = Number(currentEvent.capacity) || 0
    const registered = Number(currentEvent.registered) || 0
    const isFull = capacity > 0 && registered >= capacity

    if (!hasJoinedEvent && isFull) {
      setJoinPopupMessage('Táto aktivita je už obsadená.')
      setShowJoinConfirmation(true)
      return
    }

    setIsSavingJoinChange(true)

    if (hasJoinedEvent) {
      const result = await removeSupabaseJoinedEvent(currentEvent.id)

      if (!result.success) {
        setIsSavingJoinChange(false)
        setJoinPopupMessage('Účasť sa nepodarilo zrušiť. Skús to znova.')
        setShowJoinConfirmation(true)
        return
      }

      await refreshEventAfterJoinChange(currentEvent.id)

      setIsSavingJoinChange(false)
      setJoinPopupMessage(
        'Účasť bola zrušená. Aktivita bola odstránená z tvojho osobného programu.'
      )
      setShowJoinConfirmation(true)

      return
    }

    const result = await addSupabaseJoinedEvent(currentEvent)

    if (!result.success) {
      setIsSavingJoinChange(false)
      setJoinPopupMessage('Na aktivitu sa nepodarilo prihlásiť. Skús to znova.')
      setShowJoinConfirmation(true)
      return
    }

    await refreshEventAfterJoinChange(currentEvent.id)

    setIsSavingJoinChange(false)
    setJoinPopupMessage(
      'Hotovo. Aktivita bola pridaná do tvojho osobného programu.'
    )
    setShowJoinConfirmation(true)
  }

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="detail-content">
          <div className="detail-info-box">
            <h3>Načítavam aktivitu...</h3>

            <p>
              Detail aktivity sa načítava zo Supabase.
            </p>
          </div>
        </div>
      </div>
    )
  }

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
          disabled={isSavingJoinChange || (isFull && !hasJoinedEvent)}
          onClick={handleJoinEvent}
        >
          {isSavingJoinChange
            ? 'Ukladám...'
            : isFull && !hasJoinedEvent
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