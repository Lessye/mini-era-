const JOINED_EVENTS_KEY = 'miniEraJoinedEvents'
const CURRENT_PARTICIPANT_EMAIL_KEY = 'miniEraCurrentParticipantEmail'

export function getCurrentParticipantEmail() {
  const savedEmail = localStorage.getItem(CURRENT_PARTICIPANT_EMAIL_KEY)

  if (savedEmail) {
    return savedEmail
  }

  const demoEmail = 'participant@miniera.com'
  localStorage.setItem(CURRENT_PARTICIPANT_EMAIL_KEY, demoEmail)

  return demoEmail
}

export function getAllJoinedEvents() {
  const savedJoinedEvents = localStorage.getItem(JOINED_EVENTS_KEY)

  if (!savedJoinedEvents) {
    return []
  }

  return JSON.parse(savedJoinedEvents)
}

export function getJoinedEvents() {
  const participantEmail = getCurrentParticipantEmail()
  const allJoinedEvents = getAllJoinedEvents()

  return allJoinedEvents.filter(
    (joinedItem) => joinedItem.participantEmail === participantEmail
  )
}

export function isEventJoined(eventId) {
  const participantEmail = getCurrentParticipantEmail()
  const allJoinedEvents = getAllJoinedEvents()

  return allJoinedEvents.some(
    (joinedItem) =>
      joinedItem.participantEmail === participantEmail &&
      joinedItem.eventId === eventId
  )
}

export function addJoinedEvent(eventItem) {
  const participantEmail = getCurrentParticipantEmail()
  const allJoinedEvents = getAllJoinedEvents()

  const alreadyJoined = allJoinedEvents.some(
    (joinedItem) =>
      joinedItem.participantEmail === participantEmail &&
      joinedItem.eventId === eventItem.id
  )

  if (alreadyJoined) {
    return {
      success: false,
      message: 'already_joined',
    }
  }

  const newJoinedEvent = {
    participantEmail,
    eventId: eventItem.id,
    event: eventItem,
    joinedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    JOINED_EVENTS_KEY,
    JSON.stringify([...allJoinedEvents, newJoinedEvent])
  )

  return {
    success: true,
    message: 'joined',
  }
}

export function removeJoinedEvent(eventId) {
  const participantEmail = getCurrentParticipantEmail()
  const allJoinedEvents = getAllJoinedEvents()

  const eventExists = allJoinedEvents.some(
    (joinedItem) =>
      joinedItem.participantEmail === participantEmail &&
      joinedItem.eventId === eventId
  )

  if (!eventExists) {
    return {
      success: false,
      message: 'not_joined',
    }
  }

  const updatedJoinedEvents = allJoinedEvents.filter(
    (joinedItem) =>
      !(
        joinedItem.participantEmail === participantEmail &&
        joinedItem.eventId === eventId
      )
  )

  localStorage.setItem(
    JOINED_EVENTS_KEY,
    JSON.stringify(updatedJoinedEvents)
  )

  return {
    success: true,
    message: 'removed',
  }
}