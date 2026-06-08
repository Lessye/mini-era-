import defaultAdminOptions from '../data/defaultAdminOptions'

const STORAGE_KEY = 'miniEraAdminOptions'

export function getAdminOptions() {
  const savedOptions = localStorage.getItem(STORAGE_KEY)

  if (savedOptions) {
    return JSON.parse(savedOptions)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminOptions))
  return defaultAdminOptions
}

export function saveAdminOptions(options) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options))
}

export function resetAdminOptions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminOptions))
  return defaultAdminOptions
}