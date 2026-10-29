const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Category list
router.get('/categories/list', getCategories);

// Course collection routes
router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('Admin'), createCourse);

// Single course routes
router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorize('Admin'), updateCourse)
  .delete(protect, authorize('Admin'), deleteCourse);

module.exports = router;
