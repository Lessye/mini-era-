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
            alt="Home"
          />
        </div>

        <span>Home</span>
      </>
    )}
  </NavLink>

  <NavLink to="/schedule">
    {({ isActive }) => (
      <>
        <div className="nav-icon">
          <img
            src={isActive ? calendarActiveIcon : calendarIcon}
            alt="Calendar"
          />
        </div>

        <span>Calendar</span>
      </>
    )}
  </NavLink>

  <NavLink to="/events">
    {({ isActive }) => (
      <>
        <div className="nav-icon">
          <img
            src={isActive ? eventsActiveIcon : eventsIcon}
            alt="Events"
          />
        </div>

        <span>Events</span>
      </>
    )}
  </NavLink>

  <NavLink to="/profile">
    {({ isActive }) => (
      <>
        <div className="nav-icon">
          <img
            src={isActive ? profileActiveIcon : profileIcon}
            alt="Profile"
          />
        </div>

        <span>Profile</span>
      </>
    )}
  </NavLink>

</nav>
  );
}

export default BottomNav;