import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import { supabase } from '../lib/supabaseClient'
import {
  getSupabaseEvents,
  createSupabaseEvent,
  updateSupabaseEvent,
  deleteSupabaseEvent,
  toggleSupabaseEventPublished,
} from '../utils/supabaseEventStorage'

function AdminEvents() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [adminOptions, setAdminOptions] = useState(getAdminOptions())
  const [editingEvent, setEditingEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [activeAdminFilter, setActiveAdminFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [organizerFilter, setOrganizerFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')

  const defaultCategory = adminOptions.eventCategories?.[0] || 'Prednášky'
  const defaultProgram = adminOptions.programs?.[0] || 'All participants'
  const defaultOrganizer = adminOptions.locations?.[0] || ''

  const emptyForm = {
    title: '',
    category: defaultCategory,
    program: defaultProgram,
    organizer: defaultOrganizer,
    day: 'Day 1',
    date: '2026-06-10',
    time: '',
    location: '',
    mapsUrl: 'https://maps.google.com',
    description: '',
    capacity: 40,
    registered: 0,
    image: '',
    published: true,
  }

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    loadEvents()
    setAdminOptions(getAdminOptions())
  }, [])

  async function loadEvents() {
    setIsLoading(true)

    const supabaseEvents = await getSupabaseEvents()

    setEvents(supabaseEvents)
    setIsLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/admin-login')
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  function resetForm() {
    setFormData({
      ...emptyForm,
      category: adminOptions.eventCategories?.[0] || 'Prednášky',
      program: adminOptions.programs?.[0] || 'All participants',
      organizer: adminOptions.locations?.[0] || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)

    const cleanedEvent = {
      ...formData,
      title: formData.title.trim(),
      time: formData.time.trim(),
      location: formData.location.trim(),
      mapsUrl: formData.mapsUrl.trim() || 'https://maps.google.com',
      description: formData.description.trim(),
      capacity: Number(formData.capacity) || 0,
      registered: Number(formData.registered) || 0,
      image: formData.image.trim(),
      published: formData.published !== false,
    }

    if (editingEvent) {
      const updatedEvent = await updateSupabaseEvent(editingEvent.id, cleanedEvent)

      if (updatedEvent) {
        setEvents((currentEvents) =>
          currentEvents.map((eventItem) =>
            eventItem.id === editingEvent.id ? updatedEvent : eventItem
          )
        )

        setEditingEvent(null)
        resetForm()
      } else {
        alert('Aktivitu sa nepodarilo uložiť. Skontroluj konzolu alebo Supabase.')
      }
    } else {
      const createdEvent = await createSupabaseEvent(cleanedEvent)

      if (createdEvent) {
        setEvents((currentEvents) => [createdEvent, ...currentEvents])
        resetForm()
      } else {
        alert('Aktivitu sa nepodarilo pridať. Skontroluj konzolu alebo Supabase.')
      }
    }

    setIsSaving(false)
  }

  function handleEdit(eventItem) {
    setEditingEvent(eventItem)

    setFormData({
      ...emptyForm,
      ...eventItem,
      category: getCategoryLabel(eventItem.category),
      program: eventItem.program || adminOptions.programs?.[0] || 'All participants',
      organizer: eventItem.organizer || adminOptions.locations?.[0] || '',
      image: eventItem.image || '',
      published: eventItem.published !== false,
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingEvent(null)
    resetForm()
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Naozaj chceš zmazať túto aktivitu? Táto akcia sa nedá vrátiť späť.'
    )

    if (!confirmed) return

    const deleteWasSuccessful = await deleteSupabaseEvent(id)

    if (deleteWasSuccessful) {
      setEvents((currentEvents) =>
        currentEvents.filter((eventItem) => eventItem.id !== id)
      )

      if (editingEvent?.id === id) {
        setEditingEvent(null)
        resetForm()
      }
    } else {
      alert('Aktivitu sa nepodarilo zmazať. Skontroluj konzolu alebo Supabase.')
    }
  }

  async function togglePublished(eventItem) {
  const toggleWasSuccessful = await toggleSupabaseEventPublished(eventItem)

  if (toggleWasSuccessful) {
    setActiveAdminFilter('all')
    setCategoryFilter('all')
    setProgramFilter('all')
    setOrganizerFilter('all')
    setDayFilter('all')

    await loadEvents()
  } else {
    alert('Stav aktivity sa nepodarilo zmeniť. Skontroluj konzolu alebo Supabase.')
  }
}

  async function handleRefresh() {
  setActiveAdminFilter('all')
  setCategoryFilter('all')
  setProgramFilter('all')
  setOrganizerFilter('all')
  setDayFilter('all')
  await loadEvents()
}

  function getCategoryLabel(category) {
    if (category === 'Lectures') return 'Prednášky'
    if (category === 'Workshops') return 'Workshopy'
    if (category === 'Companies') return 'Company visits'
    if (category === 'Social') return 'Social'

    return category
  }

  function getDayLabel(day) {
    if (day === 'Day 1') return 'Deň 1'
    if (day === 'Day 2') return 'Deň 2'
    if (day === 'Day 3') return 'Deň 3'
    if (day === 'Day 4') return 'Deň 4'

    return day
  }

  function isEventFull(eventItem) {
    const registered = Number(eventItem.registered) || 0
    const capacity = Number(eventItem.capacity) || 0

    return capacity > 0 && registered >= capacity
  }

  function getAvailableSpots(eventItem) {
    const registered = Number(eventItem.registered) || 0
    const capacity = Number(eventItem.capacity) || 0
    const availableSpots = capacity - registered

    if (availableSpots < 0) return 0

    return availableSpots
  }

  const publishedCount = events.filter((eventItem) => eventItem.published !== false).length
  const draftCount = events.filter((eventItem) => eventItem.published === false).length
  const fullCount = events.filter((eventItem) => isEventFull(eventItem)).length

  const filteredAdminEvents = events.filter((eventItem) => {
    const eventCategory = getCategoryLabel(eventItem.category)
    const eventProgram = eventItem.program || 'All participants'
    const eventOrganizer = eventItem.organizer || ''
    const eventDay = eventItem.day || 'Day 1'

    if (activeAdminFilter === 'published' && eventItem.published === false) {
      return false
    }

    if (activeAdminFilter === 'drafts' && eventItem.published !== false) {
      return false
    }

    if (activeAdminFilter === 'full' && !isEventFull(eventItem)) {
      return false
    }

    if (categoryFilter !== 'all' && eventCategory !== categoryFilter) {
      return false
    }

    if (programFilter !== 'all' && eventProgram !== programFilter) {
      return false
    }

    if (organizerFilter !== 'all' && eventOrganizer !== organizerFilter) {
      return false
    }

    if (dayFilter !== 'all' && eventDay !== dayFilter) {
      return false
    }

    return true
  })

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">M</div>

          <div>
            <h2>MiniEra</h2>
            <p>Admin panel</p>
          </div>
        </div>

        <nav className="admin-menu">
          <Link to="/admin">Prehľad</Link>

          <Link to="/admin/events" className="active-admin-link">
            Aktivity
          </Link>

          <Link to="/admin/participants">Účastníci</Link>
          <Link to="/admin/settings">Nastavenia</Link>

          <button onClick={handleLogout}>Odhlásiť sa</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-small-label">SPRÁVA AKTIVÍT</p>
            <h1>Aktivity</h1>
            <p>
              Pridávaj nové aktivity, priraď ich k programu, kategórii alebo organizátorovi
              a rozhodni, ktoré budú viditeľné pre účastníkov.
            </p>
          </div>
        </header>

        <section className={editingEvent ? 'admin-event-form-card editing-mode' : 'admin-event-form-card'}>
          <div className="admin-form-heading-row">
            <div>
              <p className="admin-small-label">
                {editingEvent ? 'REŽIM ÚPRAVY' : 'NOVÁ AKTIVITA'}
              </p>

              <h2>{editingEvent ? 'Upravuješ aktivitu' : 'Pridať aktivitu'}</h2>

              {editingEvent && (
                <p className="admin-editing-note">
                  Momentálne upravuješ: <strong>{editingEvent.title}</strong>
                </p>
              )}
            </div>

            {editingEvent && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={handleCancelEdit}
              >
                Zrušiť úpravu
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="admin-event-form">
            <input
              name="title"
              placeholder="Názov aktivity"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <select name="category" value={formData.category} onChange={handleChange}>
              {(adminOptions.eventCategories || []).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select name="program" value={formData.program} onChange={handleChange}>
              {(adminOptions.programs || []).map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            <select name="organizer" value={formData.organizer} onChange={handleChange}>
              {(adminOptions.locations || []).map((locationItem) => (
                <option key={locationItem} value={locationItem}>
                  {locationItem}
                </option>
              ))}
            </select>

            <select name="day" value={formData.day} onChange={handleChange}>
              <option value="Day 1">Deň 1</option>
              <option value="Day 2">Deň 2</option>
              <option value="Day 3">Deň 3</option>
              <option value="Day 4">Deň 4</option>
            </select>

            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />

            <input
              name="time"
              placeholder="Čas napr. 10:30 - 12:00"
              value={formData.time}
              onChange={handleChange}
              required
            />

            <input
              name="location"
              placeholder="Presná lokalita / adresa"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <input
              name="mapsUrl"
              placeholder="Google Maps link"
              value={formData.mapsUrl}
              onChange={handleChange}
            />

            <input
              name="image"
              placeholder="URL obrázka aktivity"
              value={formData.image}
              onChange={handleChange}
            />

            <input
              name="capacity"
              type="number"
              min="0"
              placeholder="Kapacita"
              value={formData.capacity}
              onChange={handleChange}
            />

            <input
              name="registered"
              type="number"
              min="0"
              placeholder="Počet prihlásených"
              value={formData.registered}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Krátky popis aktivity"
              value={formData.description}
              onChange={handleChange}
            />

            <label className="admin-checkbox-row">
              <input
                name="published"
                type="checkbox"
                checked={formData.published}
                onChange={handleChange}
              />
              Zverejnené pre účastníkov
            </label>

            <div className="admin-form-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving
                  ? 'Ukladám...'
                  : editingEvent
                    ? 'Uložiť zmeny'
                    : 'Pridať aktivitu'}
              </button>

              <button
                type="button"
                className="admin-reset-button"
                onClick={handleRefresh}
              >
                Načítať zo Supabase
              </button>
            </div>
          </form>
        </section>

        <section className="admin-event-filter-card">
          <div>
            <p className="admin-small-label">FILTER</p>
            <h2>Prehľad aktivít</h2>
            <p>
              Najprv vyber stav aktivity a potom ju môžeš ďalej filtrovať podľa kategórie,
              programu, organizátora alebo dňa.
            </p>
          </div>

          <div className="admin-event-filter-buttons">
            <button
              type="button"
              className={activeAdminFilter === 'all' ? 'active-admin-filter-btn' : ''}
              onClick={() => setActiveAdminFilter('all')}
            >
              Všetko ({events.length})
            </button>

            <button
              type="button"
              className={activeAdminFilter === 'published' ? 'active-admin-filter-btn' : ''}
              onClick={() => setActiveAdminFilter('published')}
            >
              Zverejnené ({publishedCount})
            </button>

            <button
              type="button"
              className={activeAdminFilter === 'drafts' ? 'active-admin-filter-btn' : ''}
              onClick={() => setActiveAdminFilter('drafts')}
            >
              Koncepty ({draftCount})
            </button>

            <button
              type="button"
              className={activeAdminFilter === 'full' ? 'active-admin-filter-btn' : ''}
              onClick={() => setActiveAdminFilter('full')}
            >
              Naplnené ({fullCount})
            </button>
          </div>

          <div className="admin-secondary-filters">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Všetky kategórie</option>
              {(adminOptions.eventCategories || []).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
              <option value="all">Všetky programy</option>
              {(adminOptions.programs || []).map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            <select value={organizerFilter} onChange={(event) => setOrganizerFilter(event.target.value)}>
              <option value="all">Všetci organizátori / miesta</option>
              {(adminOptions.locations || []).map((locationItem) => (
                <option key={locationItem} value={locationItem}>
                  {locationItem}
                </option>
              ))}
            </select>

            <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)}>
              <option value="all">Všetky dni</option>
              <option value="Day 1">Deň 1</option>
              <option value="Day 2">Deň 2</option>
              <option value="Day 3">Deň 3</option>
              <option value="Day 4">Deň 4</option>
            </select>

            <button
              type="button"
              className="admin-clear-filters-btn"
              onClick={() => {
                setActiveAdminFilter('all')
                setCategoryFilter('all')
                setProgramFilter('all')
                setOrganizerFilter('all')
                setDayFilter('all')
              }}
            >
              Vyčistiť filtre
            </button>
          </div>
        </section>

        <section className="admin-events-list">
          {isLoading && (
            <div className="admin-empty-state">
              <h3>Načítavam aktivity...</h3>
              <p>Aktivity sa načítavajú zo Supabase.</p>
            </div>
          )}

          {!isLoading && filteredAdminEvents.map((eventItem) => {
            const isFull = isEventFull(eventItem)
            const availableSpots = getAvailableSpots(eventItem)

            return (
              <article
                className={editingEvent?.id === eventItem.id ? 'admin-event-row currently-editing-row' : 'admin-event-row'}
                key={eventItem.id}
              >
                <div>
                  <div className="admin-event-row-top">
                    <span>{getCategoryLabel(eventItem.category)}</span>

                    <span className={eventItem.published !== false ? 'admin-published' : 'admin-draft'}>
                      {eventItem.published !== false ? 'Viditeľné pre účastníkov' : 'Skryté / koncept'}
                    </span>

                    {isFull && (
                      <span className="admin-full">
                        Kapacita naplnená
                      </span>
                    )}

                    {eventItem.image && (
                      <span className="admin-image-added">
                        Obrázok pridaný
                      </span>
                    )}
                  </div>

                  <h3>{eventItem.title}</h3>

                  <p>
                    {getDayLabel(eventItem.day)} · {eventItem.time} · {eventItem.location}
                  </p>

                  <p>
                    {eventItem.program || 'All participants'}
                    {eventItem.organizer && ` · ${eventItem.organizer}`}
                  </p>

                  <p>
                    Kapacita: {Number(eventItem.registered) || 0}/{Number(eventItem.capacity) || 0}
                    {!isFull && ` · ${availableSpots} voľných miest`}
                  </p>
                </div>

                <div className="admin-row-actions">
                  <button onClick={() => togglePublished(eventItem)}>
                    {eventItem.published !== false ? 'Skryť' : 'Zverejniť'}
                  </button>

                  <button onClick={() => handleEdit(eventItem)}>
                    Upraviť
                  </button>

                  <button className="delete-button" onClick={() => handleDelete(eventItem.id)}>
                    Zmazať
                  </button>
                </div>
              </article>
            )
          })}

          {!isLoading && filteredAdminEvents.length === 0 && (
            <div className="admin-empty-state">
              <h3>Žiadne aktivity</h3>
              <p>V tomto filtri momentálne nie sú žiadne aktivity.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminEvents