import '../styles/dashboard.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/logo.svg";
function EventDetail() {

    const [showMap, setShowMap] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="dashboard">

      <div className="detail-hero">

        <div className="detail-overlay">

            <button
                  className="back-home"
                onClick={() => navigate(-1)}
            >
                  ← Back
            </button>

          <p className="mini-label">LECTURE EVENT</p>

          <h1 className="detail-title">
            Orientation Session
          </h1>

          <img
  src={logo}
  alt="MiniEra Logo"
  className="dashboard-logo"
/>


          <div className="detail-meta-row">

            <div className="detail-meta-card">
              <p>DATE</p>
              <h4>30 MAR</h4>
            </div>

            <div className="detail-meta-card">
              <p>TIME</p>
              <h4>10:30</h4>
            </div>

            <div className="detail-meta-card">
              <p>PLACE</p>
              <h4>STU</h4>
            </div>

          </div>

        </div>

      </div>

      <div className="detail-content">

        <div className="detail-info-box">

          <h3>About Event</h3>

          <p>
            Join the official orientation session where participants will learn more about the Mini Erasmus program, activities, schedules and networking opportunities.
          </p>

        </div>

        <div className="detail-info-box">

          <h3>Location</h3>

        <div
            className="fake-map clickable-map"
            onClick={() => setShowMap(true)}
        >
        <div className="map-pin">
        📍
        </div>

  <p>Open Navigation</p>

</div>

          <p>STU Main Auditorium, Bratislava</p>

        </div>

        <button className="main-cta-btn">
          Join Event
        </button>

      </div>

  {showMap && (

  <div className="map-modal">

    <div className="map-popup">

      <button
        className="close-map-btn"
        onClick={() => setShowMap(false)}
      >
        ✕
      </button>

      <div className="navigation-map">

        <div className="fake-route"></div>

        <div className="map-location-pin">
          📍
        </div>

      </div>

      <div className="navigation-info">

        <h2>12 minutes</h2>

        <p>850 meters • Walking route</p>

        <div className="navigation-location">
          STU Auditorium A
        </div>

        <button className="main-cta-btn">
          Start Navigation
        </button>

      </div>

    </div>

  </div>

)}
    </div>
  )
}

export default EventDetail