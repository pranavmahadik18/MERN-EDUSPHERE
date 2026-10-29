import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchCourses = async () => {
    try {
      const response = await api.courses.getAll();
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.courses.delete(deleteTarget._id);
      setMessage({ text: `Course "${deleteTarget.title}" deleted successfully.`, type: 'success' });
      setCourses((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete course', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-role-admin" style={{ marginBottom: '0.5rem' }}>
            Curriculum Administration
          </div>
          <h1>Manage Courses</h1>
          <p>Create, update syllabus content, or remove courses from the academic system.</p>
        </div>

        <Link to="/admin/courses/new" className="btn btn-primary" id="btn-add-course-top">
          <PlusCircle size={16} />
          <span>Add New Course</span>
        </Link>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            borderColor: message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem'
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} color="var(--success)" />
          ) : (
            <AlertCircle size={20} color="var(--danger)" />
          )}
          <span style={{ color: '#fff', fontSize: '0.95rem' }}>{message.text}</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Filter courses by title, category, instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
            id="admin-course-search-input"
          />
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Table of Courses */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Instructor</th>
              <th>Duration</th>
              <th>Curriculum</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Loading courses...
                </td>
              </tr>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
                return (
                  <tr key={course._id} id={`admin-course-row-${course._id}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img 
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} 
                          alt="" 
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{course.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.difficulty}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-beginner">{course.category}</span>
                    </td>
                    <td style={{ color: '#e2e8f0' }}>{course.instructor}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{course.duration}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                        {course.modules?.length || 0} modules • {totalLessons} lessons
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link 
                          to={`/courses/${course._id}`} 
                          className="btn btn-outline btn-sm" 
                          title="View Public Page"
                          target="_blank"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link 
                          to={`/admin/courses/edit/${course._id}`} 
                          className="btn btn-secondary btn-sm" 
                          title="Edit Course"
                          id={`btn-edit-course-${course._id}`}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Link>
                        <button 
                          onClick={() => setDeleteTarget(course)} 
                          className="btn btn-danger btn-sm" 
                          title="Delete Course"
                          id={`btn-delete-course-${course._id}`}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No courses matching your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Course Deletion */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated modules, lessons, and student enrolments will be removed permanently.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Course'}
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
