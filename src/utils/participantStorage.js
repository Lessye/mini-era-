import {
  getSupabaseParticipants,
  addSupabaseParticipant,
  deleteSupabaseParticipant,
  updateSupabaseParticipant,
  resetSupabaseParticipants,
} from './supabaseParticipantStorage'

export async function getStoredParticipants() {
  return await getSupabaseParticipants()
}

export async function addStoredParticipant(participant) {
  return await addSupabaseParticipant(participant)
}

export async function deleteStoredParticipant(id) {
  return await deleteSupabaseParticipant(id)
}

export async function updateStoredParticipant(id, updates) {
  return await updateSupabaseParticipant(id, updates)
}

export async function resetStoredParticipants() {
  return await resetSupabaseParticipants()
}