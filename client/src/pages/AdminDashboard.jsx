import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  FolderKanban, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.admin.getStats();
        setData(response);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Gathering real-time institutional metrics from MongoDB...
      </div>
    );
  }

  const { stats, recentEnrolments, popularCourses } = data || { stats: {}, recentEnrolments: [], popularCourses: [] };

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-role-admin" style={{ marginBottom: '0.5rem' }}>
            Administrative Control Center
          </div>
          <h1>System Overview & Metrics</h1>
          <p>Real-time analytics on courses, student enrollment patterns, and learning progress.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/courses/new" className="btn btn-primary" id="btn-admin-add-course">
            <PlusCircle size={16} />
            <span>Add New Course</span>
          </Link>
          <Link to="/admin/courses" className="btn btn-secondary" id="btn-admin-manage-courses">
            <FolderKanban size={16} />
            <span>Manage Courses</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '3rem' }}>
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses || 0} 
          icon={BookOpen} 
          color="#818cf8"
          subtitle="Active curricula"
          id="stat-admin-total-courses"
        />
        <StatCard 
          title="Registered Students" 
          value={stats.totalStudents || 0} 
          icon={Users} 
          color="#38bdf8"
          subtitle="Enrolled accounts"
          id="stat-admin-total-students"
        />
        <StatCard 
          title="Total Enrolments" 
          value={stats.totalEnrolments || 0} 
          icon={GraduationCap} 
          color="#fbbf24"
          subtitle="Course registrations"
          id="stat-admin-total-enrolments"
        />
        <StatCard 
          title="Completion Rate" 
          value={`${stats.completionRate || 0}%`} 
          icon={TrendingUp} 
          color="#34d399"
          subtitle={`${stats.completedEnrolments || 0} finished courses`}
          id="stat-admin-completion-rate"
        />
      </div>

      {/* Two Column Layout: Recent Enrolments & Top Courses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Recent Enrolments */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>Recent Student Enrolments</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest enrollment activities</span>
            </div>
            <Link to="/admin/students" className="btn btn-outline btn-sm" id="btn-view-all-enrolments">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentEnrolments.length > 0 ? (
            <div className="table-responsive" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Progress</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrolments.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{item.student?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student?.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {item.course?.title || 'Deleted Course'}
                        </span>
                      </td>
                      <td style={{ width: '130px' }}>
                        <ProgressBar progress={item.progress} height={6} showLabel={false} />
                        <span style={{ fontSize: '0.75rem', color: item.progress === 100 ? '#34d399' : '#818cf8', fontWeight: 600 }}>
                          {item.progress}%
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(item.enrolledAt || item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No enrollments recorded yet.
            </div>
          )}
        </div>

        {/* Popular Courses */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>Curriculum Performance</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top courses ranked by student count</span>
          </div>

          {popularCourses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {popularCourses.map((c, idx) => (
                <div 
                  key={c.courseId} 
                  style={{ 
                    padding: '0.85rem', 
                    background: 'var(--bg-surface)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(79,70,229,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.category} • Instructor: {c.instructor}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                      {c.enrolmentCount} {c.enrolmentCount === 1 ? 'student' : 'students'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Avg: {c.avgProgress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No enrollment metrics available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
