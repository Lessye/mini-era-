import { supabase } from '../lib/supabaseClient'
import { getCurrentParticipantEmail } from './participantLoginStorage'

function mapJoinedEvent(joinedEvent) {
  return {
    ...joinedEvent,
    eventId: joinedEvent.event_id,
    participantEmail: joinedEvent.participant_email,
    joinedAt: joinedEvent.joined_at,
  }
}

async function updateEventRegisteredCount(eventId) {
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
      updated_at: new Date().toISOString(),
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
  const participantEmail = getCurrentParticipantEmail()

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

  return data.map(mapJoinedEvent)
}

export async function isSupabaseEventJoined(eventId) {
  const participantEmail = getCurrentParticipantEmail()

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
  const participantEmail = getCurrentParticipantEmail()

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

  const { error } = await supabase
    .from('joined_events')
    .upsert(
      [
        {
          participant_email: participantEmail,
          event_id: eventItem.id,
        },
      ],
      {
        onConflict: 'participant_email,event_id',
      }
    )

  if (error) {
    console.error('Could not join event:', error.message)

    return {
      success: false,
      message: error.message,
    }
  }

  const countResult = await updateEventRegisteredCount(eventItem.id)

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
  const participantEmail = getCurrentParticipantEmail()

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