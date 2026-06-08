import defaultEvents from '../data/defaultEvents'

const STORAGE_KEY = 'miniEraEvents'

export function getStoredEvents() {
  const savedEvents = localStorage.getItem(STORAGE_KEY)

  if (savedEvents) {
    return JSON.parse(savedEvents)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents))
  return defaultEvents
}

export function saveStoredEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export function resetStoredEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents))
  return defaultEvents
}