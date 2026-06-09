import { supabase } from '../lib/supabaseClient'
import { getCurrentParticipantEmail } from './participantLoginStorage'

function cleanEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function mapJoinedEvent(joinedEvent) {
  if (!joinedEvent) {
    return null
  }

  return {
    ...joinedEvent,
    eventId: joinedEvent.event_id || joinedEvent.eventId || '',
    event_id: joinedEvent.event_id || joinedEvent.eventId || '',
    participantEmail:
      joinedEvent.participant_email || joinedEvent.participantEmail || '',
    participant_email:
      joinedEvent.participant_email || joinedEvent.participantEmail || '',
    joinedAt: joinedEvent.joined_at || joinedEvent.joinedAt || '',
    joined_at: joinedEvent.joined_at || joinedEvent.joinedAt || '',
  }
}

async function getFreshEvent(eventId) {
  if (!eventId) {
    return null
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle()

  if (error) {
    console.error('Could not load event before joining:', error.message)
    return null
  }

  return data
}

async function updateEventRegisteredCount(eventId) {
  if (!eventId) {
    return {
      success: false,
      message: 'Event id is missing.',
    }
  }

  const { count, error: countError } = await supabase
    .from('joined_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (countError) {
    console.error('Could not count joined events:', countError.message)

    return {
      success: false,
      message: countError.message,
    }
  }

  const { data, error: updateError } = await supabase
    .from('events')
    .update({
      registered: count || 0,
    })
    .eq('id', eventId)
    .select()
    .single()

  if (updateError) {
    console.error('Could not update event registered count:', updateError.message)

    return {
      success: false,
      message: updateError.message,
    }
  }

  return {
    success: true,
    event: data,
    registered: count || 0,
  }
}

export async function getSupabaseJoinedEvents() {
  const participantEmail = cleanEmail(getCurrentParticipantEmail())

  if (!participantEmail) {
    return []
  }

  const { data, error } = await supabase
    .from('joined_events')
    .select('*')
    .eq('participant_email', participantEmail)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Could not load joined events:', error.message)
    return []
  }

  return (data || [])
    .map(mapJoinedEvent)
    .filter((joinedEvent) => joinedEvent !== null)
}

export async function isSupabaseEventJoined(eventId) {
  const participantEmail = cleanEmail(getCurrentParticipantEmail())

  if (!participantEmail || !eventId) {
    return false
  }

  const { data, error } = await supabase
    .from('joined_events')
    .select('*')
    .eq('participant_email', participantEmail)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) {
    console.error('Could not check joined event:', error.message)
    return false
  }

  return Boolean(data)
}

export async function addSupabaseJoinedEvent(eventItem) {
  const participantEmail = cleanEmail(getCurrentParticipantEmail())

  if (!participantEmail) {
    return {
      success: false,
      message: 'Participant is not logged in.',
    }
  }

  if (!eventItem?.id) {
    return {
      success: false,
      message: 'Event is missing.',
    }
  }

  const eventId = eventItem.id
  const freshEvent = await getFreshEvent(eventId)

  if (!freshEvent) {
    return {
      success: false,
      message: 'Event does not exist.',
    }
  }

  if (freshEvent.published === false) {
    return {
      success: false,
      message: 'Event is not published.',
    }
  }

  const alreadyJoined = await isSupabaseEventJoined(eventId)

  if (alreadyJoined) {
    const countResult = await updateEventRegisteredCount(eventId)

    return {
      success: true,
      alreadyJoined: true,
      registered: countResult.registered,
      event: countResult.event,
    }
  }

  const capacity = Number(freshEvent.capacity) || 0
  const registered = Number(freshEvent.registered) || 0
  const isFull = capacity > 0 && registered >= capacity

  if (isFull) {
    return {
      success: false,
      message: 'Event is full.',
    }
  }

  const { error } = await supabase
    .from('joined_events')
    .insert([
      {
        participant_email: participantEmail,
        event_id: eventId,
      },
    ])

  if (error) {
    console.error('Could not join event:', error.message)

    return {
      success: false,
      message: error.message,
    }
  }

  const countResult = await updateEventRegisteredCount(eventId)

  if (!countResult.success) {
    return countResult
  }

  return {
    success: true,
    registered: countResult.registered,
    event: countResult.event,
  }
}

export async function removeSupabaseJoinedEvent(eventId) {
  const participantEmail = cleanEmail(getCurrentParticipantEmail())

  if (!participantEmail) {
    return {
      success: false,
      message: 'Participant is not logged in.',
    }
  }

  if (!eventId) {
    return {
      success: false,
      message: 'Event is missing.',
    }
  }

  const { error } = await supabase
    .from('joined_events')
    .delete()
    .eq('participant_email', participantEmail)
    .eq('event_id', eventId)

  if (error) {
    console.error('Could not remove joined event:', error.message)

    return {
      success: false,
      message: error.message,
    }
  }

  const countResult = await updateEventRegisteredCount(eventId)

  if (!countResult.success) {
    return countResult
  }

  return {
    success: true,
    registered: countResult.registered,
    event: countResult.event,
  }
}