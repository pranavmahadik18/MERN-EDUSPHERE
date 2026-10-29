import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Award, 
  X, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';

export const CertificateModal = ({ certificate, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
              Course Completion Certificate
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Certificate Preview Frame (A4 Landscape aspect ratio mockup) */}
        <div style={{ 
          background: '#fafbfd', 
          color: '#0f172a', 
          borderRadius: '8px', 
          padding: '2.5rem 2rem', 
          border: '4px solid #0f172a',
          outline: '2px solid #d97706',
          outlineOffset: '-8px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          marginBottom: '1.75rem',
          position: 'relative'
        }}>
          {/* Top Badge */}
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: '#4338ca', marginBottom: '0.25rem' }}>
            EDUSPHERE ONLINE LEARNING PLATFORM
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '1.5px', color: '#64748b', marginBottom: '1rem' }}>
            ACCREDITED ACADEMIC CREDENTIAL
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#091326', letterSpacing: '2px', margin: '0.5rem 0' }}>
            CERTIFICATE OF COMPLETION
          </h1>
          <div style={{ width: '80px', height: '2px', background: '#d97706', margin: '0.5rem auto 1rem' }} />

          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>
            This certificate is awarded to
          </p>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', margin: '0.5rem 0' }}>
            {certificate.studentName}
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>
            for successfully completing
          </p>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#312e81', maxWidth: '560px', margin: '0 auto 0.75rem' }}>
            {certificate.courseTitle}
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.4 }}>
            The student has completed all required course lessons and demonstrated commitment to learning and professional development.
          </p>

          {/* Bottom Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.75rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem' }}>COMPLETION DATE</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{formattedDate}</div>
              <div style={{ color: '#4338ca', fontWeight: 700, marginTop: '0.25rem', fontFamily: 'monospace' }}>
                ID: {certificate.certificateId}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '0.25rem 0.6rem', 
                background: '#ecfdf5', 
                color: '#059669', 
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <ShieldCheck size={13} />
                <span>Verified Credential</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '120px', height: '1px', background: '#94a3b8', margin: '0 0 0.25rem auto' }} />
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{certificate.signatoryName}</div>
              <div style={{ color: '#64748b', fontSize: '0.68rem' }}>{certificate.signatoryRole}</div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-outline btn-sm"
            id="btn-modal-copy-verification"
          >
            {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
            <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href={`/verify-certificate/${certificate.certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              id="btn-modal-view-public"
            >
              <ExternalLink size={15} />
              <span>Public Registry</span>
            </a>

            <a
              href={api.certificates.downloadPdfUrl(certificate.certificateId)}
              download
              className="btn btn-primary btn-sm"
              id="btn-modal-download-pdf"
            >
              <Download size={15} />
              <span>Download Official PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
