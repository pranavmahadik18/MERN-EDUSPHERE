const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  getAllEnrolments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and Admin role
router.use(protect, authorize('Admin'));

router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/enrolments', getAllEnrolments);

module.exports = router;
