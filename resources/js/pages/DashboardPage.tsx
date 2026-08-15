import React from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="brand-font text-white fw-bold display-6 mb-1">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p className="text-secondary mb-0">Manage your video dubbing projects and translations</p>
        </div>
        <div>
          <Link to="/" className="btn btn-playdub d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill"></i> New Dubbing Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Total Projects</span>
              <span className="badge bg-primary bg-opacity-25 text-primary p-2 rounded-circle">
                <i className="bi bi-film fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">0</h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Dubbed Versions</span>
              <span className="badge bg-info bg-opacity-25 text-info p-2 rounded-circle">
                <i className="bi bi-translate fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">0</h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Active Jobs</span>
              <span className="badge bg-warning bg-opacity-25 text-warning p-2 rounded-circle">
                <i className="bi bi-cpu fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">0</h2>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Minutes Processed</span>
              <span className="badge bg-success bg-opacity-25 text-success p-2 rounded-circle">
                <i className="bi bi-clock-history fs-5"></i>
              </span>
            </div>
            <h2 className="brand-font text-white fw-bold mb-0">0m</h2>
          </div>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="glass-card p-4 p-md-5 text-center">
        <div className="py-4">
          <i className="bi bi-collection-play display-3 text-secondary mb-3 d-block"></i>
          <h4 className="text-white brand-font fw-bold mb-2">No Video Projects Yet</h4>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
            Phase 1 Foundation complete! Ready for Phase 2 video uploads, source ingestion, and processing pipelines.
          </p>
          <Link to="/" className="btn btn-playdub px-4">
            <i className="bi bi-rocket-takeoff me-2"></i> Start Your First Project
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};
