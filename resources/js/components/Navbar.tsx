import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-playdub sticky-top px-3 py-2">
      <div className="container-fluid max-w-7xl">
        <Link className="navbar-brand d-flex align-items-center gap-2 brand-font fs-4 fw-bold" to="/">
          <span className="badge bg-gradient-playdub p-2 rounded-3 text-white">
            <i className="bi bi-play-circle-fill fs-5"></i>
          </span>
          <span className="text-white">Play<span className="text-gradient">Dub</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={`nav-link nav-link-playdub ${location.pathname === '/' ? 'active' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className={`nav-link nav-link-playdub ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
                  <i className="bi bi-collection-play me-1"></i> Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 border-secondary rounded-pill px-3"
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5 text-gradient"></i>
                  <span>{user.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary" aria-labelledby="userMenu">
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/dashboard">
                      <i className="bi bi-speedometer2"></i> Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-4 fw-medium">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-playdub rounded-pill px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
