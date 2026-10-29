const express = require('express');
const router = express.Router();
const {
  getCertificateByCourse,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify/:certificateId', verifyCertificate);

// Protected endpoints
router.get('/my-certificates', protect, getMyCertificates);
router.get('/course/:courseId', protect, getCertificateByCourse);
router.get('/download/:certificateId', protect, downloadCertificatePdf);

module.exports = router;
