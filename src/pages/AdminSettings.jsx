import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  getAdminOptions,
  saveAdminOptions,
  resetAdminOptions,
} from "../utils/adminOptionsStorage"
import {
  getProgramInfo,
  saveProgramInfo,
  resetProgramInfo,
} from "../utils/programInfoStorage"
import { supabase } from '../lib/supabaseClient'
import "../styles/dashboard.css"

function AdminSettings() {
  const navigate = useNavigate()

  const fallbackOptions = {
    groups: ['Group A', 'Group B', 'Group C'],
    programs: ['All participants', 'Medicine Track', 'Business Track', 'IT Track', 'Law Track'],
    locations: [
      'Comenius University - Faculty of Medicine',
      'Slovak University of Technology',
      'University of Economics',
      'ESET',
      'City Centre',
    ],
    eventCategories: ['Prednášky', 'Workshopy', 'Company visits', 'Social'],
    statuses: ['Registrovaný', 'Potvrdený', 'Prišiel', 'Neprišiel'],
  }

  function normalizeOptions(savedOptions) {
    return {
      ...fallbackOptions,
      ...savedOptions,
      groups: savedOptions.groups || fallbackOptions.groups,
      programs: savedOptions.programs || fallbackOptions.programs,
      locations: savedOptions.locations || fallbackOptions.locations,
      eventCategories: savedOptions.eventCategories || fallbackOptions.eventCategories,
      statuses: savedOptions.statuses || fallbackOptions.statuses,
    }
  }

  const [options, setOptions] = useState(normalizeOptions(getAdminOptions()))
  const [programInfo, setProgramInfo] = useState(getProgramInfo())
  const [programMessage, setProgramMessage] = useState('')
  const [optionsMessage, setOptionsMessage] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('miniEraAdminLoggedIn')
    navigate('/admin-login')
  }

  function handleProgramInfoChange(event) {
    const { name, value } = event.target

    const updatedProgramInfo = {
      ...programInfo,
      [name]: name === 'programDays' ? Number(value) : value,
    }

    setProgramInfo(updatedProgramInfo)
    saveProgramInfo(updatedProgramInfo)
    setProgramMessage('Nastavenia programu boli uložené.')
  }

  function handleResetProgramInfo() {
    const resetInfo = resetProgramInfo()

    setProgramInfo(resetInfo)
    setProgramMessage('Nastavenia programu boli resetované.')
  }

  function updateOption(category, index, newValue) {
    const currentCategoryOptions = options[category] || []

    const updatedOptions = {
      ...options,
      [category]: currentCategoryOptions.map((item, itemIndex) =>
        itemIndex === index ? newValue : item
      ),
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
    setOptionsMessage('Možnosti boli uložené.')
  }

  function addOption(category) {
    const currentCategoryOptions = options[category] || []

    const updatedOptions = {
      ...options,
      [category]: [...currentCategoryOptions, ""],
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
    setOptionsMessage('Nová možnosť bola pridaná.')
  }

  function deleteOption(category, index) {
    const currentCategoryOptions = options[category] || []

    const updatedOptions = {
      ...options,
      [category]: currentCategoryOptions.filter((_, itemIndex) => itemIndex !== index),
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
    setOptionsMessage('Možnosť bola zmazaná.')
  }

  function handleResetOptions() {
    const defaultOptionsFromStorage = resetAdminOptions()
    const normalizedDefaultOptions = normalizeOptions(defaultOptionsFromStorage)

    setOptions(normalizedDefaultOptions)
    saveAdminOptions(normalizedDefaultOptions)
    setOptionsMessage('Možnosti boli resetované.')
  }

  function renderOptionSection(title, description, category) {
    const optionList = options[category] || []

    return (
      <section className="admin-panel-card admin-settings-card">
        <div className="admin-settings-card-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="admin-add-option-btn"
            onClick={() => addOption(category)}
          >
            + Pridať možnosť
          </button>
        </div>

        <div className="admin-options-list">
          {optionList.map((option, index) => (
            <div className="admin-option-row" key={`${category}-${index}`}>
              <input
                type="text"
                value={option}
                placeholder="Nová možnosť"
                onChange={(event) =>
                  updateOption(category, index, event.target.value)
                }
              />

              <button
                type="button"
                className="admin-delete-small-btn"
                onClick={() => deleteOption(category, index)}
              >
                Zmazať
              </button>
            </div>
          ))}

          {optionList.length === 0 && (
            <p className="admin-empty-small">
              Zatiaľ tu nie sú žiadne možnosti.
            </p>
          )}
        </div>
      </section>
    )
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
          <Link to="/admin">Prehľad</Link>
          <Link to="/admin/events">Aktivity</Link>
          <Link to="/admin/participants">Účastníci</Link>
          <Link to="/admin/settings" className="active-admin-link">
            Nastavenia
          </Link>

          <button onClick={handleLogout}>Odhlásiť sa</button>
        </nav>
      </aside>

      <main className="admin-main">
        <section className="admin-topbar">
          <p className="admin-small-label">MINI ERASMUS</p>

          <div className="admin-settings-topbar-row">
            <div>
              <h1>Nastavenia platformy</h1>
              <p>
                Uprav základné informácie o programe a možnosti, ktoré sa používajú pri filtrovaní aktivít a účastníkov.
              </p>
            </div>
          </div>
        </section>

        <div className="admin-settings-grid">
          <section className="admin-panel-card admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h2>Informácie o programe</h2>
                <p>
                  Tieto údaje sa zobrazujú v používateľskej aplikácii na stránkach Domov,
                  Aktivity, Kalendár a Profil.
                </p>
              </div>

              <button
                type="button"
                className="admin-reset-button"
                onClick={handleResetProgramInfo}
              >
                Resetovať program
              </button>
            </div>

            <div className="admin-program-form">
              <label>
                Názov programu
                <input
                  name="programName"
                  value={programInfo.programName}
                  onChange={handleProgramInfoChange}
                  placeholder="Mini Erasmus 2026"
                />
              </label>

              <label>
                Mesto
                <input
                  name="city"
                  value={programInfo.city}
                  onChange={handleProgramInfoChange}
                  placeholder="Bratislava"
                />
              </label>

              <label>
                Krajina
                <input
                  name="country"
                  value={programInfo.country}
                  onChange={handleProgramInfoChange}
                  placeholder="Slovensko"
                />
              </label>

              <label>
                Mesiac / rok
                <input
                  name="monthLabel"
                  value={programInfo.monthLabel}
                  onChange={handleProgramInfoChange}
                  placeholder="JÚN 2026"
                />
              </label>

              <label>
                Začiatok
                <input
                  name="startDate"
                  value={programInfo.startDate}
                  onChange={handleProgramInfoChange}
                  placeholder="10.06"
                />
              </label>

              <label>
                Koniec
                <input
                  name="endDate"
                  value={programInfo.endDate}
                  onChange={handleProgramInfoChange}
                  placeholder="13.06"
                />
              </label>

              <label>
                Počet dní
                <input
                  name="programDays"
                  type="number"
                  min="1"
                  max="14"
                  value={programInfo.programDays}
                  onChange={handleProgramInfoChange}
                />
              </label>
            </div>

            {programMessage && (
              <p className="admin-form-message">
                {programMessage}
              </p>
            )}
          </section>

          {renderOptionSection(
            "Kategórie aktivít",
            "Tieto možnosti sa používajú pri vytváraní a filtrovaní aktivít. Napríklad prednášky, workshopy, company visits alebo social aktivity.",
            "eventCategories"
          )}

          {renderOptionSection(
            "Programy",
            "Programy určujú, pre ktorú skupinu účastníkov je aktivita určená. Môžu predstavovať rôzne odbory, univerzitné smery alebo spoločný program pre všetkých.",
            "programs"
          )}

          {renderOptionSection(
            "Miesta / organizátori",
            "Tieto možnosti slúžia na označenie univerzít, fakúlt, firiem alebo spoločných lokalít, ku ktorým sú aktivity a účastníci priradení.",
            "locations"
          )}

          {renderOptionSection(
            "Skupiny",
            "Skupiny pomáhajú organizátorom rozdeliť účastníkov podľa mentorov, tried, programov alebo organizačných potrieb.",
            "groups"
          )}

          {renderOptionSection(
            "Statusy účastníkov",
            "Statusy pomáhajú sledovať stav registrácie alebo účasti. Príchod môže slúžiť ako jednoduchý check-in pri registrácii na mieste.",
            "statuses"
          )}

          <section className="admin-panel-card admin-settings-card">
            <div className="admin-settings-card-header">
              <div>
                <h2>Reset možností</h2>
                <p>
                  Obnoví základné možnosti pre kategórie aktivít, programy, miesta, skupiny a statusy.
                </p>
              </div>

              <button
                type="button"
                className="admin-reset-button"
                onClick={handleResetOptions}
              >
                Resetovať možnosti
              </button>
            </div>

            {optionsMessage && (
              <p className="admin-form-message">
                {optionsMessage}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default AdminSettings