const crypto = require('crypto');
const Enrolment = require('../models/Enrolment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');

/**
 * Merge overlapping and contiguous intervals: [[start, end], ...]
 * Returns merged array, total unique watched seconds, and continuous progress from segment start
 */
function mergeIntervals(intervals, segmentStart = 0) {
  if (!intervals || intervals.length === 0) {
    return { merged: [], totalSeconds: 0, maxContinuousFromStart: segmentStart };
  }

  // Filter valid intervals and sort by start
  const valid = intervals
    .filter((iv) => Array.isArray(iv) && iv.length === 2 && iv[1] > iv[0])
    .sort((a, b) => a[0] - b[0]);

  if (valid.length === 0) {
    return { merged: [], totalSeconds: 0, maxContinuousFromStart: segmentStart };
  }

  const merged = [];
  let curr = [valid[0][0], valid[0][1]];

  for (let i = 1; i < valid.length; i++) {
    const next = valid[i];
    // Merge if overlapping or within 1.5 seconds gap
    if (next[0] <= curr[1] + 1.5) {
      curr[1] = Math.max(curr[1], next[1]);
    } else {
      merged.push(curr);
      curr = [next[0], next[1]];
    }
  }
  merged.push(curr);

  // Compute total unique watched seconds
  let totalSeconds = 0;
  merged.forEach((iv) => {
    totalSeconds += Math.max(0, iv[1] - iv[0]);
  });

  // Calculate contiguous coverage from segment start
  let cont = segmentStart;
  for (const iv of merged) {
    if (iv[0] <= cont + 2.5) {
      cont = Math.max(cont, iv[1]);
    } else {
      break;
    }
  }

  return {
    merged,
    totalSeconds: Math.round(totalSeconds * 10) / 10,
    maxContinuousFromStart: Math.round(cont * 10) / 10
  };
}

// @desc    Enrol in a course
// @route   POST /api/enrolments
// @access  Private/Student
const enrolCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required to enrol'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const existingEnrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrolment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const enrolment = await Enrolment.create({
      student: req.user._id,
      course: courseId,
      completedLessons: [],
      completedModules: [],
      lessonProgress: [],
      progress: 0,
      isCompleted: false
    });

    const populatedEnrolment = await Enrolment.findById(enrolment._id).populate('course');

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully!',
      data: populatedEnrolment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's enrolled courses
