import { supabase } from '../lib/supabaseClient'

function mapSupabaseParticipant(participant) {
  if (!participant) {
    return null
  }

  return {
    ...participant,
    group_name: participant.participant_group || participant.group_name || '',
    checkedIn: participant.checked_in || false,
  }
}

function cleanEmail(email) {
  return email.trim().toLowerCase()
}

export async function getSupabaseParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Could not load participants:', error.message)
    return []
  }

  return data.map(mapSupabaseParticipant)
}

export async function getSupabaseParticipantByEmail(email) {
  const normalizedEmail = cleanEmail(email)

  if (!normalizedEmail) {
    return null
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    console.error('Could not find participant:', error.message)
    return null
  }

  return mapSupabaseParticipant(data)
}

export async function addSupabaseParticipant(formData) {
  const normalizedEmail = cleanEmail(formData.email || '')

  if (!formData.name || !normalizedEmail) {
    return {
      success: false,
      message: 'Name and email are required.',
    }
  }

  const newParticipant = {
    name: formData.name.trim(),
    email: normalizedEmail,
    school: formData.school.trim(),
    participant_group: formData.group || formData.group_name || '',
    program: formData.program || '',
    status: formData.status || 'Active',
    checked_in: formData.checkedIn || false,
  }

  const { data, error } = await supabase
    .from('participants')
    .insert([newParticipant])
    .select()
    .single()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    participant: mapSupabaseParticipant(data),
  }
}

export async function updateSupabaseParticipant(id, updates) {
  const cleanUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  if (cleanUpdates.email) {
    cleanUpdates.email = cleanEmail(cleanUpdates.email)
  }

  if (cleanUpdates.group_name) {
    cleanUpdates.participant_group = cleanUpdates.group_name
    delete cleanUpdates.group_name
  }

  if (cleanUpdates.checkedIn !== undefined) {
    cleanUpdates.checked_in = cleanUpdates.checkedIn
    delete cleanUpdates.checkedIn
  }

  const { data, error } = await supabase
    .from('participants')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    participant: mapSupabaseParticipant(data),
  }
}

export async function deleteSupabaseParticipant(id) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
  }
}

export async function resetSupabaseParticipants() {
  const demoParticipants = [
    {
      name: 'Maria Nováková',
      email: 'participant@miniera.com',
      school: 'Gymnázium Grösslingová',
      participant_group: 'Skupina A',
      program: 'Mini Erasmus Bratislava 2026',
      status: 'Active',
      checked_in: false,
    },
    {
      name: 'Tomáš Kováč',
      email: 'tomas.kovac@miniera.com',
      school: 'Gymnázium Jura Hronca',
      participant_group: 'Skupina B',
      program: 'Mini Erasmus Bratislava 2026',
      status: 'Active',
      checked_in: true,
    },
    {
      name: 'Nina Horváthová',
      email: 'nina.horvathova@miniera.com',
      school: 'Obchodná akadémia Nevädzová',
      participant_group: 'Skupina C',
      program: 'Mini Erasmus Bratislava 2026',
      status: 'Čaká',
      checked_in: false,
    },
  ]

  await supabase.from('participants').delete().neq('email', '')

  const { data, error } = await supabase
    .from('participants')
    .insert(demoParticipants)
    .select()

  if (error) {
    console.error('Could not reset participants:', error.message)
    return []
  }

  return data.map(mapSupabaseParticipant)
}