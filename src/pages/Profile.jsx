import '../styles/dashboard.css'
import logo from "../assets/logo.svg";

import emailIcon from '../assets/icons/email.svg'
import locationIcon from '../assets/icons/location.svg'
import profileCalendarIcon from '../assets/icons/profilecalendar.svg'
import schoolIcon from '../assets/icons/school.svg'
import settingsIcon from '../assets/icons/settings.svg'
import logoutIcon from '../assets/icons/logout.svg'
import { Link } from 'react-router-dom'

function Profile() {
  return (
    <div className="dashboard">

      <div className="profile-top">

        <p className="mini-label">MINI ERA</p>

        <h1 className="profile-page-title">
          Student
        </h1>

        <img
          src={logo}
          alt="MiniEra Logo"
          className="dashboard-logo"
        />

        <div className="user-main-card">

          <div className="user-avatar">
            MK
          </div>

          <div>
            <h3>Matej Kováč</h3>
            <p>High School Student</p>
          </div>

        </div>

      </div>

      <div className="profile-content">

        <div className="info-card">

          <h3>Contact Information</h3>

          <div className="profile-info-row">

            <img
              src={emailIcon}
              alt="Email"
              className="profile-icon"
            />

            <span>matej.kovac@gymnazium.sk</span>

          </div>

          <div className="profile-info-row">

            <img
              src={locationIcon}
              alt="Location"
              className="profile-icon"
            />

            <span>Michalovce, Slovakia</span>

          </div>

        </div>

        <div className="info-card">

          <h3>Program Details</h3>

          <div className="profile-info-row">

            <img
              src={profileCalendarIcon}
              alt="Program"
              className="profile-icon"
            />

            <span>MiniErasmus 2025</span>

          </div>

          <div className="profile-info-row">

            <img
              src={locationIcon}
              alt="Location"
              className="profile-icon"
            />

            <span>30.03 — 02.04, Bratislava</span>

          </div>

          <div className="profile-info-row">

            <img
              src={schoolIcon}
              alt="School"
              className="profile-icon"
            />

            <span>Gymnasium Michalovce</span>

          </div>

          <div className="profile-info-row">

            <img
              src={profileCalendarIcon}
              alt="Student"
              className="profile-icon"
            />

            <span>3rd Year, Age 17</span>

          </div>

        </div>

        <div className="profile-stat-grid">

          <div className="mini-stat-card">
            <h2>12</h2>
            <p>EVENTS</p>
          </div>

          <div className="mini-stat-card">
            <h2>4</h2>
            <p>DAYS</p>
          </div>

          <div className="mini-stat-card">
            <h2>42</h2>
            <p>STUDENTS</p>
          </div>

        </div>

        <div className="settings-card">

          <div className="profile-info-row">

            <img
              src={settingsIcon}
              alt="Settings"
              className="profile-icon"
            />

            <span>Account Settings</span>

          </div>

        </div>

        <Link to="/admin-login">
          <div className="settings-card">
            Administrátorský prístup
           </div>
        </Link>

        <div className="logout-card">

          <div className="profile-info-row">

            <img
              src={logoutIcon}
              alt="Logout"
              className="profile-icon"
            />

            <p>Sign Out</p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Profile