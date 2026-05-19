import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import logo from "../assets/logo.svg";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="top-banner">

        <div className="status-row">
          <p className="mini-label">DASHBOARD</p>

          <img src={logo} alt="MiniEra Logo" className="dashboard-logo" />
        </div>

        <h1 className="main-title">MiniEra</h1>

        <div className="welcome-card">

          <div>
            <p className="small-date">SUNDAY, MAR 30</p>
            <h3>Welcome Day</h3>
          </div>

          <div className="day-counter">
            <h2>1/4</h2>
            <p>DAY</p>
          </div>

        </div>

      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h2>20</h2>
          <p>Total Events</p>
        </div>

        <div className="stat-card">
          <h2>12</h2>
          <p>Attending</p>
        </div>

        <div className="stat-card">
          <h2>1</h2>
          <p>Completed</p>
        </div>

      </div>

      <div className="action-grid">

        <Link to="/schedule" className="action-link">
        <div className="action-card dark-card">
        <p>Full Schedule</p>
        </div>
        </Link>

        <Link to="/events" className="action-link">
        <div className="action-card orange-card">
        <p>Browse Events</p>
        </div>
        </Link>

      </div>

      <div className="today-section">

        <div className="section-header">
          <h3>Happening Today</h3>
          <p>See All</p>
        </div>

        <Link to="/event-detail">

        <div className="today-card">
          <div>
            <p className="event-time">10:30 - 12:00</p>
            <h4>Orientation Session</h4>
            <p className="event-location">Auditorium A</p>
          </div>

          <div className="event-tag blue-tag">
            NOW
          </div>
        </div>

        </Link>

        <Link to="/event-detail">

        <div className="today-card">
          <div>
            <p className="event-time">12:30 - 14:00</p>
            <h4>Campus Tour & Lunch</h4>
            <p className="event-location">STU Campus</p>
          </div>

          <div className="event-tag green-tag">
            NEXT
          </div>
        </div>

        </Link>

        <Link to="/event-detail">

            <div className="today-card">
            <div>
            <p className="event-time">18:30 - 20:00</p>
            <h4>International Quiz Night</h4>
            <p className="event-location">Old Town Community Hub</p>
            </div>

            <div className="event-tag pink-tag">
                SOCIAL
            </div>
            </div>

        </Link>

      </div>

    </div>
  )
}

export default Dashboard