import { getSupabaseParticipantByEmail } from './supabaseParticipantStorage'

const CURRENT_PARTICIPANT_KEY = 'miniEraCurrentParticipant'

export function getCurrentParticipant() {
  const storedParticipant = localStorage.getItem(CURRENT_PARTICIPANT_KEY)

  if (!storedParticipant) {
    return null
  }

  try {
    return JSON.parse(storedParticipant)
  } catch (error) {
    localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
    return null
  }
}

export function getCurrentParticipantEmail() {
  const currentParticipant = getCurrentParticipant()

  if (!currentParticipant) {
    return ''
  }

  return currentParticipant.email || ''
}

export function saveCurrentParticipant(participant) {
  if (!participant) {
    return
  }

  localStorage.setItem(CURRENT_PARTICIPANT_KEY, JSON.stringify(participant))
}

export function logoutCurrentParticipant() {
  localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
}

export async function refreshCurrentParticipant() {
  const currentParticipant = getCurrentParticipant()

  if (!currentParticipant?.email) {
    return null
  }

  const freshParticipant = await getSupabaseParticipantByEmail(
    currentParticipant.email
  )

  if (!freshParticipant) {
    logoutCurrentParticipant()
    return null
  }

  saveCurrentParticipant(freshParticipant)
  return freshParticipant
}

export async function loginParticipantByEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Please enter your email address.',
    }
  }

  const participant = await getSupabaseParticipantByEmail(cleanEmail)

  if (!participant) {
    return {
      success: false,
      message: 'This email is not registered for MiniEra.',
    }
  }

  if (participant.status === 'Inactive') {
    return {
      success: false,
      message: 'This participant is inactive.',
    }
  }

  saveCurrentParticipant(participant)

  return {
    success: true,
    participant,
  }
}