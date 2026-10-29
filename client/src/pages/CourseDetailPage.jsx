import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/ProgressBar';
import { 
  Clock, 
  BookOpen, 
  User, 
  CheckCircle, 
  PlayCircle, 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  AlertCircle,
  Youtube
} from 'lucide-react';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrolment, setEnrolment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        const courseRes = await api.courses.getById(id);
        setCourse(courseRes.data);

        // Expand all modules by default
        if (courseRes.data?.modules) {
          const initialExpanded = {};
          courseRes.data.modules.forEach((_, idx) => {
            initialExpanded[idx] = true;
          });
          setExpandedModules(initialExpanded);
        }

        // If authenticated student, check enrolment
        if (isAuthenticated) {
          try {
            const enrollRes = await api.enrolments.getCourseEnrolment(id);
            if (enrollRes.success && enrollRes.data) {
              setEnrolment(enrollRes.data);
            }
          } catch (err) {
            // Not enrolled
            setEnrolment(null);
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndStatus();
  }, [id, isAuthenticated]);

  const toggleModule = (idx) => {
    setExpandedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleEnrol = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    setEnrolling(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.enrolments.enrol(id);
      setEnrolment(res.data);
      setMessage({ text: 'Enrolment successful! You can now start learning.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading course curriculum...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p style={{ margin: '1rem 0 2rem' }}>The requested course could not be located in the database.</p>
        <Link to="/courses" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Breadcrumb Back Link */}
      <Link to="/courses" className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={15} />
        <span>Back to Course Catalog</span>
      </Link>

      {/* Message notification */}
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

      {/* Main Grid: Details (Left) + Enrolment Action Box (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column: Course Information & Curriculum */}
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-beginner">{course.category}</span>
            <span className="badge badge-intermediate">{course.difficulty}</span>
          </div>

          <h1 style={{ marginBottom: '1rem', fontSize: '2.35rem' }}>{course.title}</h1>
          
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', color: 'var(--text-main)' }}>
            {course.description}
          </p>

          {/* Quick Meta Info Strip */}
          <div className="card" style={{ display: 'flex', gap: '2rem', padding: '1.25rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Instructor</div>
              <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <User size={15} color="#818cf8" />
                {course.instructor}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Duration</div>
              <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <Clock size={15} color="#38bdf8" />
                {course.duration}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Curriculum</div>
              <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <BookOpen size={15} color="#34d399" />
                {course.modules?.length || 0} Modules • {totalLessons} Lessons
              </div>
            </div>
          </div>

          {/* Course Syllabus / Curriculum Accordion */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Course Curriculum & Lessons</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Structured learning modules containing hands-on lessons and verified topics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {course.modules?.map((mod, modIdx) => (
                <div key={mod._id || modIdx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Module Header Bar */}
                  <div 
                    onClick={() => toggleModule(modIdx)}
                    style={{ 
                      padding: '1.25rem 1.5rem', 
                      background: 'var(--bg-surface)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      userSelect: 'none'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                        Module {modIdx + 1}
                      </span>
                      <h4 style={{ margin: '0.2rem 0 0', color: '#fff' }}>{mod.title}</h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {mod.lessons?.length || 0} lessons
                      </span>
                      {expandedModules[modIdx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Lessons List */}
                  {expandedModules[modIdx] && (
                    <div style={{ padding: '0.75rem 1.5rem' }}>
                      {mod.lessons?.map((lesson, lIdx) => (
                        <div 
                          key={lesson._id || lIdx}
                          style={{ 
                            padding: '0.85rem 0', 
                            borderBottom: lIdx === mod.lessons.length - 1 ? 'none' : '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {lIdx + 1}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.925rem', color: '#fff', fontWeight: 500 }}>
                                {lesson.title}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {lesson.content?.substring(0, 90)}...
                              </div>
                              {lesson.sourceAttribution && (
                                <div style={{ fontSize: '0.72rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                  <Youtube size={12} color="#ef4444" />
                                  <span>{lesson.sourceAttribution}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                            {lesson.duration || '15 mins'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action & Enrolment Card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <img 
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'} 
              alt={course.title} 
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }} 
            />

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                Free Access
              </div>
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                ✓ Full Course & Lesson Content Included
              </div>
            </div>

            {/* If Student is Enrolled */}
            {enrolment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <ProgressBar progress={enrolment.progress} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                    {enrolment.completedLessons?.length || 0} of {totalLessons} lessons completed
                  </div>
                </div>

                <Link 
                  to={`/learn/${course._id}`} 
                  className="btn btn-primary btn-block btn-lg"
                  id="btn-go-to-classroom"
                >
                  <PlayCircle size={18} />
                  <span>Continue Learning</span>
                </Link>
              </div>
            ) : isStudent || !isAuthenticated ? (
              <button 
                onClick={handleEnrol} 
                disabled={enrolling}
                className="btn btn-primary btn-block btn-lg"
                id="btn-enrol-now"
              >
                <Sparkles size={18} />
                <span>{enrolling ? 'Enrolling...' : 'Enrol in Course Now'}</span>
              </button>
            ) : isAdmin ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You are logged in as Administrator.
                </div>
                <Link to={`/admin/courses/edit/${course._id}`} className="btn btn-secondary btn-block">
                  Edit Course Curriculum
                </Link>
              </div>
            ) : null}

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={15} color="var(--success)" />
                <span>Immediate self-paced access</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={15} color="var(--success)" />
                <span>Interactive progress tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} color="var(--success)" />
                <span>Certificate of Mini-Project Completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
