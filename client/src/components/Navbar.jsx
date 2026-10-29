import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" id="nav-brand-logo">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <span>Edu<span className="brand-accent">Sphere</span></span>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-link-home">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-link-courses">
              <BookOpen size={16} />
              Catalog
            </NavLink>
          </li>

          {/* Student Specific Links */}
          {isAuthenticated && isStudent && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-link-student-dashboard">
                <LayoutDashboard size={16} />
                My Learning
              </NavLink>
            </li>
          )}

          {/* Admin Specific Links */}
          {isAuthenticated && isAdmin && (
            <>
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end id="nav-link-admin-dashboard">
                  <LayoutDashboard size={16} />
                  Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-link-admin-courses">
                  <FolderKanban size={16} />
                  Manage Courses
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-link-admin-students">
                  <Users size={16} />
                  Students
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Auth Actions */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="user-badge" id="nav-user-badge">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-student'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm" 
                title="Log Out"
                id="btn-logout"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="btn-nav-login">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="btn-nav-register">
                <UserPlus size={15} />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
