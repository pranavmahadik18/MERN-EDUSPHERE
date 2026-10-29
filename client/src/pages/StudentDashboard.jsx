import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import { StatCard } from '../components/StatCard';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  FolderPlus,
  Award,
  ShieldCheck,
  Download,
  ExternalLink
} from 'lucide-react';
import { CertificateModal } from '../components/CertificateModal';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolments = async () => {
      try {
        const response = await api.enrolments.getMyEnrolments();
        setEnrolments(response.data);
      } catch (err) {
        console.error('Failed to load student enrolments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolments();
  }, []);

  const totalEnrolled = enrolments.length;
  const completedCourses = enrolments.filter((e) => e.progress === 100 || e.isCompleted).length;
  const inProgressCourses = enrolments.filter((e) => (e.progress > 0 || (e.completedLessons && e.completedLessons.length > 0)) && e.progress < 100 && !e.isCompleted).length;
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrolments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrolled)
    : 0;

  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-role-student" style={{ marginBottom: '0.5rem' }}>
            Student Workspace
          </div>
          <h1>Welcome, {user?.name}!</h1>
          <p>Track your enrolled courses, resume active modules, and review your completion milestones.</p>
        </div>

        <Link to="/courses" className="btn btn-primary" id="dashboard-btn-browse">
          <BookOpen size={16} />
          <span>Browse More Courses</span>
        </Link>
      </div>

      {/* Student Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '3rem' }}>
        <StatCard 
          title="Enrolled Courses" 
          value={totalEnrolled} 
          icon={BookOpen} 
          color="#818cf8"
          id="stat-student-enrolled" 
        />
        <StatCard 
          title="Completed" 
          value={completedCourses} 
          icon={CheckCircle2} 
          color="#34d399"
          id="stat-student-completed" 
        />
        <StatCard 
          title="In Progress" 
          value={inProgressCourses} 
          icon={Clock} 
          color="#fbbf24"
          id="stat-student-inprogress" 
        />
        <StatCard 
          title="Overall Progress" 
          value={`${avgProgress}%`} 
          icon={TrendingUp} 
          color="#38bdf8"
          id="stat-student-avg-progress" 
        />
      </div>

      {/* Enrolled Courses Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>My Enrolled Courses</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {totalEnrolled} Active Enrollment{totalEnrolled === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading your registered courses...
          </div>
        ) : totalEnrolled > 0 ? (
          <div className="grid-3">
            {enrolments.map((enrolment) => (
              enrolment.course ? (
                <CourseCard 
                  key={enrolment._id} 
                  course={enrolment.course} 
                  enrolment={enrolment} 
                />
              ) : null
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <FolderPlus size={28} />
            </div>
            <h3>No courses enrolled yet</h3>
            <p style={{ maxWidth: '440px', margin: '0.5rem auto 1.5rem' }}>
              You haven't enrolled in any courses so far. Explore our course catalog and start your learning path today!
            </p>
            <Link to="/courses" className="btn btn-primary" id="btn-empty-browse-courses">
              Explore Course Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Earned Certificates & Verified Credentials Section */}
      {enrolments.some((e) => (e.progress === 100 || e.isCompleted) && e.certificate) && (
        <div style={{ marginTop: '3.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Award size={22} color="#fbbf24" />
            <h2 style={{ margin: 0 }}>My Verified Course Certificates</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrolments
              .filter((e) => (e.progress === 100 || e.isCompleted) && e.certificate)
              .map((e) => {
                const cert = e.certificate;
                return (
                  <div
                    key={cert._id || cert.certificateId}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      borderLeft: '4px solid #34d399'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <ShieldCheck size={16} color="var(--success)" />
                        <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                          Official Completion Credential
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc' }}>
                          ID: {cert.certificateId}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 0.35rem' }}>
                        {cert.courseTitle}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Awarded to <strong>{cert.studentName}</strong> • Completed on {new Date(cert.completionDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="btn btn-secondary btn-sm"
                        id={`btn-view-cert-${cert.certificateId}`}
                      >
                        <Award size={15} />
                        <span>Preview Certificate</span>
                      </button>

                      <a
                        href={api.certificates.downloadPdfUrl(cert.certificateId)}
                        download
                        className="btn btn-primary btn-sm"
                        id={`btn-dashboard-download-cert-${cert.certificateId}`}
                      >
                        <Download size={15} />
                        <span>Download PDF</span>
                      </a>

                      <Link
                        to={`/verify-certificate/${cert.certificateId}`}
                        className="btn btn-outline btn-sm"
                        id={`btn-dashboard-verify-link-${cert.certificateId}`}
                      >
                        <ExternalLink size={14} />
                        <span>Verify</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
