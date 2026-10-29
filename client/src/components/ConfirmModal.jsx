import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onClose,
  isDanger = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)', 
              color: isDanger ? 'var(--danger)' : 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-outline btn-sm" 
            style={{ padding: '4px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            id="modal-btn-cancel"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            id="modal-btn-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
