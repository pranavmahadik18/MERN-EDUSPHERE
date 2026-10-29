import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Mail, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const AdminStudentsPage = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'enrolments'
  const [students, setStudents] = useState([]);
  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, enrolmentsRes] = await Promise.all([
          api.admin.getStudents(),
          api.admin.getAllEnrolments()
        ]);
        setStudents(studentsRes.data);
        setEnrolments(enrolmentsRes.data);
      } catch (err) {
        console.error('Failed to load student and enrolment records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnrolments = enrolments.filter((e) =>
    e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.course?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="badge badge-role-admin" style={{ marginBottom: '0.5rem' }}>
          Student & Enrolment Management
        </div>
        <h1>Registered Students & Records</h1>
        <p>Monitor student participation, enrolled courses, and completion milestones.</p>
      </div>

      {/* Tabs & Search Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('students')}
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-btn-students"
          >
            <Users size={15} />
            <span>Students List ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('enrolments')}
            className={`btn btn-sm ${activeTab === 'enrolments' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-btn-enrolments"
          >
            <GraduationCap size={15} />
            <span>Master Enrolments ({enrolments.length})</span>
          </button>
        </div>

        <div style={{ minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            id="input-students-search"
          />
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Retrieving student enrollment records...
        </div>
      ) : activeTab === 'students' ? (
        /* Students List View */
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email Address</th>
                <th>Registered Date</th>
                <th>Total Enrolments</th>
                <th>Enrolled Courses</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        {student.enrolmentsCount || 0} courses
                      </span>
                    </td>
                    <td>
                      {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {student.enrolledCourses.map((c, idx) => (
                            <span 
                              key={idx} 
                              className="badge" 
                              style={{ 
                                background: c.progress === 100 ? 'var(--success-bg)' : 'rgba(255,255,255,0.06)',
                                color: c.progress === 100 ? '#34d399' : '#e2e8f0',
                                fontSize: '0.75rem' 
                              }}
                            >
                              {c.title} ({c.progress}%)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses enrolled</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Master Enrolments View */
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Category</th>
                <th>Progress</th>
                <th>Enrolment Date</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrolments.length > 0 ? (
                filteredEnrolments.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {item.student?.name || 'Deleted User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.student?.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>
                        {item.course?.title || 'Deleted Course'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Instructor: {item.course?.instructor || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-beginner">
                        {item.course?.category || 'General'}
                      </span>
                    </td>
                    <td style={{ minWidth: '150px' }}>
                      <ProgressBar progress={item.progress} height={6} showLabel={false} />
                      <div style={{ fontSize: '0.75rem', color: item.progress === 100 ? '#34d399' : '#818cf8', fontWeight: 600, marginTop: '0.2rem' }}>
                        {item.progress}% Completed
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(item.enrolledAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(item.lastAccessed || item.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No enrolment records matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
