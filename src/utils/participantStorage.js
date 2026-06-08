import defaultParticipants from '../data/defaultParticipants'

const STORAGE_KEY = 'miniEraParticipants'

export function getStoredParticipants() {
  const savedParticipants = localStorage.getItem(STORAGE_KEY)

  if (savedParticipants) {
    return JSON.parse(savedParticipants)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultParticipants))
  return defaultParticipants
}

export function saveStoredParticipants(participants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants))
}

export function resetStoredParticipants() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultParticipants))
  return defaultParticipants
}