import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import { FaUser, FaEnvelope, FaBuilding, FaIdCard, FaLock, FaCalendarAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setToast({ message: 'Name and Email are required', type: 'error' });
      return;
    }

    if (password) {
      if (password.length < 6) {
        setToast({ message: 'Password must be at least 6 characters', type: 'error' });
        return;
      }
      if (password !== confirmPassword) {
        setToast({ message: 'Passwords do not match', type: 'error' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        department,
        password: password || undefined,
      };

      const response = await api.put('/api/employee/profile', payload);
      updateProfileState(response.data);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update profile';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Profile</h2>
      </div>

      {toast && (
        <div className="toast-container-custom">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card-custom text-center py-5">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
              style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 600 }}
            >
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 text-uppercase mb-4">
              {user?.role}
            </span>

            <div className="text-start px-3 mt-3">
              <div className="d-flex align-items-center gap-3 py-2 border-bottom border-light">
                <FaEnvelope className="text-muted" style={{ width: '20px' }} />
                <div>
                  <small className="text-muted d-block lh-1">Email Address</small>
                  <span className="fw-medium text-dark">{user?.email}</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 py-2 border-bottom border-light">
                <FaBuilding className="text-muted" style={{ width: '20px' }} />
                <div>
                  <small className="text-muted d-block lh-1">Department</small>
                  <span className="fw-medium text-dark">{user?.department}</span>
                </div>
              </div>

              {user?.role === 'EMPLOYEE' && (
                <div className="d-flex align-items-center gap-3 py-2">
                  <FaCalendarAlt className="text-muted" style={{ width: '20px' }} />
                  <div>
                    <small className="text-muted d-block lh-1">Leave Balance</small>
                    <span className="fw-bold text-success">{user?.leaveBalance} Days</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="col-lg-8">
          <div className="card-custom">
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4">Update Account Details</h5>
            <form onSubmit={handleUpdateProfile}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaUser className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaEnvelope className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0 ps-0"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Department</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaBuilding className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      value={department}
                      disabled
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Designation Role</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaIdCard className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      value={user?.role}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-dark mt-4 mb-3 border-bottom pb-2">Change Password <span className="text-muted small fw-normal">(Leave blank to keep current)</span></h6>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">New Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="text-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-custom px-4"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
