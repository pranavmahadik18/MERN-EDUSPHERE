import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Code, 
  Database, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.courses.getAll();
        setFeaturedCourses(response.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>MERN Stack Academic Project • Full-Featured Portal</span>
          </div>
          
          <h1 className="hero-title">
            Empower Your Academic Journey with <span className="brand-accent">EduSphere</span>
          </h1>
          
          <p className="hero-desc">
            A comprehensive Course Management & Interactive Learning System. Browse curated courses, track your lesson-by-lesson progress, and manage educational curriculum with role-based access.
          </p>

          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg" id="hero-btn-explore">
              <BookOpen size={18} />
              <span>Explore Course Catalog</span>
            </Link>

            {isAuthenticated ? (
              <Link 
                to={isAdmin ? '/admin' : '/dashboard'} 
                className="btn btn-secondary btn-lg"
                id="hero-btn-dashboard"
              >
                <span>Go to {isAdmin ? 'Admin Portal' : 'My Dashboard'}</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary btn-lg" id="hero-btn-register">
                <span>Register as Student</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(17, 24, 39, 0.6)', padding: '2rem 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MERN Architecture</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>Role-Based</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Admin & Student Access</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>Live Progress</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lesson Tracking Engine</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f472b6' }}>Persistent</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MongoDB Storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-beginner" style={{ marginBottom: '0.5rem' }}>Curated Curriculum</div>
            <h2>Featured Courses</h2>
            <p>Hand-picked engineering and development modules ready for enrolment.</p>
          </div>
          <Link to="/courses" className="btn btn-outline btn-sm" id="btn-see-all-courses">
            <span>View All Courses</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading courses from MongoDB...
          </div>
        ) : (
          <div className="grid-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Architecture Cards */}
      <section style={{ background: 'rgba(17, 24, 39, 0.4)', padding: '4rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <div className="badge badge-intermediate" style={{ marginBottom: '0.5rem' }}>System Capabilities</div>
            <h2>Engineered for College Evaluation</h2>
            <p>Designed with clean code separation, robust security practices, and straightforward REST API patterns.</p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>JWT & Role-Based Auth</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Encrypted password hashing with Bcrypt, stateless JSON Web Tokens (JWT), and authorization middleware separating Admin and Student privileges.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Course & Module Hierarchy</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Rich curriculum data modeling featuring nested modules, lessons, reading materials, estimated durations, and difficulty levels.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Zap size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Real-time Learning Progress</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Dynamic lesson completion toggles that calculate percentage progress on the fly and persist state directly to MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
