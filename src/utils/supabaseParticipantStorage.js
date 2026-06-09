import { supabase } from '../lib/supabaseClient'

function cleanEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function mapSupabaseParticipant(participant) {
  if (!participant) {
    return null
  }

  const groupName =
    participant.participant_group ||
    participant.group_name ||
    participant.group ||
    ''

  const checkedIn =
    participant.checked_in === true ||
    participant.checkedIn === true

  return {
    ...participant,

    // Normalized fields used by React pages
    name: participant.name || '',
    email: participant.email || '',
    school: participant.school || '',
    group: groupName,
    group_name: groupName,
    participant_group: groupName,
    program: participant.program || '',
    status: participant.status || 'Active',
    checkedIn,
    checked_in: checkedIn,
  }
}

function mapReactParticipantToSupabase(participant) {
  const groupName =
    participant.group ||
    participant.group_name ||
    participant.participant_group ||
    ''

  return {
    name: String(participant.name || '').trim(),
    email: cleanEmail(participant.email),
    school: String(participant.school || '').trim(),
    participant_group: groupName,
    program: participant.program || participant.programTrack || '',
    status: participant.status || 'Active',
    checked_in:
      participant.checkedIn === true ||
      participant.checked_in === true,
  }
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

  return (data || []).map(mapSupabaseParticipant)
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
  const newParticipant = mapReactParticipantToSupabase(formData)

  if (!newParticipant.name || !newParticipant.email) {
    return {
      success: false,
      message: 'Name and email are required.',
    }
  }

  const { data, error } = await supabase
    .from('participants')
    .insert([newParticipant])
    .select()
    .single()

  if (error) {
    console.error('Could not add participant:', error.message)

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
  if (!id) {
    return {
      success: false,
      message: 'Missing participant id.',
    }
  }

  const cleanUpdates = {}

  if (updates.name !== undefined) {
    cleanUpdates.name = String(updates.name || '').trim()
  }

  if (updates.email !== undefined) {
    cleanUpdates.email = cleanEmail(updates.email)
  }

  if (updates.school !== undefined) {
    cleanUpdates.school = String(updates.school || '').trim()
  }

  if (
    updates.group !== undefined ||
    updates.group_name !== undefined ||
    updates.participant_group !== undefined
  ) {
    cleanUpdates.participant_group =
      updates.group ||
      updates.group_name ||
      updates.participant_group ||
      ''
  }

  if (updates.program !== undefined || updates.programTrack !== undefined) {
    cleanUpdates.program = updates.program || updates.programTrack || ''
  }

  if (updates.status !== undefined) {
    cleanUpdates.status = updates.status || 'Active'
  }

  if (updates.checkedIn !== undefined || updates.checked_in !== undefined) {
    cleanUpdates.checked_in =
      updates.checkedIn === true ||
      updates.checked_in === true
  }

  const { data, error } = await supabase
    .from('participants')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Could not update participant:', error.message)

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
  if (!id) {
    return {
      success: false,
      message: 'Missing participant id.',
    }
  }

  // First remove joined events connected to this participant email if needed.
  // Main delete continues even if joined_events cleanup is skipped.
  const { data: participant } = await supabase
    .from('participants')
    .select('email')
    .eq('id', id)
    .maybeSingle()

  if (participant?.email) {
    const { error: joinedEventsError } = await supabase
      .from('joined_events')
      .delete()
      .eq('participant_email', participant.email)

    if (joinedEventsError) {
      console.warn(
        'Joined event cleanup skipped or failed:',
        joinedEventsError.message
      )
    }
  }

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Could not delete participant:', error.message)

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

  const { error: deleteError } = await supabase
    .from('participants')
    .delete()
    .neq('email', '___never_match___')

  if (deleteError) {
    console.error('Could not reset participants:', deleteError.message)
    return []
  }

  const { data, error } = await supabase
    .from('participants')
    .insert(demoParticipants)
    .select()

  if (error) {
    console.error('Could not insert demo participants:', error.message)
    return []
  }

  return (data || []).map(mapSupabaseParticipant)
}