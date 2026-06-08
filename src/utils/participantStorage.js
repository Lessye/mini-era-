import { supabase } from '../lib/supabaseClient'

export async function getStoredParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading participants:', error)
    return []
  }

  return data || []
}

export async function addStoredParticipant(participant) {
  const newParticipant = {
    name: participant.name,
    email: participant.email.trim().toLowerCase(),
    school: participant.school,
    group_name: participant.group,
    program: participant.programTrack,
    status: participant.status,
    checked_in: participant.checkedIn,
  }

  const { data, error } = await supabase
    .from('participants')
    .insert([newParticipant])
    .select()
    .single()

  if (error) {
    console.error('Error adding participant:', error)

    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    participant: data,
  }
}

export async function deleteStoredParticipant(id) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting participant:', error)

    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
  }
}

export async function updateStoredParticipant(id, updates) {
  const { data, error } = await supabase
    .from('participants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating participant:', error)

    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    participant: data,
  }
}

export async function resetStoredParticipants() {
  const demoParticipants = [
    {
      name: 'Demo Participant',
      email: 'participant@miniera.com',
      school: 'Future Generation Europe',
      group_name: 'Group A',
      program: 'Mini Erasmus 2026',
      status: 'Active',
      checked_in: true,
    },
    {
      name: 'Anna Nováková',
      email: 'anna@student.com',
      school: 'Gymnázium Bratislava',
      group_name: 'Group A',
      program: 'Mini Erasmus 2026',
      status: 'Active',
      checked_in: false,
    },
    {
      name: 'Matej Kováč',
      email: 'matej@student.com',
      school: 'Business Academy Košice',
      group_name: 'Group B',
      program: 'Mini Erasmus 2026',
      status: 'Active',
      checked_in: false,
    },
  ]

  const { error: deleteError } = await supabase
    .from('participants')
    .delete()
    .neq('email', '___never_match___')

  if (deleteError) {
    console.error('Error resetting participants:', deleteError)
    return []
  }

  const { data, error } = await supabase
    .from('participants')
    .insert(demoParticipants)
    .select()

  if (error) {
    console.error('Error inserting demo participants:', error)
    return []
  }

  return data || []
}