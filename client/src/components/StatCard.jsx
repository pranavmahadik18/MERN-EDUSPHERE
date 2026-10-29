import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'var(--primary)', subtitle = null, id = '' }) => {
  return (
    <div className="stat-card" id={id}>
      <div 
        className="stat-icon" 
        style={{ 
          background: `${color}18`, 
          color: color,
          border: `1px solid ${color}30` 
        }}
      >
        <Icon size={26} />
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
