import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  getAdminOptions,
  saveAdminOptions,
  resetAdminOptions,
} from "../utils/adminOptionsStorage"

function AdminSettings() {
  const navigate = useNavigate()
  const [options, setOptions] = useState(getAdminOptions())

  function handleLogout() {
    localStorage.removeItem("miniEraAdminLoggedIn")
    navigate("/admin-login")
  }

  function updateOption(category, index, newValue) {
    const updatedOptions = {
      ...options,
      [category]: options[category].map((item, itemIndex) =>
        itemIndex === index ? newValue : item
      ),
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
  }

  function addOption(category) {
    const updatedOptions = {
      ...options,
      [category]: [...options[category], ""],
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
  }

  function deleteOption(category, index) {
    const updatedOptions = {
      ...options,
      [category]: options[category].filter((_, itemIndex) => itemIndex !== index),
    }

    setOptions(updatedOptions)
    saveAdminOptions(updatedOptions)
  }

  function handleResetOptions() {
    const defaultOptions = resetAdminOptions()
    setOptions(defaultOptions)
  }

  function renderOptionSection(title, description, category) {
    return (
      <section className="admin-panel-card admin-settings-card">
        <div className="admin-settings-card-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            className="admin-add-option-btn"
            onClick={() => addOption(category)}
          >
            + Add option
          </button>
        </div>

        <div className="admin-options-list">
          {options[category].map((option, index) => (
            <div className="admin-option-row" key={`${category}-${index}`}>
              <input
                type="text"
                value={option}
                placeholder={`New ${title.toLowerCase()} option`}
                onChange={(event) =>
                  updateOption(category, index, event.target.value)
                }
              />

              <button
                className="admin-delete-small-btn"
                onClick={() => deleteOption(category, index)}
              >
                Delete
              </button>
            </div>
          ))}
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

      <main className="admin-content">
        <section className="admin-topbar">
          <p className="admin-small-label">MINI ERASMUS</p>

          <div className="admin-settings-topbar-row">
            <div>
              <h1>Nastavenia filtrov</h1>
              <p>
                Manage editable options used for participant groups, programs and
                statuses.
              </p>
            </div>

            <button className="admin-reset-button" onClick={handleResetOptions}>
              Reset demo options
            </button>
          </div>
        </section>

        <div className="admin-settings-grid">
          {renderOptionSection(
            "Skupiny",
            "Groups help organizers divide participants into smaller working or mentor groups.",
            "groups"
          )}

          {renderOptionSection(
            "Programy",
            "Programs help assign different schedules or event tracks to participants.",
            "programs"
          )}

          {renderOptionSection(
            "Statusy",
            "Statuses help organizers keep track of participant approval and registration state.",
            "statuses"
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminSettings