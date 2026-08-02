import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarCheck, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await login(email, password, 'ADMIN');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('Access Denied')) {
        setError(err.message);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '20px',
      }}
    >
      <div className="card border-0 shadow-lg" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-5 text-center">
          <div className="d-flex justify-content-center align-items-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: '60px', height: '60px' }}
            >
              <FaCalendarCheck size={28} />
            </div>
          </div>

          <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
          <p className="text-muted small mb-4">Log in to the LMS Portal</p>

          {error && (
            <div className="alert alert-danger py-2 px-3 small border-0 text-start" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaEnvelope className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4 text-start">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaLock className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 fw-semibold shadow-sm"
              style={{ borderRadius: '8px', backgroundColor: '#1a73e8', borderColor: '#1a73e8' }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
