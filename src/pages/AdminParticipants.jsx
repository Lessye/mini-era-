import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getSupabaseParticipants,
  addSupabaseParticipant,
  deleteSupabaseParticipant,
  updateSupabaseParticipant,
  resetSupabaseParticipants,
} from '../utils/supabaseParticipantStorage'
import { getAdminOptions } from '../utils/adminOptionsStorage'
import '../styles/dashboard.css'
import { supabase } from '../lib/supabaseClient'

function AdminParticipants() {
  const navigate = useNavigate()

  const [participants, setParticipants] = useState([])
  const [adminOptions, setAdminOptions] = useState(getAdminOptions())
  const [isLoading, setIsLoading] = useState(true)
  const [formMessage, setFormMessage] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [schoolFilter, setSchoolFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [checkInFilter, setCheckInFilter] = useState('All')
  const [programFilter, setProgramFilter] = useState('All')

  function getOptionValue(option) {
    if (typeof option === 'string') {
      return option
    }

    return option.value || option.label || ''
  }

  function createEmptyForm(options) {
    const firstGroup = options.groups?.[0] || 'Skupina A'
    const firstProgram = options.programs?.[0] || 'Mini Erasmus Bratislava 2026'
    const firstStatus = options.statuses?.[0] || 'Active'

    return {
      name: '',
      school: '',
      group: getOptionValue(firstGroup),
      email: '',
      program: getOptionValue(firstProgram),
      checkedIn: false,
      status: getOptionValue(firstStatus),
    }
  }

  const [formData, setFormData] = useState(createEmptyForm(adminOptions))

  async function loadParticipants() {
    setIsLoading(true)

    const loadedParticipants = await getSupabaseParticipants()

    setParticipants(loadedParticipants)
    setIsLoading(false)
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('miniEraAdminLoggedIn')

    if (isLoggedIn !== 'true') {
      navigate('/admin-login')
      return
    }

    const currentOptions = getAdminOptions()

    setAdminOptions(currentOptions)
    setFormData(createEmptyForm(currentOptions))
    loadParticipants()
  }, [navigate])

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

  async function handleSubmit(event) {
    event.preventDefault()

    setFormMessage('')

    const result = await addSupabaseParticipant(formData)

    if (!result.success) {
      setFormMessage(`Účastníka sa nepodarilo pridať: ${result.message}`)
      return
    }

    setParticipants([result.participant, ...participants])
    setFormData(createEmptyForm(adminOptions))
    setFormMessage('Účastník bol pridaný. Teraz sa vie prihlásiť týmto e-mailom.')
  }

  async function handleDeleteParticipant(id) {
    const confirmed = window.confirm('Naozaj chceš zmazať tohto účastníka?')

    if (!confirmed) return

    const result = await deleteSupabaseParticipant(id)

    if (!result.success) {
      alert('Účastníka sa nepodarilo zmazať.')
      return
    }

    const filteredParticipants = participants.filter(
      (participant) => participant.id !== id
    )

    setParticipants(filteredParticipants)
  }

  async function handleCheckInChange(participant) {
    const result = await updateSupabaseParticipant(participant.id, {
      checked_in: !participant.checked_in,
    })

    if (!result.success) {
      alert('Check-in status sa nepodarilo upraviť.')
      return
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((currentParticipant) => {
        if (currentParticipant.id === participant.id) {
          return result.participant
        }

        return currentParticipant
      })
    )
  }

  async function handleStatusChange(participant, newStatus) {
    const result = await updateSupabaseParticipant(participant.id, {
      status: newStatus,
    })

    if (!result.success) {
      alert('Status sa nepodarilo upraviť.')
      return
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((currentParticipant) => {
        if (currentParticipant.id === participant.id) {
          return result.participant
        }

        return currentParticipant
      })
    )
  }

  async function handleProgramChange(participant, newProgram) {
    const result = await updateSupabaseParticipant(participant.id, {
      program: newProgram,
    })

    if (!result.success) {
      alert('Program sa nepodarilo upraviť.')
      return
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((currentParticipant) => {
        if (currentParticipant.id === participant.id) {
          return result.participant
        }

        return currentParticipant
      })
    )
  }

  async function handleResetParticipants() {
    const confirmed = window.confirm('Resetovať účastníkov na pôvodné demo dáta?')

    if (!confirmed) return

    const resetParticipants = await resetSupabaseParticipants()

    setParticipants(resetParticipants)
    setFormData(createEmptyForm(adminOptions))
  }

  function getGroupDisplayLabel(groupName) {
    if (!groupName) {
      return '-'
    }

    const directMatch = groupOptions.find((group) => group === groupName)

    if (directMatch) {
      return directMatch
    }

    const groupLetter = groupName
      .replace('Group ', '')
      .replace('Skupina ', '')
      .trim()

    const matchingGroup = groupOptions.find((group) => {
      return group.includes(groupLetter)
    })

    if (matchingGroup) {
      return matchingGroup
    }

    return groupName
  }

  function clearFilters() {
    setSearchTerm('')
    setGroupFilter('All')
    setSchoolFilter('All')
    setStatusFilter('All')
    setCheckInFilter('All')
    setProgramFilter('All')
  }

  const groupOptions = (adminOptions.groups || []).map(getOptionValue).filter(Boolean)
  const programOptions = (adminOptions.programs || []).map(getOptionValue).filter(Boolean)
  const statusOptions = (adminOptions.statuses || []).map(getOptionValue).filter(Boolean)

  const schools = [
    ...new Set(participants.map((participant) => participant.school).filter(Boolean)),
  ]

  const filteredParticipants = participants.filter((participant) => {
    const searchText = searchTerm.toLowerCase()
    const participantGroup = participant.group_name || ''
    const participantGroupLabel = getGroupDisplayLabel(participantGroup)
    const participantProgram = participant.program || ''

    const matchesSearch =
      (participant.name || '').toLowerCase().includes(searchText) ||
      (participant.school || '').toLowerCase().includes(searchText) ||
      participantGroupLabel.toLowerCase().includes(searchText) ||
      (participant.email || '').toLowerCase().includes(searchText) ||
      participantProgram.toLowerCase().includes(searchText)

    const matchesGroup =
      groupFilter === 'All' || participantGroupLabel === groupFilter

    const matchesSchool =
      schoolFilter === 'All' || participant.school === schoolFilter

    const matchesStatus =
      statusFilter === 'All' || participant.status === statusFilter

    const matchesProgram =
      programFilter === 'All' || participantProgram === programFilter

    const matchesCheckIn =
      checkInFilter === 'All' ||
      (checkInFilter === 'CheckedIn' && participant.checked_in) ||
      (checkInFilter === 'NotCheckedIn' && !participant.checked_in)

    return (
      matchesSearch &&
      matchesGroup &&
      matchesSchool &&
      matchesStatus &&
      matchesProgram &&
      matchesCheckIn
    )
  })

  const checkedInCount = participants.filter((participant) => participant.checked_in).length
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
              Admin pridá účastníkov a ich e-mail. Iba tieto e-maily sa vedia
              prihlásiť do používateľskej MiniEra platformy.
            </p>
          </div>

          <button className="admin-secondary-btn" onClick={handleResetParticipants}>
            Reset demo dát
          </button>
        </div>

        <section className="admin-stats admin-stats-compact">
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
              name="program"
              value={formData.program}
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
              Účastník prišiel / registrácia na mieste dokončená
            </label>

            <div className="admin-form-actions">
              <button type="submit">
                Pridať účastníka
              </button>
            </div>

            {formMessage && (
              <p className="admin-form-message">
                {formMessage}
              </p>
            )}
          </form>
        </section>

        <section className="admin-content-card">
          <div className="admin-section-header">
            <div>
              <h2>Zoznam účastníkov</h2>
              <p>
                Účastníci v tejto tabuľke tvoria whitelist pre používateľské prihlásenie.
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
              <option value="All">Všetci podľa príchodu</option>
              <option value="CheckedIn">Už prišli</option>
              <option value="NotCheckedIn">Ešte neprišli</option>
            </select>
          </div>

          {isLoading && (
            <p className="admin-empty-state">Načítavam účastníkov...</p>
          )}

          {!isLoading && (
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
                    <th>Príchod</th>
                    <th>Akcie</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.name}</td>
                      <td>{participant.school}</td>
                      <td>{getGroupDisplayLabel(participant.group_name)}</td>
                      <td>
                        <select
                          className="admin-small-select"
                          value={participant.program || programOptions[0] || ''}
                          onChange={(event) =>
                            handleProgramChange(participant, event.target.value)
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
                          value={participant.status || statusOptions[0] || 'Active'}
                          onChange={(event) =>
                            handleStatusChange(participant, event.target.value)
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
                            participant.checked_in
                              ? 'admin-status-btn checked'
                              : 'admin-status-btn'
                          }
                          onClick={() => handleCheckInChange(participant)}
                        >
                          {participant.checked_in ? 'Prišiel/a' : 'Neprišiel/a'}
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
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminParticipants