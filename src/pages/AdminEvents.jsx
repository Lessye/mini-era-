import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'
import { getStoredEvents, saveStoredEvents, resetStoredEvents } from '../utils/eventStorage'

function AdminEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)

  const emptyForm = {
    title: '',
    category: 'Lectures',
    day: 'Day 1',
    date: '2026-06-10',
    time: '',
    location: '',
    mapsUrl: 'https://maps.google.com',
    description: '',
    capacity: 40,
    registered: 0,
    image: '',
    published: true
  }

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    setEvents(getStoredEvents())
  }, [])

  function handleLogout() {
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/profile')
  }

  function updateEvents(nextEvents) {
    setEvents(nextEvents)
    saveStoredEvents(nextEvents)
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const cleanedEvent = {
      ...formData,
      capacity: Number(formData.capacity),
      registered: Number(formData.registered)
    }

    if (editingEvent) {
      const updatedEvents = events.map((eventItem) =>
        eventItem.id === editingEvent.id
          ? { ...cleanedEvent, id: editingEvent.id }
          : eventItem
      )

      updateEvents(updatedEvents)
      setEditingEvent(null)
    } else {
      const newEvent = {
        ...cleanedEvent,
        id: Date.now().toString()
      }

      updateEvents([newEvent, ...events])
    }

    setFormData(emptyForm)
  }

  function handleEdit(eventItem) {
    setEditingEvent(eventItem)
    setFormData(eventItem)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    const confirmed = window.confirm('Naozaj chceš zmazať túto aktivitu?')

    if (!confirmed) return

    const filteredEvents = events.filter((eventItem) => eventItem.id !== id)
    updateEvents(filteredEvents)
  }

  function togglePublished(id) {
    const updatedEvents = events.map((eventItem) =>
      eventItem.id === id
        ? { ...eventItem, published: !eventItem.published }
        : eventItem
    )

    updateEvents(updatedEvents)
  }

  function handleReset() {
    const confirmed = window.confirm('Resetovať aktivity na pôvodné demo dáta?')

    if (!confirmed) return

    const resetEvents = resetStoredEvents()
    setEvents(resetEvents)
    setEditingEvent(null)
    setFormData(emptyForm)
  }

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
          <Link to="/admin">
            Prehľad
          </Link>

          <Link to="/admin/events" className="active">
            Aktivity
          </Link>

          <Link to="/admin/participants">
            Účastníci
          </Link>

          <Link to="/admin/settings">Nastavenia
          </Link>

          <button onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-small-label">SPRÁVA AKTIVÍT</p>
            <h1>Aktivity</h1>
            <p>
              Tu môžeš pridávať, upravovať, zverejňovať a skrývať aktivity pre účastnícku aplikáciu.
            </p>
          </div>
        </header>

        <section className="admin-event-form-card">
          <h2>{editingEvent ? 'Upraviť aktivitu' : 'Pridať aktivitu'}</h2>

          <form onSubmit={handleSubmit} className="admin-event-form">
            <input
              name="title"
              placeholder="Názov aktivity"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <select name="category" value={formData.category} onChange={handleChange}>
              <option>Lectures</option>
              <option>Workshops</option>
              <option>Companies</option>
              <option>Social</option>
            </select>

            <select name="day" value={formData.day} onChange={handleChange}>
              <option>Day 1</option>
              <option>Day 2</option>
              <option>Day 3</option>
              <option>Day 4</option>
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
              placeholder="Miesto"
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
              name="capacity"
              type="number"
              placeholder="Kapacita"
              value={formData.capacity}
              onChange={handleChange}
            />

            <input
              name="registered"
              type="number"
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
              <button type="submit">
                {editingEvent ? 'Uložiť zmeny' : 'Pridať aktivitu'}
              </button>

              {editingEvent && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => {
                    setEditingEvent(null)
                    setFormData(emptyForm)
                  }}
                >
                  Zrušiť
                </button>
              )}

              <button
                type="button"
                className="admin-reset-button"
                onClick={handleReset}
              >
                Reset demo dát
              </button>
            </div>
          </form>
        </section>

        <section className="admin-events-list">
          {events.map((eventItem) => {
            const isFull = eventItem.registered >= eventItem.capacity

            return (
              <article className="admin-event-row" key={eventItem.id}>
                <div>
                  <div className="admin-event-row-top">
                    <span>{eventItem.category}</span>

                    <span className={eventItem.published ? 'admin-published' : 'admin-draft'}>
                      {eventItem.published ? 'Zverejnené' : 'Koncept'}
                    </span>

                    {isFull && <span className="admin-full">Kapacita naplnená</span>}
                  </div>

                  <h3>{eventItem.title}</h3>

                  <p>
                    {eventItem.day} · {eventItem.time} · {eventItem.location}
                  </p>

                  <p>
                    Kapacita: {eventItem.registered}/{eventItem.capacity}
                  </p>
                </div>

                <div className="admin-row-actions">
                  <button onClick={() => togglePublished(eventItem.id)}>
                    {eventItem.published ? 'Skryť' : 'Zverejniť'}
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
        </section>
      </main>
    </div>
  )
}

export default AdminEvents