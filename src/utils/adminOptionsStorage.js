import defaultAdminOptions from '../data/defaultAdminOptions'

const STORAGE_KEY = 'miniEraAdminOptions'

function normalizeAdminOptions(options) {
  return {
    ...defaultAdminOptions,
    ...options,
    groups: options?.groups || defaultAdminOptions.groups,
    programs: options?.programs || defaultAdminOptions.programs,
    locations: options?.locations || defaultAdminOptions.locations,
    eventCategories: options?.eventCategories || defaultAdminOptions.eventCategories,
    statuses: options?.statuses || defaultAdminOptions.statuses,
  }
}

export function getAdminOptions() {
  const savedOptions = localStorage.getItem(STORAGE_KEY)

  if (savedOptions) {
    try {
      const parsedOptions = JSON.parse(savedOptions)
      const normalizedOptions = normalizeAdminOptions(parsedOptions)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedOptions))
      return normalizedOptions
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminOptions))
      return defaultAdminOptions
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminOptions))
  return defaultAdminOptions
}

export function saveAdminOptions(options) {
  const normalizedOptions = normalizeAdminOptions(options)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedOptions))
}

export function resetAdminOptions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminOptions))
  return defaultAdminOptions
}