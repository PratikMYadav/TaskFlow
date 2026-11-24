import React from 'react';

const ConfirmModal = ({ show, onHide, onConfirm, title = 'Confirm Deletion', message = 'Are you sure you want to delete this task? This action cannot be undone.', isDeleting = false }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-danger fs-6">{title}</h5>
            <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
          </div>
          <div className="modal-body py-3">
            <p className="text-muted small mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-light btn-sm" onClick={onHide} disabled={isDeleting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
