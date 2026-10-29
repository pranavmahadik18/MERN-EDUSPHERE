const User = require('../models/User');
const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');

// @desc    Get Admin Dashboard metrics & statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalEnrolments = await Enrolment.countDocuments();
    const completedEnrolments = await Enrolment.countDocuments({ progress: 100 });

    // Recent Enrolments (last 6)
    const recentEnrolments = await Enrolment.find()
      .populate('student', 'name email')
      .populate('course', 'title category thumbnail')
      .sort({ createdAt: -1 })
      .limit(6);

    // Course Popularity Breakdown
    const popularCoursesAgg = await Enrolment.aggregate([
      {
        $group: {
          _id: '$course',
          enrolmentCount: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      },
      { $sort: { enrolmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $project: {
          courseId: '$_id',
          title: '$courseDetails.title',
          category: '$courseDetails.category',
          instructor: '$courseDetails.instructor',
          enrolmentCount: 1,
          avgProgress: { $round: ['$avgProgress', 1] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        totalEnrolments,
        completedEnrolments,
        completionRate:
          totalEnrolments > 0
            ? Math.round((completedEnrolments / totalEnrolments) * 100)
            : 0
      },
      recentEnrolments,
      popularCourses: popularCoursesAgg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered students with enrolment counts
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'Student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get enrolment count for each student
    const studentsWithEnrolments = await Promise.all(
      students.map(async (student) => {
        const enrolments = await Enrolment.find({ student: student._id }).populate('course', 'title');
        return {
          ...student.toObject(),
          enrolmentsCount: enrolments.length,
          enrolledCourses: enrolments.map((e) => ({
            id: e.course ? e.course._id : null,
            title: e.course ? e.course.title : 'Deleted Course',
            progress: e.progress,
            enrolledAt: e.enrolledAt
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithEnrolments.length,
      data: studentsWithEnrolments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrolments across all courses
// @route   GET /api/admin/enrolments
// @access  Private/Admin
const getAllEnrolments = async (req, res, next) => {
  try {
    const enrolments = await Enrolment.find()
      .populate('student', 'name email')
      .populate('course', 'title category instructor duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrolments.length,
      data: enrolments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getAllEnrolments
};
