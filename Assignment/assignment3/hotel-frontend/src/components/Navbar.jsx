import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function Navbar() {
  const { user, isStaff, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/">Hotel Management</Link>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Rooms
        </NavLink>

        {isStaff && (
          <>
            {/* <NavLink
              to="/staff"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Staff Dashboard
            </NavLink> */}
            <NavLink
              to="/staff/customers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Customers
            </NavLink>
            <NavLink
              to="/staff/rooms"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Rooms
            </NavLink>
            <NavLink
              to="/staff/bookings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Bookings
            </NavLink>
          </>
        )}

        {isCustomer && (
          <>
            <NavLink
              to="/customer/profile"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Profile
            </NavLink>
            <NavLink
              to="/customer/bookings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/customer/bookings/new"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              New Booking
            </NavLink>
          </>
        )}

        {!user ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {user.email} ({user.role})
            </span>
            <button className="btn secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;