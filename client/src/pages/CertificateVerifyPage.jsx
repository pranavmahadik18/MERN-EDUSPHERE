import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Search,
  ArrowLeft
} from 'lucide-react';

export const CertificateVerifyPage = () => {
  const { certificateId: paramCertId } = useParams();
  const [searchId, setSearchId] = useState(paramCertId || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(Boolean(paramCertId));
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const performVerification = async (idToVerify) => {
    if (!idToVerify || !idToVerify.trim()) return;
    setLoading(true);
    setError('');
    setCertData(null);
    setVerified(false);

    try {
      const res = await api.certificates.verify(idToVerify.trim());
      if (res.success && res.verified) {
        setCertData(res.data);
        setVerified(true);
      } else {
        setError(res.message || 'Credential verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Certificate ID was not found in EduSphere registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertId) {
      setSearchId(paramCertId);
      performVerification(paramCertId);
    }
  }, [paramCertId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      performVerification(searchId.trim());
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '860px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'rgba(99, 102, 241, 0.15)', 
          border: '1px solid rgba(129, 140, 248, 0.3)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.25rem',
          color: '#818cf8'
        }}>
          <ShieldCheck size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: '#fff' }}>
          Official Certificate Registry
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
          Verify the authenticity and completion status of certificates issued by EduSphere Online Learning Platform.
        </p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Certificate ID (e.g., EDU-2026-MERN-8F92A1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
              id="input-certificate-search"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} id="btn-verify-certificate">
            <Search size={16} />
            <span>{loading ? 'Verifying...' : 'Verify Credential'}</span>
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Consulting EduSphere cryptographic registry...</div>
          <span style={{ fontSize: '0.85rem' }}>Verifying student identity and sequential video checkpoints</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="card" style={{ 
          borderColor: 'rgba(239, 68, 68, 0.4)', 
          background: 'rgba(239, 68, 68, 0.08)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>Unverified Certificate</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            {error}
          </p>
        </div>
      )}

      {/* Verified Certificate Card */}
      {verified && certData && !loading && (
        <div className="card" style={{ 
          padding: '2.5rem', 
          border: '1px solid rgba(52, 211, 153, 0.4)', 
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)',
          boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15)',
          position: 'relative'
        }}>
          {/* Verification Badge Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: 'rgba(16, 185, 129, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                  Verified Official Credential
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Authenticity verified against immutable EduSphere student progress logs
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '0.4rem 0.85rem', 
              background: 'rgba(99, 102, 241, 0.15)', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#a5b4fc',
              fontWeight: 700
            }}>
              ID: {certData.certificateId}
            </div>
          </div>

          {/* Certificate Body details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                Awarded To
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '0.25rem', fontWeight: 700 }}>
                {certData.studentName}
              </h2>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                For Successfully Completing Course
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#93c5fd', marginTop: '0.25rem' }}>
                {certData.courseTitle}
              </h3>
            </div>

            <div style={{ 
              background: 'rgba(0, 0, 0, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              The student has completed all required course lessons and demonstrated commitment to learning and professional development.
            </div>

            {/* Metadata Grid */}
            <div className="grid-3" style={{ marginTop: '0.5rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <Calendar size={14} />
                  <span>Completion Date</span>
                </div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                  {new Date(certData.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <User size={14} />
                  <span>Lead Instructor</span>
                </div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                  {certData.instructor || 'Traversy Media'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <Award size={14} />
                  <span>Authorized Signatory</span>
                </div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                  {certData.signatoryName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {certData.signatoryRole}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <a
                href={api.certificates.downloadPdfUrl(certData.certificateId)}
                download
                className="btn btn-primary"
                id="btn-download-verified-pdf"
              >
                <Download size={16} />
                <span>Download Official PDF Certificate</span>
              </a>

              <Link to="/courses" className="btn btn-outline">
                <BookOpen size={16} />
                <span>Explore More Courses</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
