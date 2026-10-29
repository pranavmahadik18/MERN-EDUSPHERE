const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');

// @desc    Get all courses with optional search and filters
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const { search, category, difficulty } = req.query;
    let query = {};

    // Search by title, description, instructor, or category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { instructor: searchRegex },
        { category: searchRegex }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      duration,
      difficulty,
      thumbnail,
      modules
    } = req.body;

    if (!title || !description || !category || !instructor || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required course fields'
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      instructor,
      duration,
      difficulty: difficulty || 'Beginner',
      thumbnail: thumbnail || undefined,
      modules: Array.isArray(modules) ? modules : []
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course details
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const updatedData = { ...req.body };

    course = await Course.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete associated enrolments to maintain database integrity
    await Enrolment.deleteMany({ course: course._id });

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course and related enrolments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course categories
// @route   GET /api/courses/categories/list
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Course.distinct('category');
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories
};
