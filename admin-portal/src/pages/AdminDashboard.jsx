import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import { FaUsers, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaCalendarCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // States for handling rejection modal
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, leavesResponse] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/leaves?page=0&size=5'), // Returns leaves sorted by date
      ]);
      setStats(statsResponse.data);
      // Filter to show only pending requests on the dashboard list
      const allLeaves = leavesResponse.data.content;
      setPendingLeaves(allLeaves.filter(req => req.status === 'PENDING'));
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      await api.put(`/api/admin/leaves/${id}/approve`);
      setToast({ message: 'Leave request approved successfully!', type: 'success' });
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to approve leave request';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    try {
      await api.put(`/api/admin/leaves/${rejectingId}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      setToast({ message: 'Leave request rejected.', type: 'success' });
      setRejectingId(null);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to reject leave request';
      setToast({ message: msg, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Admin Dashboard</h2>
          <p className="text-muted mb-0">System metrics and pending leave actions</p>
        </div>
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

      {/* Stats Row */}
      <div className="row">
        {/* Card 1: Total Employees */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Total Employees</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.totalEmployees}</h3>
            </div>
            <div className="bg-primary-subtle text-primary p-3 rounded-circle">
              <FaUsers size={22} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Requests */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat d-flex align-items-center justify-content-between" style={{ borderLeftColor: '#6366f1' }}>
            <div>
              <span className="text-muted text-uppercase small fw-bold">Total Requests</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.totalRequests}</h3>
            </div>
            <div className="bg-indigo-subtle text-indigo p-3 rounded-circle" style={{ color: '#6366f1' }}>
              <FaClipboardList size={22} />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat pending d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Pending Requests</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.pendingRequests}</h3>
            </div>
            <div className="bg-warning-subtle text-warning p-3 rounded-circle">
              <FaHourglassHalf size={22} />
            </div>
          </div>
        </div>

        {/* Card 4: Approved Requests */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat approved d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Approved Requests</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.approvedRequests}</h3>
            </div>
            <div className="bg-success-subtle text-success p-3 rounded-circle">
              <FaCheckCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Action Block */}
      <div className="table-custom-container mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Pending Leave Actions</h5>
          <Link to="/leaves" className="text-primary text-decoration-none small fw-semibold">
            Manage All Requests ({stats.pendingRequests})
          </Link>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <FaCalendarCheck size={40} className="mb-2 text-secondary opacity-50" />
            <p className="mb-0">No pending leave requests to process.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-custom mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((request) => {
                  const days = ChronoUnitBetween(request.startDate, request.endDate);
                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-bold text-dark">{request.employeeName}</div>
                        <small className="text-muted">{request.employeeEmail}</small>
                      </td>
                      <td>{request.employeeDepartment}</td>
                      <td className="fw-semibold">{request.leaveType}</td>
                      <td>
                        <span className="fw-medium text-dark">{request.startDate}</span> to <span className="fw-medium text-dark">{request.endDate}</span>
                        <small className="text-muted d-block">{days} {days === 1 ? 'day' : 'days'}</small>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '180px' }} title={request.reason}>
                        {request.reason}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="btn btn-sm btn-success px-3 fw-medium"
                            style={{ borderRadius: '6px' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            className="btn btn-sm btn-outline-danger px-3 fw-medium"
                            style={{ borderRadius: '6px' }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Rejection Modal/Form */}
      {rejectingId && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Reject Leave Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectingId(null)}
                ></button>
              </div>
              <form onSubmit={handleRejectSubmit}>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Reason for Rejection <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explain why this request is rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light py-2" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary px-3"
                    onClick={() => setRejectingId(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-danger px-3">
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Date Diff Helper
function ChronoUnitBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export default AdminDashboard;
