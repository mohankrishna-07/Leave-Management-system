import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import { FaSearch, FaCalendarCheck, FaInfoCircle, FaFileAlt } from 'react-icons/fa';

const LeaveRequests = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Rejection modal states
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await api.get('/api/admin/leaves', {
          params: {
            search: search.trim() || undefined,
            page,
            size: 8,
          },
        });
      } else {
        response = await api.get('/api/leaves/my-history', {
          params: {
            page,
            size: 8,
          },
        });
      }
      setLeaves(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load leaves', error);
      setToast({ message: 'Error loading leave requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, page]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      await api.put(`/api/admin/leaves/${id}/approve`);
      setToast({ message: 'Leave request approved successfully!', type: 'success' });
      fetchLeaves();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to approve request';
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
      fetchLeaves();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to reject request';
      setToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">{isAdmin ? 'Leave Requests Management' : 'My Leave History'}</h2>
          <p className="text-muted mb-0">
            {isAdmin ? 'Process employee leave applications' : 'View the status and history of your applications'}
          </p>
        </div>
      </div>

      {toast && (
        <div className="toast-container-custom">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Admin Search Bar */}
      {isAdmin && (
        <div className="card-custom mb-4 py-3">
          <div className="row align-items-center">
            <div className="col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="table-custom-container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaCalendarCheck size={40} className="mb-2 opacity-50 text-secondary" />
            <p className="mb-0">No leave requests found.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-custom mb-0">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    {isAdmin && <th>Department</th>}
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    {isAdmin && <th className="text-end">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((request) => {
                    const days = ChronoUnitBetween(request.startDate, request.endDate);
                    return (
                      <tr key={request.id}>
                        {isAdmin && (
                          <td>
                            <div className="fw-bold text-dark">{request.employeeName}</div>
                            <small className="text-muted">{request.employeeEmail}</small>
                          </td>
                        )}
                        {isAdmin && <td>{request.employeeDepartment}</td>}
                        <td className="fw-semibold">{request.leaveType}</td>
                        <td>
                          <span className="fw-medium text-dark">{request.startDate}</span> to <span className="fw-medium text-dark">{request.endDate}</span>
                          <small className="text-muted d-block">{days} {days === 1 ? 'day' : 'days'}</small>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '220px' }} title={request.reason}>
                          {request.reason}
                        </td>
                        <td>
                          <span className={`badge-status badge-${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                          {request.status === 'REJECTED' && (
                            <div className="small text-danger mt-1 text-wrap" style={{ maxWidth: '200px' }}>
                              <FaInfoCircle size={11} className="me-1" />
                              Reason: {request.rejectionReason}
                            </div>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="text-end">
                            {request.status === 'PENDING' ? (
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="btn btn-sm btn-success px-2.5 py-1 fw-medium"
                                  style={{ borderRadius: '6px' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClick(request.id)}
                                  className="btn btn-sm btn-outline-danger px-2.5 py-1 fw-medium"
                                  style={{ borderRadius: '6px' }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small">Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="small text-muted">
                  Showing Page {page + 1} of {totalPages}
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
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

export default LeaveRequests;
