import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getStoredParticipants,
  saveStoredParticipants,
  resetStoredParticipants
} from '../utils/participantStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import '../styles/dashboard.css'

function AdminParticipants() {
  const navigate = useNavigate()

  const [participants, setParticipants] = useState([])
  const [adminOptions, setAdminOptions] = useState(getAdminOptions())

  const [searchTerm, setSearchTerm] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [schoolFilter, setSchoolFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [checkInFilter, setCheckInFilter] = useState('All')
  const [programFilter, setProgramFilter] = useState('All')

  function createEmptyForm(options) {
    return {
      name: '',
      school: '',
      group: options.groups[0] || '',
      email: '',
      programTrack: options.programs[0] || '',
      checkedIn: false,
      status: options.statuses[0] || ''
    }
  }

  const [formData, setFormData] = useState(createEmptyForm(adminOptions))

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('miniEraAdminLoggedIn')

    if (isLoggedIn !== 'true') {
      navigate('/admin-login')
      return
    }

    const currentOptions = getAdminOptions()

    setAdminOptions(currentOptions)
    setParticipants(getStoredParticipants())
    setFormData(createEmptyForm(currentOptions))
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/profile')
  }

  function updateParticipants(nextParticipants) {
    setParticipants(nextParticipants)
    saveStoredParticipants(nextParticipants)
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

    const newParticipant = {
      ...formData,
      id: Date.now().toString()
    }

    updateParticipants([newParticipant, ...participants])
    setFormData(createEmptyForm(adminOptions))
  }

  function handleDeleteParticipant(id) {
    const confirmed = window.confirm('Naozaj chceš zmazať tohto účastníka?')

    if (!confirmed) return

    const filteredParticipants = participants.filter(
      (participant) => participant.id !== id
    )

    updateParticipants(filteredParticipants)
  }

  function handleCheckInChange(id) {
    const updatedParticipants = participants.map((participant) => {
      if (participant.id === id) {
        return {
          ...participant,
          checkedIn: !participant.checkedIn
        }
      }

      return participant
    })

    updateParticipants(updatedParticipants)
  }

  function handleStatusChange(id, newStatus) {
    const updatedParticipants = participants.map((participant) => {
      if (participant.id === id) {
        return {
          ...participant,
          status: newStatus
        }
      }

      return participant
    })

    updateParticipants(updatedParticipants)
  }

  function handleProgramChange(id, newProgram) {
    const updatedParticipants = participants.map((participant) => {
      if (participant.id === id) {
        return {
          ...participant,
          programTrack: newProgram
        }
      }

      return participant
    })

    updateParticipants(updatedParticipants)
  }

  function handleResetParticipants() {
    const confirmed = window.confirm('Resetovať účastníkov na pôvodné demo dáta?')

    if (!confirmed) return

    const resetParticipants = resetStoredParticipants()
    setParticipants(resetParticipants)
    setFormData(createEmptyForm(adminOptions))
  }

  function clearFilters() {
    setSearchTerm('')
    setGroupFilter('All')
    setSchoolFilter('All')
    setStatusFilter('All')
    setCheckInFilter('All')
    setProgramFilter('All')
  }

  const groupOptions = adminOptions.groups.filter(Boolean)
  const programOptions = adminOptions.programs.filter(Boolean)
  const statusOptions = adminOptions.statuses.filter(Boolean)

  const schools = [
    ...new Set(participants.map((participant) => participant.school).filter(Boolean))
  ]

  const filteredParticipants = participants.filter((participant) => {
    const searchText = searchTerm.toLowerCase()
    const participantProgram = participant.programTrack || programOptions[0] || ''

    const matchesSearch =
      participant.name.toLowerCase().includes(searchText) ||
      participant.school.toLowerCase().includes(searchText) ||
      participant.group.toLowerCase().includes(searchText) ||
      participant.email.toLowerCase().includes(searchText) ||
      participantProgram.toLowerCase().includes(searchText)

    const matchesGroup =
      groupFilter === 'All' || participant.group === groupFilter

    const matchesSchool =
      schoolFilter === 'All' || participant.school === schoolFilter

    const matchesStatus =
      statusFilter === 'All' || participant.status === statusFilter

    const matchesProgram =
      programFilter === 'All' || participantProgram === programFilter

    const matchesCheckIn =
      checkInFilter === 'All' ||
      (checkInFilter === 'CheckedIn' && participant.checkedIn) ||
      (checkInFilter === 'NotCheckedIn' && !participant.checkedIn)

    return (
      matchesSearch &&
      matchesGroup &&
      matchesSchool &&
      matchesStatus &&
      matchesProgram &&
      matchesCheckIn
    )
  })

  const checkedInCount = participants.filter((participant) => participant.checkedIn).length
  const waitingCount = participants.filter((participant) => participant.status === 'Čaká').length

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
          <Link to="/admin/events">Aktivity</Link>
          <Link to="/admin/participants" className="active-admin-link">
            Účastníci
          </Link>
          <Link to="/admin/settings">Nastavenia</Link>

          <button onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-small-label">SPRÁVA ÚČASTNÍKOV</p>
            <h1>Účastníci</h1>
            <p>
              Filtruj účastníkov podľa školy, skupiny, programu a check-in stavu.
            </p>
          </div>

          <button className="admin-secondary-btn" onClick={handleResetParticipants}>
            Reset demo dát
          </button>
        </div>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <p>Všetci účastníci</p>
            <h2>{participants.length}</h2>
            <span>registrovaní študenti</span>
          </div>

          <div className="admin-stat-card">
            <p>Zobrazené výsledky</p>
            <h2>{filteredParticipants.length}</h2>
            <span>podľa aktívnych filtrov</span>
          </div>

          <div className="admin-stat-card">
            <p>Check-in</p>
            <h2>{checkedInCount}</h2>
            <span>účastníci už prišli</span>
          </div>

          <div className="admin-stat-card warning">
            <p>Čakajú</p>
            <h2>{waitingCount}</h2>
            <span>registrácie na kontrolu</span>
          </div>
        </section>

        <section className="admin-event-form-card">
          <h2>Pridať účastníka</h2>

          <form onSubmit={handleSubmit} className="admin-event-form">
            <input
              name="name"
              placeholder="Meno účastníka"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              name="school"
              placeholder="Škola"
              value={formData.school}
              onChange={handleChange}
              required
            />

            <select name="group" value={formData.group} onChange={handleChange}>
              {groupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <input
              name="email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <select
              name="programTrack"
              value={formData.programTrack}
              onChange={handleChange}
            >
              {programOptions.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            <select name="status" value={formData.status} onChange={handleChange}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <label className="admin-checkbox-row">
              <input
                name="checkedIn"
                type="checkbox"
                checked={formData.checkedIn}
                onChange={handleChange}
              />
              Účastník je už checknutý
            </label>

            <div className="admin-form-actions">
              <button type="submit">
                Pridať účastníka
              </button>
            </div>
          </form>
        </section>

        <section className="admin-content-card">
          <div className="admin-section-header">
            <div>
              <h2>Zoznam účastníkov</h2>
              <p>
                Organizátori môžu filtrovať účastníkov podľa skupiny, školy a programu.
              </p>
            </div>

            <button className="admin-secondary-btn" onClick={clearFilters}>
              Vyčistiť filtre
            </button>
          </div>

          <input
            className="admin-search-input"
            type="text"
            placeholder="Hľadať podľa mena, školy, skupiny, e-mailu alebo programu..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="admin-filter-grid">
            <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
              <option value="All">Všetky skupiny</option>
              {groupOptions.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
              <option value="All">Všetky školy</option>
              {schools.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>

            <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
              <option value="All">Všetky programy</option>
              {programOptions.map((program) => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">Všetky statusy</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select value={checkInFilter} onChange={(event) => setCheckInFilter(event.target.value)}>
              <option value="All">Všetci podľa check-in</option>
              <option value="CheckedIn">Iba check-in</option>
              <option value="NotCheckedIn">Iba bez check-in</option>
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Meno</th>
                  <th>Škola</th>
                  <th>Skupina</th>
                  <th>Program</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Akcie</th>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.name}</td>
                    <td>{participant.school}</td>
                    <td>{participant.group}</td>
                    <td>
                      <select
                        className="admin-small-select"
                        value={participant.programTrack || programOptions[0] || ''}
                        onChange={(event) =>
                          handleProgramChange(participant.id, event.target.value)
                        }
                      >
                        {programOptions.map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{participant.email}</td>
                    <td>
                      <select
                        className="admin-small-select"
                        value={participant.status}
                        onChange={(event) =>
                          handleStatusChange(participant.id, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className={
                          participant.checkedIn
                            ? 'admin-status-btn checked'
                            : 'admin-status-btn'
                        }
                        onClick={() => handleCheckInChange(participant.id)}
                      >
                        {participant.checkedIn ? 'Áno' : 'Nie'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-delete-small-btn"
                        onClick={() => handleDeleteParticipant(participant.id)}
                      >
                        Zmazať
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredParticipants.length === 0 && (
              <p className="admin-empty-state">Nenašli sa žiadni účastníci.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminParticipants