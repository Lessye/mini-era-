import { supabase } from '../lib/supabaseClient'

const CURRENT_PARTICIPANT_KEY = 'miniEraCurrentParticipant'

export function getCurrentParticipant() {
  const storedParticipant = localStorage.getItem(CURRENT_PARTICIPANT_KEY)

  if (!storedParticipant) {
    return null
  }

  return JSON.parse(storedParticipant)
}

export function getCurrentParticipantEmail() {
  const currentParticipant = getCurrentParticipant()

  if (!currentParticipant) {
    return ''
  }

  return currentParticipant.email
}

export function saveCurrentParticipant(participant) {
  localStorage.setItem(CURRENT_PARTICIPANT_KEY, JSON.stringify(participant))
}

export function logoutCurrentParticipant() {
  localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
}

export async function loginParticipantByEmail(email) {
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Please enter your email address.',
    }
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('email', cleanEmail)
    .single()

  if (error || !data) {
    return {
      success: false,
      message: 'This email is not registered for MiniEra.',
    }
  }

  saveCurrentParticipant(data)

  return {
    success: true,
    participant: data,
  }
}