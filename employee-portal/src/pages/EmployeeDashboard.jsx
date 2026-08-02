import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCalendarAlt, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaPlusCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    leaveBalance: 30,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([
          api.get('/api/leaves/my-stats'),
          api.get('/api/leaves/my-history?page=0&size=5'),
        ]);
        setStats(statsResponse.data);
        setRecentRequests(historyResponse.data.content);
      } catch (error) {
        console.error('Failed to load employee dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <h2 className="fw-bold mb-0">Welcome to your Dashboard</h2>
          <p className="text-muted mb-0">Track and manage your leave requests</p>
        </div>
        <Link to="/apply-leave" className="btn btn-primary-custom d-flex align-items-center gap-2">
          <FaPlusCircle />
          <span>Apply Leave</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="row">
        {/* Card 1: Leave Balance */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Leave Balance</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.leaveBalance}</h3>
            </div>
            <div className="bg-primary-subtle text-primary p-3 rounded-circle">
              <FaCalendarAlt size={22} />
            </div>
          </div>
        </div>

        {/* Card 2: Pending Leaves */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat pending d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Pending Requests</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.pendingLeaves}</h3>
            </div>
            <div className="bg-warning-subtle text-warning p-3 rounded-circle">
              <FaHourglassHalf size={22} />
            </div>
          </div>
        </div>

        {/* Card 3: Approved Leaves */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat approved d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Approved Leaves</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.approvedLeaves}</h3>
            </div>
            <div className="bg-success-subtle text-success p-3 rounded-circle">
              <FaCheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* Card 4: Rejected Leaves */}
        <div className="col-xl-3 col-sm-6 mb-4">
          <div className="card-custom card-stat rejected d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted text-uppercase small fw-bold">Rejected Leaves</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stats.rejectedLeaves}</h3>
            </div>
            <div className="bg-danger-subtle text-danger p-3 rounded-circle">
              <FaTimesCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="table-custom-container mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Recent Leave Applications</h5>
          <Link to="/leaves" className="text-primary text-decoration-none small fw-semibold">
            View All History
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <FaCalendarAlt size={40} className="mb-2 text-secondary opacity-50" />
            <p className="mb-0">You have not applied for any leaves yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-custom mb-0">
              <thead>
                <tr>
                  <th>Applied On</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => {
                  const days = ChronoUnitBetween(request.startDate, request.endDate);
                  return (
                    <tr key={request.id}>
                      <td className="small text-secondary">
                        {new Date(request.appliedOn).toLocaleDateString()}
                      </td>
                      <td className="fw-semibold">{request.leaveType}</td>
                      <td>
                        <span className="fw-medium text-dark">{request.startDate}</span> to <span className="fw-medium text-dark">{request.endDate}</span>
                        <small className="text-muted d-block">{days} {days === 1 ? 'day' : 'days'}</small>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }} title={request.reason}>
                        {request.reason}
                      </td>
                      <td>
                        <span className={`badge-status badge-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                        {request.status === 'REJECTED' && (
                          <small className="text-danger d-block mt-1 text-truncate" style={{ maxWidth: '150px' }} title={request.rejectionReason}>
                            Reason: {request.rejectionReason}
                          </small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick JS helper to calculate date difference
function ChronoUnitBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export default EmployeeDashboard;
