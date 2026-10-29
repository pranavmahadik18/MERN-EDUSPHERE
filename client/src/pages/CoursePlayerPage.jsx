import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { CertificateModal } from '../components/CertificateModal';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  Award, 
  Lock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle,
  Sparkles,
  Youtube,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolment, setEnrolment] = useState(null);
  const [unlockedModules, setUnlockedModules] = useState([true]);
  const [loading, setLoading] = useState(true);

  // Active module & lesson indices
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // YouTube Player State
  const [ytPlayerReady, setYtPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playerError, setPlayerError] = useState(null);



  // Verification & Tracking State
  const [lessonProgressData, setLessonProgressData] = useState({
    watchSeconds: 0,
    maxContinuousPosition: 0,
    completed: false,
    coveragePercent: 0
  });
  const [seekWarning, setSeekWarning] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'synced' | 'warning'
  const [showCertModal, setShowCertModal] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState(null);

  // Refs for player tracking
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const lastReportedTimeRef = useRef(0);
  const lastCheckpointSentRef = useRef(Date.now());
  const maxVerifiedPosRef = useRef(0);

  // Fetch Course & Enrolment Data
  const loadCourseData = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.all([
        api.courses.getById(courseId),
        api.enrolments.getCourseEnrolment(courseId)
      ]);

      const c = courseRes.data;
      const e = enrollRes.data;
      setCourse(c);
      setEnrolment(e);
      setUnlockedModules(enrollRes.unlockedModules || [true]);
      if (enrollRes.certificate) {
        setEarnedCertificate(enrollRes.certificate);
      }

      // Restore last accessed lesson position if available
      if (e.lastAccessedLesson?.lessonId && c.modules) {
        for (let m = 0; m < c.modules.length; m++) {
          const lIdx = (c.modules[m].lessons || []).findIndex(
            (l) => l._id.toString() === e.lastAccessedLesson.lessonId.toString()
          );
          if (lIdx !== -1 && (enrollRes.unlockedModules?.[m] || m === 0)) {
            setActiveModuleIdx(m);
            setActiveLessonIdx(lIdx);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load learning player data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const currentModule = course?.modules?.[activeModuleIdx];
  const currentLesson = currentModule?.lessons?.[activeLessonIdx];

  // Helper: Is lesson completed in enrolment
  const isLessonCompleted = (lessonId) => {
    return enrolment?.completedLessons?.some((id) => id.toString() === lessonId?.toString());
  };

  // Helper: Is module unlocked
  const isModuleUnlocked = (mIdx) => {
    if (mIdx === 0) return true;
    return Boolean(unlockedModules[mIdx]);
  };

  // Linear flat list of all lessons for linear navigation
  const allLessons = [];
  course?.modules?.forEach((mod, mIdx) => {
    mod.lessons?.forEach((les, lIdx) => {
      allLessons.push({
        moduleIdx: mIdx,
        lessonIdx: lIdx,
        lesson: les,
        moduleTitle: mod.title,
        isUnlocked: isModuleUnlocked(mIdx),
        isCompleted: isLessonCompleted(les._id)
      });
    });
  });

  const currentFlatIndex = allLessons.findIndex(
    (item) => item.moduleIdx === activeModuleIdx && item.lessonIdx === activeLessonIdx
  );

  // Initialize YouTube IFrame API script tag once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or re-create YouTube Player when lesson changes
  useEffect(() => {
    if (!currentLesson || !currentLesson.youtubeVideoId) return;

    // Retrieve saved progress for this specific lesson from enrolment
    const savedLp = enrolment?.lessonProgress?.find(
      (p) => p.lessonId?.toString() === currentLesson._id?.toString()
    );

    const segmentStart = currentLesson.startSeconds || 0;
    const initialPosition = savedLp?.lastPosition && savedLp.lastPosition >= segmentStart
      ? savedLp.lastPosition
      : segmentStart;

    maxVerifiedPosRef.current = Math.max(segmentStart, savedLp?.maxContinuousPosition || segmentStart);
    lastReportedTimeRef.current = initialPosition;
    lastCheckpointSentRef.current = Date.now();

    setLessonProgressData({
      watchSeconds: savedLp?.watchSeconds || (savedLp?.completed ? currentLesson.durationSeconds : 0),
      maxContinuousPosition: maxVerifiedPosRef.current,
      completed: isLessonCompleted(currentLesson._id) || Boolean(savedLp?.completed),
      coveragePercent: savedLp?.completed ? 100 : Math.min(100, Math.round(((savedLp?.watchSeconds || 0) / Math.max(10, (currentLesson.endSeconds || currentLesson.durationSeconds) - segmentStart)) * 100))
    });

    setCurrentTime(initialPosition);
    setIsPlaying(false);
    setYtPlayerReady(false);
    setSeekWarning('');

    const initPlayer = () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying existing player:', e);
        }
      }

      playerRef.current = new window.YT.Player('youtube-player-element', {
        videoId: currentLesson.youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // hide native seek bar to prevent scrubbing
          disablekb: 1, // disable keyboard seek shortcuts
          enablejsapi: 1,
          fs: 0, // controlled fullscreen via button
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          start: Math.floor(initialPosition)
        },
        events: {
          onReady: (event) => {
            setYtPlayerReady(true);
            try {
              event.target.setVolume(volume);
              if (initialPosition > segmentStart) {
                event.target.seekTo(initialPosition, true);
              }
            } catch (err) {
              console.warn(err);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED ||
              event.data === window.YT.PlayerState.CUED
            ) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
              const code = event.data;
              let msg = '';
              switch (code) {
                case 2:
                  msg = 'Invalid video ID.';
                  break;
                case 5:
                  msg = 'Playback error (HTML5 issue).';
                  break;
                case 100:
                  msg = 'Video not found or removed.';
                  break;
                case 101:
                case 150:
                  msg = 'Embedding not permitted by video owner.';
                  break;
                default:
                  msg = 'Unexpected player error.';
              }
              console.error('YouTube Player Error', code, msg);
              setPlayerError({ code, msg });
            }
          }

      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [currentLesson?._id, currentLesson?.youtubeVideoId]);

  // Main Sequential Playback & Anti-Skip Monitoring Loop (Runs every 400ms)
  useEffect(() => {
    if (!ytPlayerReady || !playerRef.current || !currentLesson) return;

    const segmentStart = currentLesson.startSeconds || 0;
    const segmentEnd = currentLesson.endSeconds || currentLesson.durationSeconds || 1800;

    trackingIntervalRef.current = setInterval(async () => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      try {
        const playerState = playerRef.current.getPlayerState();
        const currentPlaybackTime = playerRef.current.getCurrentTime();
        setCurrentTime(currentPlaybackTime);

        // Enforce Segment Boundaries
        if (currentPlaybackTime < segmentStart - 1.0) {
          playerRef.current.seekTo(segmentStart, true);
          return;
        }

        // When genuinely playing
        if (playerState === window.YT.PlayerState.PLAYING) {
          // --- ANTI-SKIP VERIFICATION ---
          // Use local progressive tracking with tolerance to avoid false positives.
          // Update the locally verified max position continuously.
          if (currentPlaybackTime > maxVerifiedPosRef.current) {
            // Allow small forward drift (<= 5s) as natural playback progression.
            if (currentPlaybackTime - maxVerifiedPosRef.current <= 5) {
              maxVerifiedPosRef.current = currentPlaybackTime;
            } else {
              // Detected a suspicious forward jump (potential cheat)
              playerRef.current.pauseVideo();
              playerRef.current.seekTo(maxVerifiedPosRef.current, true);
              setIsPlaying(false);
              setSeekWarning('Forward seeking is disabled. Please watch sequentially to earn lesson credit.');
              setSyncStatus('warning');
              setTimeout(() => {
                setSeekWarning('');
                setSyncStatus('idle');
              }, 5000);
              return;
            }
          }

          // Legitimate sequential advancement for checkpoint reporting
          const prevTime = lastReportedTimeRef.current;
          const now = Date.now();

          // Send checkpoint every 3.5 seconds of forward progression
          if (now - lastCheckpointSentRef.current >= 3500 && currentPlaybackTime > prevTime) {
            setSyncStatus('saving');
            lastCheckpointSentRef.current = now;

            const res = await api.enrolments.updatePlaybackProgress(courseId, currentLesson._id, {
              currentPosition: currentPlaybackTime,
              intervalStart: prevTime,
              intervalEnd: currentPlaybackTime
            });

            lastReportedTimeRef.current = currentPlaybackTime;

            if (res.success) {
              setSyncStatus('synced');
              if (res.lessonProgress) {
                // Server may return a higher verified position; keep the max.
                maxVerifiedPosRef.current = Math.max(maxVerifiedPosRef.current, res.lessonProgress.maxContinuousPosition);
                setLessonProgressData({
                  watchSeconds: res.lessonProgress.watchSeconds,
                  maxContinuousPosition: res.lessonProgress.maxContinuousPosition,
                  completed: res.lessonProgress.completed,
                  coveragePercent: res.lessonProgress.coveragePercent
                });
              }

              // Update enrolment completion metrics in local state
              setEnrolment((prev) => ({
                ...prev,
                progress: res.enrolmentProgress,
                completedLessons: res.completedLessons,
                completedModules: res.completedModules,
                isCompleted: res.isCompleted
              }));

              if (res.certificate) {
                setEarnedCertificate(res.certificate);
              }

              // Re-check module unlocking
              const updatedUnlocked = [...unlockedModules];
              const completedSet = new Set(res.completedLessons.map((id) => id.toString()));
              let allPriorDone = true;
              course?.modules?.forEach((m, idx) => {
                if (idx === 0) {
                  updatedUnlocked[0] = true;
                } else {
                  updatedUnlocked[idx] = allPriorDone;
                }
                const done = (m.lessons || []).every((l) => completedSet.has(l._id.toString()));
                if (!done) allPriorDone = false;
              });
              setUnlockedModules(updatedUnlocked);

              setTimeout(() => setSyncStatus('idle'), 2000);
            }
          }
        }
      } catch (err) {
        console.warn('Playback tracking loop warning:', err);
      }
    }, 400);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [ytPlayerReady, currentLesson?._id, courseId, unlockedModules, course]);

  // Custom Controls Handlers
  const handlePlay = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  const handleRewind10 = () => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const cur = playerRef.current.getCurrentTime();
      const segmentStart = currentLesson?.startSeconds || 0;
      const target = Math.max(segmentStart, cur - 10);
      playerRef.current.seekTo(target, true);
      lastReportedTimeRef.current = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(val);
      if (val > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Lesson Selection & Navigation Handlers
  const handleSelectLesson = (mIdx, lIdx) => {
    if (!isModuleUnlocked(mIdx)) {
      setSeekWarning(`Module ${mIdx + 1} is locked! You must complete earlier modules sequentially.`);
      setTimeout(() => setSeekWarning(''), 4000);
      return;
    }
    setActiveModuleIdx(mIdx);
    setActiveLessonIdx(lIdx);
  };

  const handleNextLesson = () => {
    if (currentFlatIndex < allLessons.length - 1) {
      const nextItem = allLessons[currentFlatIndex + 1];
      if (!isModuleUnlocked(nextItem.moduleIdx)) {
        setSeekWarning(`Module ${nextItem.moduleIdx + 1} is locked! Complete current module first.`);
        setTimeout(() => setSeekWarning(''), 4000);
        return;
      }
      setActiveModuleIdx(nextItem.moduleIdx);
      setActiveLessonIdx(nextItem.lessonIdx);
    }
  };

  const handlePrevLesson = () => {
    if (currentFlatIndex > 0) {
      const prevItem = allLessons[currentFlatIndex - 1];
      setActiveModuleIdx(prevItem.moduleIdx);
      setActiveLessonIdx(prevItem.lessonIdx);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Preparing EduSphere Video Classroom...</div>
        <div>Initializing sequential playback engine and authenticating enrollment</div>
      </div>
    );
  }

  if (!course || !enrolment) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Course Access Restricted</h2>
        <p style={{ margin: '1rem 0 2rem' }}>You must be actively enrolled to participate in this course.</p>
        <Link to={`/courses/${courseId}`} className="btn btn-primary">
          View Course Enrollment Details
        </Link>
      </div>
    );
  }

  const segmentStart = currentLesson?.startSeconds || 0;
  const segmentEnd = currentLesson?.endSeconds || currentLesson?.durationSeconds || 1800;
  const segmentDuration = Math.max(1, segmentEnd - segmentStart);
  const currentElapsedInSegment = Math.max(0, currentTime - segmentStart);
  const currentWatchedPercent = Math.min(100, Math.round((currentElapsedInSegment / segmentDuration) * 100));

  const isCurrentLessonDone = isLessonCompleted(currentLesson?._id) || lessonProgressData.completed;
  const totalCourseLessons = allLessons.length;
  const completedCourseLessons = enrolment.completedLessons?.length || 0;
  const isCourseComplete = enrolment.isCompleted || (totalCourseLessons > 0 && completedCourseLessons >= totalCourseLessons);

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/dashboard" className="btn btn-outline btn-sm" id="btn-back-dashboard">
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#fff' }}>{course.title}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Instructor: {course.instructor} • {course.modules?.length || 0} Modules • {totalCourseLessons} Video Lessons
            </div>
          </div>
        </div>

        {/* Course Progress Widget & Certificate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
              <span>Course Progress</span>
              <span style={{ fontWeight: 700, color: '#818cf8' }}>{enrolment.progress}%</span>
            </div>
            <ProgressBar progress={enrolment.progress} />
          </div>

          {isCourseComplete && (
            <button
              onClick={() => setShowCertModal(true)}
              className="btn btn-success btn-sm"
              id="btn-view-earned-certificate"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <Award size={16} />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="player-layout">
        {/* Left Sidebar: Sequential Modules & Video Lessons */}
        <div className="player-sidebar">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} color="#818cf8" />
              <span>Syllabus & Video Lessons</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {completedCourseLessons}/{totalCourseLessons} Done
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {course.modules?.map((mod, mIdx) => {
              const unlocked = isModuleUnlocked(mIdx);
              const modLessons = mod.lessons || [];
              const modCompleted = modLessons.length > 0 && modLessons.every((l) => isLessonCompleted(l._id));

              return (
                <div 
                  key={mod._id || mIdx} 
                  style={{ 
                    background: unlocked ? 'var(--bg-surface)' : 'rgba(15, 23, 42, 0.4)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '0.75rem',
                    border: unlocked ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.04)',
                    opacity: unlocked ? 1 : 0.65
                  }}
                >
                  {/* Module Header Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: unlocked ? '#93c5fd' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {!unlocked && <Lock size={13} color="#94a3b8" />}
                      <span>Module {mIdx + 1}: {mod.title}</span>
                    </div>

                    {modCompleted ? (
                      <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                        Completed ✓
                      </span>
                    ) : unlocked ? (
                      <span className="badge badge-beginner" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                        In Progress
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Lessons list inside module */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {mod.lessons?.map((lesson, lIdx) => {
                      const completed = isLessonCompleted(lesson._id);
                      const isActive = mIdx === activeModuleIdx && lIdx === activeLessonIdx;

                      return (
                        <div
                          key={lesson._id || lIdx}
                          onClick={() => handleSelectLesson(mIdx, lIdx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: unlocked ? 'pointer' : 'not-allowed',
                            background: isActive 
                              ? 'rgba(79, 70, 229, 0.3)' 
                              : 'transparent',
                            border: isActive 
                              ? '1px solid rgba(99, 102, 241, 0.5)' 
                              : '1px solid transparent',
                            transition: 'var(--transition)'
                          }}
                          title={!unlocked ? 'Module is locked. Complete previous modules sequentially.' : lesson.title}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            {completed ? (
                              <CheckCircle size={15} color="var(--success)" />
                            ) : !unlocked ? (
                              <Lock size={13} color="var(--text-muted)" />
                            ) : isActive ? (
                              <Play size={13} color="#818cf8" />
                            ) : (
                              <Circle size={14} color="var(--text-muted)" />
                            )}
                          </span>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: isActive ? '#fff' : completed ? 'var(--text-secondary)' : unlocked ? 'var(--text-main)' : 'var(--text-muted)',
                              fontWeight: isActive ? 600 : 400,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {lesson.title}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem' }}>
                              <span>{lesson.duration || '20 mins'}</span>
                              {lesson.sourceAttribution && <span>• {lesson.sourceAttribution}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Video Classroom Area */}
        <div className="player-content-area" style={{ display: 'flex', flexDirection: 'column' }}>
          {playerError ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2>Video cannot be played</h2>
          <p>{playerError.msg} (Error code {playerError.code})</p>
          <button className="btn btn-primary" onClick={() => setPlayerError(null)}>Retry</button>
        </div>
      ) : currentLesson ? (
            <>
              {/* Lesson Top Bar & Status Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-beginner">
                      Module {activeModuleIdx + 1} • Lesson {activeLessonIdx + 1}
                    </span>

                    {isCurrentLessonDone ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={13} />
                        <span>Completed ✓</span>
                      </span>
                    ) : isPlaying ? (
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Play size={11} fill="currentColor" />
                        <span>In Progress ({lessonProgressData.coveragePercent}% Watched)</span>
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                        Paused
                      </span>
                    )}

                    {syncStatus === 'saving' && (
                      <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
                        Verifying progress...
                      </span>
                    )}
                    {syncStatus === 'synced' && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>
                        ✓ Progress verified
                      </span>
                    )}
                  </div>

                  <h1 style={{ fontSize: '1.65rem', color: '#fff', margin: '0.2rem 0 0.35rem' }}>
                    {currentLesson.title}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} />
                      Duration: {currentLesson.duration || formatTime(segmentDuration)}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Youtube size={14} color="#ef4444" />
                      {currentLesson.sourceAttribution || 'Traversy Media on YouTube'}
                    </span>
                  </div>
                </div>

                {/* Course Completion / Certificate Alert if finished */}
                {isCourseComplete && (
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="btn btn-success"
                    id="btn-header-view-certificate"
                  >
                    <Award size={16} />
                    <span>View Earned Certificate</span>
                  </button>
                )}
              </div>

              {/* Anti-Skip Warning Notification Banner */}
              {seekWarning && (
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.15)', 
                  border: '1px solid rgba(245, 158, 11, 0.4)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '0.75rem 1rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#fbbf24',
                  fontSize: '0.875rem'
                }}>
                  <AlertTriangle size={18} />
                  <span>{seekWarning}</span>
                </div>
              )}

              {/* Embedded YouTube Player Container */}
              <div 
                ref={playerContainerRef}
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  background: '#000', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                  aspectRatio: '16 / 9'
                }}
              >
                {/* The actual YouTube iframe mounts here */}
                <div id="youtube-player-element" style={{ width: '100%', height: '100%' }} />

                {/* Overlay to block direct right-clicks or unwanted native skip controls */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    pointerEvents: 'none' 
                  }} 
                />
              </div>

              {/* Custom Player Controls & Verified Timeline */}
              <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem 1.25rem', 
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                {/* Real-time Verified Timeline Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    <span>
                      Position: {formatTime(currentTime)} / {formatTime(segmentEnd)}
                    </span>
                    <span>
                      Verified Watched: <strong>{formatTime(lessonProgressData.watchSeconds)}</strong> ({lessonProgressData.coveragePercent}%)
                    </span>
                  </div>

                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '8px', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    {/* Contiguous verified progress bar */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      height: '100%', 
                      width: `${lessonProgressData.coveragePercent}%`, 
                      background: lessonProgressData.completed ? 'var(--success)' : 'linear-gradient(90deg, #6366f1, #818cf8)',
                      transition: 'width 0.3s ease'
                    }} />

                    {/* Current Playhead needle */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: `${currentWatchedPercent}%`, 
                      width: '3px', 
                      height: '100%', 
                      background: '#fff' 
                    }} />
                  </div>
                </div>

                {/* Controls Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Left Controls: Play/Pause/Rewind */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {isPlaying ? (
                      <button 
                        onClick={handlePause} 
                        className="btn btn-secondary btn-sm"
                        id="player-btn-pause"
                        title="Pause Video"
                      >
                        <Pause size={16} />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handlePlay} 
                        className="btn btn-primary btn-sm"
                        id="player-btn-play"
                        title="Play Video"
                      >
                        <Play size={16} />
                        <span>{currentTime > segmentStart ? 'Resume' : 'Play'}</span>
                      </button>
                    )}

                    <button 
                      onClick={handleRewind10} 
                      className="btn btn-outline btn-sm"
                      id="player-btn-rewind"
                      title="Rewind 10 Seconds"
                    >
                      <RotateCcw size={15} />
                      <span>-10s</span>
                    </button>
                  </div>

                  {/* Right Controls: Volume & Fullscreen */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button 
                        onClick={handleToggleMute} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ width: '70px', accentColor: '#818cf8', cursor: 'pointer' }}
                        title={`Volume: ${volume}%`}
                      />
                    </div>

                    <button 
                      onClick={handleFullscreen} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      title="Toggle Fullscreen"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lesson Explanatory Text & Curriculum Notes */}
              <div style={{ 
                marginTop: '1.5rem', 
                background: 'rgba(11, 15, 25, 0.4)', 
                padding: '1.75rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)' 
              }}>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
                  Lecture Overview & Learning Objectives
                </h3>
                <div style={{ fontSize: '0.975rem', lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {currentLesson.content}
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Required playback completion: Full sequential viewing</span>
                  <span>Checkpoint interval: 3.5s server-validated</span>
                </div>
              </div>

              {/* Bottom Navigation: Prev & Next Lesson Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  onClick={handlePrevLesson}
                  disabled={currentFlatIndex <= 0}
                  className="btn btn-secondary"
                  id="btn-prev-lesson"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Lesson</span>
                </button>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Lesson {currentFlatIndex + 1} of {allLessons.length}
                </div>

                <button
                  onClick={handleNextLesson}
                  disabled={currentFlatIndex >= allLessons.length - 1 || (!isCurrentLessonDone && !allLessons[currentFlatIndex + 1]?.isUnlocked)}
                  className="btn btn-primary"
                  id="btn-next-lesson"
                  title={!isCurrentLessonDone ? 'Complete current lesson to unlock next' : 'Go to next lesson'}
                >
                  <span>Next Lesson</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Select a lesson from the syllabus to begin studying.
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && earnedCertificate && (
        <CertificateModal
          certificate={earnedCertificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
