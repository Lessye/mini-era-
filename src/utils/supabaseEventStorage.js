import { supabase } from '../lib/supabaseClient'

function mapSupabaseEventToReactEvent(eventItem) {
  return {
    id: eventItem.id,
    title: eventItem.title || '',
    category: eventItem.category || 'Prednášky',
    program: eventItem.program || 'All participants',
    organizer: eventItem.organizer || '',
    day: eventItem.day || 'Day 1',
    date: eventItem.date || '',
    time: eventItem.time || '',
    location: eventItem.location || '',
    mapsUrl: eventItem.maps_url || eventItem.mapsUrl || '',
    description: eventItem.description || '',
    capacity: Number(eventItem.capacity) || 0,
    registered: Number(eventItem.registered) || 0,
    image: eventItem.image || '',
    published: eventItem.published !== false,
    createdAt: eventItem.created_at || '',
    updatedAt: eventItem.updated_at || '',
  }
}

function mapReactEventToSupabaseEvent(eventItem) {
  return {
    title: eventItem.title || '',
    category: eventItem.category || 'Prednášky',
    program: eventItem.program || 'All participants',
    organizer: eventItem.organizer || '',
    day: eventItem.day || 'Day 1',
    date: eventItem.date || null,
    time: eventItem.time || '',
    location: eventItem.location || '',
    maps_url: eventItem.mapsUrl || '',
    description: eventItem.description || '',
    capacity: Number(eventItem.capacity) || 0,
    registered: Number(eventItem.registered) || 0,
    image: eventItem.image || '',
    published: eventItem.published !== false,
  }
}

export async function getSupabaseEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true, nullsFirst: false })
    .order('time', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error loading events from Supabase:', error.message)
    return []
  }

  return (data || []).map(mapSupabaseEventToReactEvent)
}

export async function getSupabasePublishedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: true, nullsFirst: false })
    .order('time', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error loading published events from Supabase:', error.message)
    return []
  }

  return (data || []).map(mapSupabaseEventToReactEvent)
}

export async function getSupabaseEventById(eventId) {
  if (!eventId) {
    return null
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle()

  if (error) {
    console.error('Error loading event detail from Supabase:', error.message)
    return null
  }

  if (!data) {
    return null
  }

  return mapSupabaseEventToReactEvent(data)
}

export async function createSupabaseEvent(eventItem) {
  const newEvent = mapReactEventToSupabaseEvent(eventItem)

  const { data, error } = await supabase
    .from('events')
    .insert(newEvent)
    .select()
    .single()

  if (error) {
    console.error('Error creating event in Supabase:', error.message)
    return null
  }

  return mapSupabaseEventToReactEvent(data)
}

export async function updateSupabaseEvent(eventId, eventItem) {
  if (!eventId) {
    return null
  }

  const updatedEvent = mapReactEventToSupabaseEvent(eventItem)

  const { data, error } = await supabase
    .from('events')
    .update(updatedEvent)
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    console.error('Error updating event in Supabase:', error.message)
    return null
  }

  return mapSupabaseEventToReactEvent(data)
}

export async function deleteSupabaseEvent(eventId) {
  if (!eventId) {
    return false
  }

  // First try to remove joined-event rows connected to this event.
  // If this table does not exist or has no rows, the main event delete can still continue.
  const { error: joinedEventsError } = await supabase
    .from('joined_events')
    .delete()
    .eq('event_id', eventId)

  if (joinedEventsError) {
    console.warn(
      'Joined event cleanup skipped or failed:',
      joinedEventsError.message
    )
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event from Supabase:', error.message)
    return false
  }

  return true
}

export async function toggleSupabaseEventPublished(eventItem) {
  if (!eventItem?.id) {
    return false
  }

  const newPublishedValue = eventItem.published === false

  const { error } = await supabase
    .from('events')
    .update({ published: newPublishedValue })
    .eq('id', eventItem.id)

  if (error) {
    console.error('Error toggling event publish status:', error.message)
    return false
  }

  return true
}