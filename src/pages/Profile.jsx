import '../styles/dashboard.css'
import logo from '../assets/logo.svg'

import emailIcon from '../assets/icons/email.svg'
import locationIcon from '../assets/icons/location.svg'
import profileCalendarIcon from '../assets/icons/profilecalendar.svg'
import schoolIcon from '../assets/icons/school.svg'
import logoutIcon from '../assets/icons/logout.svg'

import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getCurrentParticipant,
  logoutCurrentParticipant,
  refreshCurrentParticipant,
} from '../utils/participantLoginStorage'
import { getProgramInfo } from '../utils/programInfoStorage'
import { getSupabasePublishedEvents } from '../utils/supabaseEventStorage'

function Profile() {
  const navigate = useNavigate()

  const programInfo = getProgramInfo()

  const [participant, setParticipant] = useState(getCurrentParticipant())
  const [publishedEvents, setPublishedEvents] = useState([])

  useEffect(() => {
    async function loadProfileData() {
      const currentParticipant = getCurrentParticipant()

      if (!currentParticipant) {
        navigate('/login')
        return
      }

      const freshParticipant = await refreshCurrentParticipant()

      if (!freshParticipant) {
        navigate('/login')
        return
      }

      const supabaseEvents = await getSupabasePublishedEvents()

      setParticipant(freshParticipant)
      setPublishedEvents(supabaseEvents)
    }

    loadProfileData()
  }, [navigate])

  function getInitials(name) {
    if (!name) {
      return 'ME'
    }

    const nameParts = name.trim().split(' ')

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase()
    }

    return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
  }

  function getGroupShortLabel(groupName) {
    if (!groupName) {
      return '-'
    }

    return groupName
      .replace('Group ', '')
      .replace('Skupina ', '')
      .trim()
  }

  function handleLogout() {
    logoutCurrentParticipant()
    navigate('/login')
  }

  if (!participant) {
    return null
  }

  return (
    <div className="dashboard">

      <div className="profile-top">

        <p className="mini-label">MINIERA</p>

        <h1 className="profile-page-title">
          Profil
        </h1>

        <img
          src={logo}
          alt="MiniEra Logo"
          className="dashboard-logo"
        />

        <div className="user-main-card">

          <div className="user-avatar">
            {getInitials(participant.name)}
          </div>

          <div>
            <h3>{participant.name}</h3>
            <p>Účastník programu</p>
          </div>

        </div>

      </div>

      <div className="profile-content">

        <div className="info-card">

          <h3>Kontaktné údaje</h3>

          <div className="profile-info-row">

            <img
              src={emailIcon}
              alt="E-mail"
              className="profile-icon"
            />

            <span>{participant.email}</span>

          </div>

          <div className="profile-info-row">

            <img
              src={locationIcon}
              alt="Lokalita"
              className="profile-icon"
            />

            <span>
              {programInfo.city}, {programInfo.country}
            </span>

          </div>

        </div>

        <div className="info-card">

          <h3>Detaily programu</h3>

          <div className="profile-info-row">

            <img
              src={profileCalendarIcon}
              alt="Program"
              className="profile-icon"
            />

            <span>{participant.program || programInfo.programName}</span>

          </div>

          <div className="profile-info-row">

            <img
              src={locationIcon}
              alt="Dátum"
              className="profile-icon"
            />

            <span>
              {programInfo.startDate} — {programInfo.endDate}, {programInfo.city}
            </span>

          </div>

          <div className="profile-info-row">

            <img
              src={schoolIcon}
              alt="Škola"
              className="profile-icon"
            />

            <span>{participant.school || 'Škola nie je priradená'}</span>

          </div>

          <div className="profile-info-row">

            <img
              src={profileCalendarIcon}
              alt="Skupina"
              className="profile-icon"
            />

            <span>
  {participant.group_name ||
    participant.participant_group ||
    participant.group ||
    'Skupina nie je priradená'}
</span>

          </div>

        </div>

        <div className="profile-stat-grid">

          <div className="mini-stat-card">
            <h2>{publishedEvents.length}</h2>
            <p>AKTIVITY</p>
          </div>

          <div className="mini-stat-card">
            <h2>{programInfo.programDays}</h2>
            <p>DNI</p>
          </div>

          <div className="mini-stat-card">
            <h2 className="group-stat-value">
              {getGroupShortLabel(
  participant.group_name ||
    participant.participant_group ||
    participant.group
)}
            </h2>
            <p>SKUPINA</p>
          </div>

        </div>

        <Link to="/admin-login">
          <div className="settings-card">
            Administrátorský prístup
          </div>
        </Link>

        <button
          type="button"
          className="logout-card profile-logout-button"
          onClick={handleLogout}
        >

          <div className="profile-info-row">

            <img
              src={logoutIcon}
              alt="Odhlásiť sa"
              className="profile-icon"
            />

            <p>Odhlásiť sa</p>

          </div>

        </button>

      </div>

    </div>
  )
}

export default Profile