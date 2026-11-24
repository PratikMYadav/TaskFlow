import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { formatDate } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const updated = await authService.updateProfile(fullName.trim());
      updateUser(updated);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(oldPassword, newPassword, confirmNewPassword);
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">User Profile</h2>
        <p className="text-muted small mb-0">Manage your account information and security</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Account Summary & Name Update */}
        <div className="col-12 col-md-6">
          <div className="tf-card p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-badge text-primary"></i>
              Account Information
            </h5>

            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="avatar-circle" style={{ width: '54px', height: '54px', fontSize: '1.25rem' }}>
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">{user?.full_name}</h6>
                <span className="text-muted small">{user?.email}</span>
                <div className="text-muted small mt-1">
                  <i className="bi bi-calendar3 me-1"></i> Member since {formatDate(user?.created_at)}
                </div>
              </div>
            </div>

            {profileSuccess && (
              <div className="alert alert-success py-2 small" role="alert">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
                  readOnly
                />
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Email cannot be changed.</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm px-3"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Password Change */}
        <div className="col-12 col-md-6">
          <div className="tf-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock text-warning"></i>
              Security & Password
            </h5>

            {passwordSuccess && (
              <div className="alert alert-success py-2 small" role="alert">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-primary btn-sm px-3"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
