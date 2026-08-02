import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar-custom">
      <button
        className="btn d-lg-none text-dark p-0 border-0 me-3"
        type="button"
        onClick={onToggleSidebar}
      >
        <FaBars size={20} />
      </button>

      <div className="d-flex align-items-center ms-auto">
        {user && (
          <div className="dropdown">
            <div
              className="navbar-user dropdown-toggle"
              id="navbarUserDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="navbar-user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="d-none d-md-block text-start ms-2 me-1">
                <div className="fw-semibold lh-sm">{user.name}</div>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  {user.role} ({user.department})
                </small>
              </div>
            </div>
            <ul
              className="dropdown-menu dropdown-menu-end border-0 shadow-sm mt-2"
              aria-labelledby="navbarUserDropdown"
            >
              <li>
                <div className="dropdown-header text-dark">
                  <div className="fw-bold">{user.name}</div>
                  <div className="text-muted small">{user.email}</div>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center text-danger gap-2 py-2"
                  onClick={logout}
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
