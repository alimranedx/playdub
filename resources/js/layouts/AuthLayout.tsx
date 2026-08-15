import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="glass-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="badge bg-gradient-playdub p-3 rounded-circle text-white mb-3 shadow">
                <i className="bi bi-play-circle-fill fs-3"></i>
              </div>
              <h2 className="brand-font fw-bold text-white mb-1">{title}</h2>
              <p className="text-secondary small">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
