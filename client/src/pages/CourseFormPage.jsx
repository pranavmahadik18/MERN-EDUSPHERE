import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Layers, 
  BookOpen, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Youtube,
  Play,
  X,
  Eye,
  Clock
} from 'lucide-react';

const extractYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url.trim();
};

export const CourseFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [previewModal, setPreviewModal] = useState(null); // { videoId, title, start, end }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    instructor: '',
    duration: '',
    difficulty: 'Beginner',
    thumbnail: '',
    modules: [
      {
        title: 'Module 1: Getting Started',
        lessons: [
          {
            title: 'Lesson 1: Course Overview',
            content: 'Welcome to this course! Here is what we will learn...',
            duration: '15 mins'
          }
        ]
      }
    ]
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchCourseData = async () => {
        try {
          const res = await api.courses.getById(id);
          const c = res.data;
          setFormData({
            title: c.title || '',
            description: c.description || '',
            category: c.category || 'Web Development',
            instructor: c.instructor || '',
            duration: c.duration || '',
            difficulty: c.difficulty || 'Beginner',
            thumbnail: c.thumbnail || '',
            modules: c.modules && c.modules.length > 0 ? c.modules : [
              {
                title: 'Module 1: Introduction',
                lessons: [
                  { title: 'Overview', content: 'Introduction content', duration: '15 mins' }
                ]
              }
            ]
          });
        } catch (err) {
          setError(err.message || 'Failed to load course details');
        } finally {
          setLoading(false);
        }
      };
      fetchCourseData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Module actions
  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: `Module ${prev.modules.length + 1}: New Topic`,
          description: '',
          sequence: prev.modules.length + 1,
          lessons: [
            {
              title: 'Lesson 1: Introduction',
              content: 'Write study notes and lecture details here.',
              duration: '15 mins',
              durationSeconds: 900,
              youtubeVideoId: '',
              videoUrl: '',
              startSeconds: 0,
              endSeconds: 900,
              sequence: 1,
              sourceAttribution: 'Traversy Media on YouTube'
            }
          ]
        }
      ]
    }));
  };

  const removeModule = (modIdx) => {
    if (formData.modules.length <= 1) {
      alert('A course must contain at least one module.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, idx) => idx !== modIdx)
    }));
  };

  const updateModuleField = (modIdx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.modules];
      updated[modIdx][field] = value;
      return { ...prev, modules: updated };
    });
  };

  // Lesson actions inside module
  const addLesson = (modIdx) => {
    setFormData((prev) => {
      const updated = [...prev.modules];
      const lessonCount = updated[modIdx].lessons ? updated[modIdx].lessons.length : 0;
      if (!updated[modIdx].lessons) updated[modIdx].lessons = [];
      updated[modIdx].lessons.push({
        title: `Lesson ${lessonCount + 1}: Topic Name`,
        content: 'Enter the lecture summary, learning outcomes, or practical instructions here.',
        duration: '15 mins',
        durationSeconds: 900,
        youtubeVideoId: '',
        videoUrl: '',
        startSeconds: 0,
        endSeconds: 900,
        sequence: lessonCount + 1,
        sourceAttribution: 'Traversy Media on YouTube'
      });
      return { ...prev, modules: updated };
    });
  };

  const removeLesson = (modIdx, lessonIdx) => {
    setFormData((prev) => {
      const updated = [...prev.modules];
      if (updated[modIdx].lessons.length <= 1) {
        alert('Each module must contain at least one lesson.');
        return prev;
      }
      updated[modIdx].lessons = updated[modIdx].lessons.filter((_, idx) => idx !== lessonIdx);
      return { ...prev, modules: updated };
    });
  };

  const updateLessonField = (modIdx, lessonIdx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.modules];
      const targetLesson = { ...updated[modIdx].lessons[lessonIdx] };

      targetLesson[field] = value;

      // If user pasted a video URL, automatically extract videoId
      if (field === 'videoUrl') {
        const extracted = extractYouTubeId(value);
        if (extracted) {
          targetLesson.youtubeVideoId = extracted;
        }
      }

      // If startSeconds or endSeconds updated, recalculate durationSeconds & duration string
      if (field === 'startSeconds' || field === 'endSeconds') {
        const start = Number(field === 'startSeconds' ? value : targetLesson.startSeconds) || 0;
        const end = Number(field === 'endSeconds' ? value : targetLesson.endSeconds) || 0;
        if (end > start) {
          const delta = end - start;
          targetLesson.durationSeconds = delta;
          const mins = Math.floor(delta / 60);
          const secs = delta % 60;
          targetLesson.duration = `${mins}m ${secs}s`;
        }
      }

      updated[modIdx].lessons[lessonIdx] = targetLesson;
      return { ...prev, modules: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.title || !formData.description || !formData.category || !formData.instructor || !formData.duration) {
      setError('Please fill in all core course fields');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.courses.update(id, formData);
      } else {
        await api.courses.create(formData);
      }
      navigate('/admin/courses');
    } catch (err) {
      setError(err.message || 'Failed to save course. Check server logs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading course information...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/courses" className="btn btn-outline btn-sm" id="btn-back-manage-courses">
            <ArrowLeft size={16} />
            <span>Back to Courses</span>
          </Link>
          <div>
            <h1>{isEditMode ? 'Edit Course Details' : 'Create New Course'}</h1>
            <p>Configure course metadata, modules, and interactive lesson content.</p>
          </div>
        </div>
      </div>

      {error && (
        <div 
          style={{ 
            background: 'var(--danger-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem', 
            color: '#fca5a5', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Core Course Information Card */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>1. Basic Course Details</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="course-title">Course Title *</label>
            <input
              type="text"
              id="course-title"
              name="title"
              className="form-control"
              placeholder="e.g. Full Stack Web Development with MERN"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="course-description">Course Description *</label>
            <textarea
              id="course-description"
              name="description"
              className="form-control"
              placeholder="Provide a comprehensive summary of what students will master..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="course-category">Category *</label>
              <input
                type="text"
                id="course-category"
                name="category"
                className="form-control"
                placeholder="e.g. Web Development"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-instructor">Instructor Name *</label>
              <input
                type="text"
                id="course-instructor"
                name="instructor"
                className="form-control"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.instructor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-duration">Duration *</label>
              <input
                type="text"
                id="course-duration"
                name="duration"
                className="form-control"
                placeholder="e.g. 8 Weeks or 24 Hours"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="course-difficulty">Difficulty Level</label>
              <select
                id="course-difficulty"
                name="difficulty"
                className="form-control"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-thumbnail">Thumbnail Image URL (Optional)</label>
              <input
                type="url"
                id="course-thumbnail"
                name="thumbnail"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.thumbnail}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Modules & Lessons Interactive Builder Card */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff' }}>2. Curriculum Builder (Modules & Lessons)</h3>
              <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Organize learning content into chapters and detailed lessons.
              </p>
            </div>

            <button
              type="button"
              onClick={addModule}
              className="btn btn-secondary btn-sm"
              id="btn-add-module"
            >
              <Plus size={15} />
              <span>Add New Module</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {formData.modules.map((mod, modIdx) => (
              <div 
                key={mod._id || modIdx} 
                style={{ 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '1.5rem' 
                }}
              >
                {/* Module Header & Rename */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                        M{modIdx + 1}
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={mod.title}
                        onChange={(e) => updateModuleField(modIdx, 'title', e.target.value)}
                        placeholder="Module Title (e.g. Module 1: MERN Stack Architecture)"
                        style={{ fontWeight: 600, fontSize: '1rem' }}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeModule(modIdx)}
                      className="btn btn-outline btn-sm"
                      title="Remove Module"
                      style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Module</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    className="form-control"
                    value={mod.description || ''}
                    onChange={(e) => updateModuleField(modIdx, 'description', e.target.value)}
                    placeholder="Module Summary or Objectives (e.g. Overview of full-stack JavaScript architecture...)"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                {/* Lessons inside Module */}
                <div style={{ paddingLeft: '1rem', borderLeft: '2px dashed rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Lessons ({mod.lessons?.length || 0})
                  </div>

                  {mod.lessons?.map((lesson, lIdx) => (
                    <div 
                      key={lesson._id || lIdx}
                      style={{ 
                        background: 'rgba(11, 15, 25, 0.5)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      {/* Row 1: Title, Duration, Remove */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Lesson Title (e.g. Series Introduction)"
                            value={lesson.title}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'title', e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ width: '130px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Duration (e.g. 7m 13s)"
                            value={lesson.duration}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'duration', e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLesson(modIdx, lIdx)}
                          className="btn btn-outline btn-sm"
                          title="Remove Lesson"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={14} color="#fca5a5" />
                        </button>
                      </div>

                      {/* Row 2: YouTube Video Configuration */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            YouTube Video URL
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'videoUrl', e.target.value)}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            YouTube Video ID
                          </label>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. PBTYxXADG_k"
                              value={lesson.youtubeVideoId || ''}
                              onChange={(e) => updateLessonField(modIdx, lIdx, 'youtubeVideoId', e.target.value)}
                            />
                            {lesson.youtubeVideoId && (
                              <button
                                type="button"
                                onClick={() => setPreviewModal({
                                  videoId: lesson.youtubeVideoId,
                                  title: lesson.title,
                                  start: lesson.startSeconds || 0,
                                  end: lesson.endSeconds || 0
                                })}
                                className="btn btn-secondary btn-sm"
                                title="Preview Video"
                                style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Segment Start (sec)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={lesson.startSeconds || 0}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'startSeconds', e.target.value)}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Segment End (sec)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={lesson.endSeconds || 0}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'endSeconds', e.target.value)}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Source Attribution
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Traversy Media on YouTube"
                            value={lesson.sourceAttribution || ''}
                            onChange={(e) => updateLessonField(modIdx, lIdx, 'sourceAttribution', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Row 3: Lesson Notes / Objectives */}
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                          Lesson Overview & Curriculum Notes (shown under player)
                        </label>
                        <textarea
                          className="form-control"
                          placeholder="Lesson overview, key topics, and learning objectives..."
                          value={lesson.content}
                          onChange={(e) => updateLessonField(modIdx, lIdx, 'content', e.target.value)}
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(modIdx)}
                    className="btn btn-outline btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Lesson to Module {modIdx + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/admin/courses" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            id="btn-save-course"
          >
            <Save size={18} />
            <span>{submitting ? 'Saving Course...' : isEditMode ? 'Update Course' : 'Create & Publish Course'}</span>
          </button>
        </div>
      </form>

      {/* Video Preview Modal */}
      {previewModal && (
        <div className="modal-backdrop" onClick={() => setPreviewModal(null)} style={{ zIndex: 1200 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '680px', width: '92%', padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Youtube size={20} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                  Video Preview: {previewModal.title || previewModal.videoId}
                </h3>
              </div>
              <button onClick={() => setPreviewModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ aspectRatio: '16/9', width: '100%', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${previewModal.videoId}?start=${previewModal.start || 0}&autoplay=1`}
                title={previewModal.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Video ID: <strong>{previewModal.videoId}</strong></span>
              <span>Start: {previewModal.start || 0}s {previewModal.end > 0 ? `| End: ${previewModal.end}s` : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
