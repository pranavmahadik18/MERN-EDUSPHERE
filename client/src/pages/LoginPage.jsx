import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail, AlertCircle, Shield, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate(from === '/' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoRole) => {
    if (demoRole === 'Admin') {
      setEmail('admin@coursems.edu');
      setPassword('adminpassword123');
    } else {
      setEmail('rohan@student.edu');
      setPassword('studentpassword123');
    }
    setError('');
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <LogIn size={24} />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access your courses, progress, or administrative console.
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'var(--danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.85rem', 
              color: '#fca5a5', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1.25rem' 
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                id="login-email"
                className="form-control" 
                placeholder="name@student.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="login-password"
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg" 
            disabled={submitting}
            id="btn-login-submit"
            style={{ marginTop: '1rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        {/* Viva / Demo Quick Fill Helper */}
        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, color: '#e0e7ff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⚡ Evaluator Quick-Fill Credentials</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => handleFillDemo('Admin')} 
              className="btn btn-secondary btn-sm"
              id="btn-fill-admin"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <Shield size={12} color="#f472b6" />
              <span>Admin Account</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleFillDemo('Student')} 
              className="btn btn-secondary btn-sm"
              id="btn-fill-student"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <User size={12} color="#60a5fa" />
              <span>Student Account</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};
