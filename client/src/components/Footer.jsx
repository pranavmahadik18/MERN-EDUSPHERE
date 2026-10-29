import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Terminal, Database, Server, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                <GraduationCap size={16} />
              </div>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                Edu<span className="brand-accent">Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', maxWidth: '400px' }}>
              A full-stack Course Management System created for college mini-project examination with React, Node.js, Express, and MongoDB.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Technology Stack
              </h5>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                  MongoDB & Mongoose
                </span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  Express & Node.js
                </span>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                  React & Vite
                </span>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.2)' }}>
                  JWT & Bcrypt
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>© {new Date().getFullYear()} EduSphere Course Management System • Academic Mini Project</span>
          <span>B.Tech Computer Science & Engineering</span>
        </div>
      </div>
    </footer>
  );
};