// @route   GET /api/enrolments/my-enrolments
// @access  Private
const getMyEnrolments = async (req, res, next) => {
  try {
    const enrolments = await Enrolment.find({ student: req.user._id })
      .populate('course')
      .sort({ lastAccessed: -1 });

    // Also attach certificate information if available
    const enrichedEnrolments = await Promise.all(
      enrolments.map(async (enrolment) => {
        const obj = enrolment.toObject();
        if (enrolment.isCompleted || enrolment.progress === 100) {
          const cert = await Certificate.findOne({
            student: req.user._id,
            course: enrolment.course?._id
          });
          obj.certificate = cert || null;
        }
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedEnrolments.length,
      data: enrichedEnrolments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolment details for a specific course
// @route   GET /api/enrolments/course/:courseId
// @access  Private
const getEnrolmentByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    }).populate('course');

    if (!enrolment) {
      return res.status(404).json({
        success: false,
        isEnrolled: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Determine unlocked modules based on strict sequential progression
    // Module 0 is always unlocked.
    // Module m is unlocked if and only if all lessons in modules 0 through m - 1 are completed.
    const unlockedModules = [];
    const completedLessonSet = new Set(
      enrolment.completedLessons?.map((id) => id.toString()) || []
    );

    let allPriorModulesCompleted = true;

    course.modules?.forEach((mod, idx) => {
      if (idx === 0) {
        unlockedModules.push(true);
      } else {
        unlockedModules.push(allPriorModulesCompleted);
      }

      // Check if current module is fully completed
      const modLessons = mod.lessons || [];
      const isCurrentModCompleted =
        modLessons.length > 0 &&
        modLessons.every((l) => completedLessonSet.has(l._id.toString()));

      if (!isCurrentModCompleted) {
        allPriorModulesCompleted = false;
      }
    });

    // Check certificate eligibility
    const totalLessons = course.modules?.reduce(
      (acc, mod) => acc + (mod.lessons?.length || 0),
      0
    ) || 0;

    const isEligibleForCertificate =
      enrolment.isCompleted || (totalLessons > 0 && enrolment.completedLessons?.length >= totalLessons);

    let certificate = null;
    if (isEligibleForCertificate) {
      certificate = await Certificate.findOne({
        student: req.user._id,
        course: courseId
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      data: enrolment,
      unlockedModules,
      isEligibleForCertificate,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verified playback interval checkpoint
// @route   POST /api/enrolments/course/:courseId/lesson/:lessonId/progress
// @access  Private/Student
const updatePlaybackProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    let { currentPosition, intervalStart, intervalEnd } = req.body;

    currentPosition = Number(currentPosition) || 0;
    intervalStart = Number(intervalStart) || 0;
    intervalEnd = Number(intervalEnd) || currentPosition;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrolment) {
      return res.status(404).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Locate the lesson and its parent module
    let foundModule = null;
    let foundLesson = null;
    let moduleIdx = -1;

    for (let m = 0; m < (course.modules || []).length; m++) {
      const mod = course.modules[m];
      const les = (mod.lessons || []).find((l) => l._id.toString() === lessonId);
      if (les) {
        foundModule = mod;
        foundLesson = les;
        moduleIdx = m;
        break;
      }
    }

    if (!foundLesson || !foundModule) {
      return res.status(404).json({ success: false, message: 'Lesson not found in course' });
    }

    // Enforce sequential module unlocking rule
    if (moduleIdx > 0) {
      const completedSet = new Set(enrolment.completedLessons?.map((id) => id.toString()) || []);
      for (let prevIdx = 0; prevIdx < moduleIdx; prevIdx++) {
        const prevMod = course.modules[prevIdx];
        const allPrevLessonsDone = (prevMod.lessons || []).every((l) =>
          completedSet.has(l._id.toString())
        );
        if (!allPrevLessonsDone) {
          return res.status(403).json({
            success: false,
            message: `Module ${moduleIdx + 1} is locked. You must complete Module ${prevIdx + 1} first.`
          });
        }
      }
    }

    const segmentStart = foundLesson.startSeconds || 0;
    const segmentEnd = foundLesson.endSeconds || foundLesson.durationSeconds || 1800;
    const segmentDuration = Math.max(10, segmentEnd - segmentStart);

    // Locate or create lesson progress in enrolment
    let lp = enrolment.lessonProgress.find((p) => p.lessonId.toString() === lessonId);
    if (!lp) {
      lp = {
        lessonId: foundLesson._id,
        lastPosition: segmentStart,
        maxContinuousPosition: segmentStart,
        intervals: [],
        watchSeconds: 0,
        completed: false
      };
      enrolment.lessonProgress.push(lp);
    }

    // Anti-skipping check:
    // If student attempted forward skip past current max continuous progress + tolerance (4s)
    const currentMax = Math.max(segmentStart, lp.maxContinuousPosition || segmentStart);
    let forwardSkippingDetected = false;

    if (intervalStart > currentMax + 4.0) {
      forwardSkippingDetected = true;
      lp.lastPosition = currentPosition;
      enrolment.lastAccessed = Date.now();
      await enrolment.save();

      return res.status(200).json({
        success: true,
        forwardSkippingDetected: true,
        message: 'Forward seeking detected. Unwatched portions cannot be credited.',
        maxContinuousPosition: lp.maxContinuousPosition,
        lastPosition: lp.lastPosition,
        watchSeconds: lp.watchSeconds,
        completed: lp.completed,
        progress: enrolment.progress
      });
    }

    // Legitimate sequential interval: Clamp to bounds
    const clampedStart = Math.max(segmentStart, Math.min(intervalStart, segmentEnd));
    const clampedEnd = Math.max(clampedStart, Math.min(intervalEnd, segmentEnd));

    // Valid playback slice (ensure delta <= 12s to avoid forged giant intervals)
    if (clampedEnd > clampedStart && clampedEnd - clampedStart <= 12) {
      lp.intervals.push([clampedStart, clampedEnd]);
    }

    // Merge intervals and recalculate unique watch time & continuous progress
    const mergeRes = mergeIntervals(lp.intervals, segmentStart);
    lp.intervals = mergeRes.merged;
    lp.watchSeconds = mergeRes.totalSeconds;
    lp.maxContinuousPosition = Math.max(lp.maxContinuousPosition || segmentStart, mergeRes.maxContinuousFromStart);
    lp.lastPosition = currentPosition;

    // Check completion criteria:
    // 1. Contiguous playback reached within 3 seconds of segment end
    // 2. Unique watch seconds >= 95% of segment duration
    const reachedEnd = lp.maxContinuousPosition >= segmentEnd - 3.0;
    const coveredSufficiently = lp.watchSeconds >= segmentDuration * 0.95;

    if ((reachedEnd && coveredSufficiently) && !lp.completed) {
      lp.completed = true;
      lp.completedAt = new Date();

      if (!enrolment.completedLessons.some((id) => id.toString() === lessonId)) {
        enrolment.completedLessons.push(foundLesson._id);
      }
    }

    // Update last accessed lesson
    enrolment.lastAccessedLesson = {
      lessonId: foundLesson._id,
      moduleId: foundModule._id,
      positionSeconds: currentPosition
    };
    enrolment.lastAccessed = Date.now();

    // Check module completion: All lessons in module completed?
    const completedSetNow = new Set(enrolment.completedLessons.map((id) => id.toString()));
    const isModuleDone = (foundModule.lessons || []).every((l) => completedSetNow.has(l._id.toString()));

    if (isModuleDone && !enrolment.completedModules.some((id) => id.toString() === foundModule._id.toString())) {
      enrolment.completedModules.push(foundModule._id);
    }

    // Recalculate total course progress
    let totalLessonsCount = 0;
    course.modules?.forEach((m) => {
      totalLessonsCount += (m.lessons || []).length;
    });

    if (totalLessonsCount > 0) {
      enrolment.progress = Math.min(
        100,
        Math.round((enrolment.completedLessons.length / totalLessonsCount) * 100)
      );
    }

    // Check full course completion
    let certificate = null;
    if (enrolment.completedLessons.length >= totalLessonsCount && totalLessonsCount > 0) {
      enrolment.isCompleted = true;
      enrolment.progress = 100;
      enrolment.completedAt = enrolment.completedAt || new Date();

      // Ensure certificate is issued
      let existingCert = await Certificate.findOne({
        student: req.user._id,
        course: course._id
      });

      if (!existingCert) {
        const certId = `EDU-2026-${(course.category || 'MERN').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        existingCert = await Certificate.create({
          certificateId: certId,
          student: req.user._id,
          studentName: req.user.name,
          studentEmail: req.user.email,
          course: course._id,
          courseTitle: course.title,
          instructor: course.instructor,
          completionDate: enrolment.completedAt,
          signatoryName: 'Dr. Aris Thorne',
          signatoryRole: 'Dean of Academic Affairs & EduSphere Director',
          verificationUrl: `/verify-certificate/${certId}`
        });
      }
      certificate = existingCert;
    }

    await enrolment.save();

    res.status(200).json({
      success: true,
      forwardSkippingDetected: false,
      lessonProgress: {
        lessonId: lp.lessonId,
        lastPosition: lp.lastPosition,
        maxContinuousPosition: lp.maxContinuousPosition,
        watchSeconds: lp.watchSeconds,
        completed: lp.completed,
        coveragePercent: Math.min(100, Math.round((lp.watchSeconds / segmentDuration) * 100))
      },
      enrolmentProgress: enrolment.progress,
      isCompleted: enrolment.isCompleted,
      completedLessons: enrolment.completedLessons,
      completedModules: enrolment.completedModules,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or mark a lesson as completed (Admin or manual test helper)
// @route   POST /api/enrolments/course/:courseId/lesson/:lessonId
// @access  Private
const toggleLessonProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { status } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrolment) {
      return res.status(404).json({ success: false, message: 'You are not enrolled in this course' });
    }

    const lessonIndex = enrolment.completedLessons.findIndex(
      (id) => id.toString() === lessonId.toString()
    );

    if (status === 'completed' && lessonIndex === -1) {
      enrolment.completedLessons.push(lessonId);
    } else if (status === 'uncompleted' && lessonIndex !== -1) {
      enrolment.completedLessons.splice(lessonIndex, 1);
    } else if (!status) {
      if (lessonIndex > -1) {
        enrolment.completedLessons.splice(lessonIndex, 1);
      } else {
        enrolment.completedLessons.push(lessonId);
      }
    }

    let totalLessonsCount = 0;
    course.modules?.forEach((mod) => {
      totalLessonsCount += (mod.lessons || []).length;
    });

    if (totalLessonsCount > 0) {
      enrolment.progress = Math.min(
        100,
        Math.round((enrolment.completedLessons.length / totalLessonsCount) * 100)
      );
    } else {
      enrolment.progress = 0;
    }

    if (enrolment.progress === 100) {
      enrolment.isCompleted = true;
      enrolment.completedAt = enrolment.completedAt || new Date();
    } else {
      enrolment.isCompleted = false;
    }

    enrolment.lastAccessed = Date.now();
    await enrolment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      progress: enrolment.progress,
      completedLessons: enrolment.completedLessons,
      isCompleted: enrolment.isCompleted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrolCourse,
  getMyEnrolments,
  getEnrolmentByCourse,
  updatePlaybackProgress,
  toggleLessonProgress
};
