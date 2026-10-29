import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, KeyRound, AlertCircle, Shield } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await register({
        name,
        email,
        password,
        role
      });

      if (newUser.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <UserPlus size={24} />
          </div>
          <h2>Create an Account</h2>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join EduSphere to browse curriculum, enrol, and track study progress.
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
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                id="register-name"
                className="form-control" 
                placeholder="Aarav Sharma" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                id="register-email"
                className="form-control" 
                placeholder="aarav@student.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password (min 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="register-password"
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

          {/* Account Role Selector */}
          <div className="form-group">
            <label className="form-label">Register As</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`btn btn-sm ${role === 'Student' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                id="register-role-student"
              >
                <User size={14} />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`btn btn-sm ${role === 'Admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
                id="register-role-admin"
              >
                <Shield size={14} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg" 
            disabled={submitting}
            id="btn-register-submit"
            style={{ marginTop: '1.25rem' }}
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
