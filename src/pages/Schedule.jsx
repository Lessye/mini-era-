import '../styles/dashboard.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Schedule() {

  const [activeDay, setActiveDay] = useState(1)

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

      <div className="schedule-list">

        <div className="schedule-item">

          <div className="schedule-dot green-dot"></div>

          <div className="schedule-content">

            <Link to="/event-detail">

              <div className="schedule-card-new">

                <div className="schedule-top-row">
                  <p>09:00 - 10:00</p>
                  <span>SOCIAL</span>
                </div>

                <h3>Registration & Welcome</h3>

                <p>STU Main Hall</p>

              </div>

            </Link>

          </div>

        </div>

        <div className="schedule-item">

          <div className="schedule-dot purple-dot"></div>

          <div className="schedule-content">

            <Link to="/event-detail">

              <div className="schedule-card-new">

                <div className="schedule-top-row">
                  <p>10:30 - 12:00</p>
                  <span>LECTURE</span>
                </div>

                <h3>Orientation Session</h3>

                <p>Auditorium A</p>

              </div>

            </Link>

          </div>

        </div>

        <div className="schedule-item">

          <div className="schedule-dot orange-dot"></div>

          <div className="schedule-content">

            <Link to="/event-detail">

              <div className="schedule-card-new">

                <div className="schedule-top-row">
                  <p>12:30 - 14:00</p>
                  <span>WORKSHOP</span>
                </div>

                <h3>Campus Tour & Lunch</h3>

                <p>STU Campus</p>

              </div>

            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Schedule