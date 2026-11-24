import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center py-5 my-5 text-center">
      <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle p-4 mb-3">
        <i className="bi bi-compass fs-1"></i>
      </div>
      <h1 className="display-4 fw-bold text-dark">404</h1>
      <h4 className="fw-semibold text-secondary mb-3">Page Not Found</h4>
      <p className="text-muted small mb-4" style={{ maxWidth: '420px' }}>
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      <Link to="/dashboard" className="btn btn-primary px-4">
        <i className="bi bi-house-door me-1"></i> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
