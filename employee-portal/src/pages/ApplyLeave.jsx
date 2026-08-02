import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import { FaPaperPlane, FaCalendarAlt, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Set default dates to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  // Update dynamic leave duration in days
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start <= end) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDuration(diffDays);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !leaveType || !reason.trim()) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setToast({ message: 'Start date cannot be after end date', type: 'error' });
      return;
    }

    if (duration <= 0) {
      setToast({ message: 'Invalid leave duration', type: 'error' });
      return;
    }

    if (user?.leaveBalance < duration) {
      setToast({
        message: `Insufficient leave balance! Requested: ${duration} days, Available: ${user.leaveBalance} days`,
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        startDate,
        endDate,
        leaveType,
        reason: reason.trim(),
      };

      await api.post('/api/leaves/apply', payload);
      setToast({ message: 'Leave request submitted successfully!', type: 'success' });
      
      // Redirect to leave history after short delay
      setTimeout(() => {
        navigate('/leaves');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to submit leave request';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Apply for Leave</h2>
          <p className="text-muted mb-0">Submit a new leave application</p>
        </div>
      </div>

      {toast && (
        <div className="toast-container-custom">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="row">
        {/* Leave application form */}
        <div className="col-lg-8 mb-4">
          <div className="card-custom">
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4">Leave Details Form</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Start Date</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaCalendarAlt className="text-muted" /></span>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">End Date</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaCalendarAlt className="text-muted" /></span>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Leave Type</label>
                  <select
                    className="form-select"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Loss of Pay (Unpaid)">Loss of Pay (Unpaid)</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Reason for Leave</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light align-items-start pt-2"><FaFileAlt className="text-muted" /></span>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Please explain the reason for your leave request..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Dynamic Duration Box */}
              {duration > 0 && (
                <div className="alert alert-info border-0 mt-4 d-flex align-items-center gap-2 py-2.5 shadow-sm">
                  <FaInfoCircle />
                  <span className="small fw-semibold">
                    You are applying for <span className="text-primary">{duration} {duration === 1 ? 'day' : 'days'}</span> of leave.
                  </span>
                </div>
              )}

              <div className="text-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-custom px-4 d-flex align-items-center gap-2 ms-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <FaPaperPlane size={14} />
                  )}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Balance Guidelines */}
        <div className="col-lg-4">
          <div className="card-custom bg-white border border-light">
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Leave Guidelines</h5>
            <div className="mb-4">
              <small className="text-muted d-block lh-1">Your Available Balance</small>
              <span className="fs-3 fw-bold text-success">{user?.leaveBalance} Days</span>
            </div>
            
            <div className="small text-secondary">
              <p className="mb-2"><strong>1. Submission:</strong> All leave requests must be submitted at least 24 hours prior to the start date.</p>
              <p className="mb-2"><strong>2. Approval:</strong> Leaves are subject to approval by the Department Head / Administrator.</p>
              <p className="mb-2"><strong>3. Sick Leaves:</strong> If applying for sick leave for more than 3 consecutive days, a medical certificate may be required by HR.</p>
              <p className="mb-0"><strong>4. Balances:</strong> Balance leaves are renewed at the start of each calendar year.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
