import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';

  return (
    <div
      className={`toast show align-items-center text-white ${bgClass} border-0 shadow`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="d-flex">
        <div className="toast-body fw-medium">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default Toast;
