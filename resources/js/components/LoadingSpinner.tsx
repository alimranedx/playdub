import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading PlayDub...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
      <div className="spinner-border text-primary fs-4" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-secondary fw-medium">{message}</p>
    </div>
  );
};
