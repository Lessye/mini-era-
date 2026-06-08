import { NavLink } from "react-router-dom";

import homeIcon from "../assets/icons/home.svg";
import homeActiveIcon from "../assets/icons/home-active.svg";

import calendarIcon from "../assets/icons/calendar.svg";
import calendarActiveIcon from "../assets/icons/calendar-active.svg";

import eventsIcon from "../assets/icons/events.svg";
import eventsActiveIcon from "../assets/icons/events-active.svg";

import profileIcon from "../assets/icons/profile.svg";
import profileActiveIcon from "../assets/icons/profile-active.svg";

import "../styles/dashboard.css";

function BottomNav() {
  return (
    <nav className="bottom-nav">

      <NavLink to="/">
        {({ isActive }) => (
          <>
            <div className="nav-icon">
              <img
                src={isActive ? homeActiveIcon : homeIcon}
                alt="Domov"
              />
            </div>

            <span>Domov</span>
          </>
        )}
      </NavLink>

      <NavLink to="/schedule">
        {({ isActive }) => (
          <>
            <div className="nav-icon">
              <img
                src={isActive ? calendarActiveIcon : calendarIcon}
                alt="Kalendár"
              />
            </div>

            <span>Kalendár</span>
          </>
        )}
      </NavLink>

      <NavLink to="/events">
        {({ isActive }) => (
          <>
            <div className="nav-icon">
              <img
                src={isActive ? eventsActiveIcon : eventsIcon}
                alt="Aktivity"
              />
            </div>

            <span>Aktivity</span>
          </>
        )}
      </NavLink>

      <NavLink to="/profile">
        {({ isActive }) => (
          <>
            <div className="nav-icon">
              <img
                src={isActive ? profileActiveIcon : profileIcon}
                alt="Profil"
              />
            </div>

            <span>Profil</span>
          </>
        )}
      </NavLink>

    </nav>
  );
}

export default BottomNav;