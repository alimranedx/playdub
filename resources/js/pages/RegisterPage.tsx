import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join PlayDub to dub videos in multiple languages">
      {error && (
        <div className="alert alert-danger border-0 rounded-3 small mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-light fw-medium">Full Name</label>
          <input
            type="text"
            className="form-control form-control-dark"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light fw-medium">Email Address</label>
          <input
            type="email"
            className="form-control form-control-dark"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light fw-medium">Password</label>
          <input
            type="password"
            className="form-control form-control-dark"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label text-light fw-medium">Confirm Password</label>
          <input
            type="password"
            className="form-control form-control-dark"
            placeholder="Re-enter password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-playdub py-2 fw-semibold" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <p className="text-center text-secondary small mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-gradient fw-bold text-decoration-none">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
