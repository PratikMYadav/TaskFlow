import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to={isAuthenticated ? "/dashboard" : "/login"}>
          <span className="badge bg-primary p-2 rounded-3 text-white">
            <i className="bi bi-check2-circle fs-5"></i>
          </span>
          <span className="fs-4 fw-bold">TaskFlow</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#taskflowNavbar"
          aria-controls="taskflowNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="taskflowNavbar">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/dashboard">
                    <i className="bi bi-grid-1x2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/tasks">
                    <i className="bi bi-list-task me-1"></i> All Tasks
                  </NavLink>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-3">
                <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                  <div className="avatar-circle">
                    {getInitials(user?.full_name)}
                  </div>
                  <span className="fw-semibold small d-none d-sm-inline">{user?.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  title="Log out of TaskFlow"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="ms-auto d-flex gap-2">
              <Link to="/login" className="btn btn-outline-primary btn-sm px-3">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm px-3">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
