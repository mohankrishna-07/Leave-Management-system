import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarCheck,
  FaPlusCircle,
  FaUser,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
          <FaCalendarCheck className="text-primary" size={24} />
          <span>LMS Portal</span>
        </Link>
        <button
          className="btn d-lg-none text-white p-0 border-0"
          type="button"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
      </div>

      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/dashboard" className="sidebar-link" onClick={onClose}>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink to="/employees" className="sidebar-link" onClick={onClose}>
            <FaUsers />
            <span>Employees</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/leaves" className="sidebar-link" onClick={onClose}>
            <FaCalendarCheck />
            <span>Leave Requests</span>
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
            <FaUser />
            <span>My Profile</span>
          </NavLink>
        </li>
      </ul>

      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={logout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
