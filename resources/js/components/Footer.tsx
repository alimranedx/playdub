import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 border-top border-secondary border-opacity-25 bg-dark bg-opacity-75">
      <div className="container text-center text-secondary small">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <i className="bi bi-play-circle-fill text-gradient fs-5"></i>
          <span className="fw-bold text-white brand-font fs-6">PlayDub</span>
          <span>&mdash; AI Multilingual Video Dubbing Platform</span>
        </div>
        <p className="mb-0">&copy; {new Date().getFullYear()} PlayDub. All rights reserved. One Video. Many Languages. One Player.</p>
      </div>
    </footer>
  );
};
