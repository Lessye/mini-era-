import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Events() {

  const [activeDay, setActiveDay] = useState(1)
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <div className="dashboard">

      <div className="top-banner">

        <div className="events-header-row">

          <div>
            <p className="mini-label">MINIERA</p>

            <h1 className="events-title">
              Bratislava, Slovakia
            </h1>
          </div>

          <div className="date-box">
            <p>MAR-APR 2025</p>
            <h3>30.03 — 02.04</h3>
          </div>

        </div>

        <div className="day-tabs">

          {[1, 2, 3, 4].map((day) => (

            <div
              key={day}
              className={activeDay === day ? 'active-day' : ''}
              onClick={() => setActiveDay(day)}
            >
              Day {day}
            </div>

          ))}

        </div>

      </div>

      <div className="filter-row">

        {['All', 'Lectures', 'Workshops', 'Companies', 'Social'].map((filter) => (

          <div
            key={filter}
            className={activeFilter === filter ? 'active-filter' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </div>

        ))}

      </div>

      {/* SOCIAL EVENT */}

      <Link to="/event-detail">

        <div className="event-large-card pink-gradient">

          <div className="event-large-top">
            <p>SOCIAL</p>
          </div>

          <div className="event-large-content">

            <p className="event-time">
              09:00 - 10:00
            </p>

            <h3>Registration & Welcome</h3>

            <p className="event-location">
              STU Main Hall
            </p>

            <button className="join-btn pink-button">
              Join Event
            </button>

          </div>

        </div>

      </Link>

      {/* LECTURE EVENT */}

      <Link to="/event-detail">

        <div className="event-large-card purple-gradient">

          <div className="event-large-top">
            <p>LECTURES</p>
          </div>

          <div className="event-large-content">

            <p className="event-time">
              10:30 - 12:00
            </p>

            <h3>Orientation Session</h3>

            <p className="event-location">
              Auditorium A
            </p>

            <button className="join-btn dark-btn">
              Join Event
            </button>

          </div>

        </div>

      </Link>

    </div>
  )
}

export default Events