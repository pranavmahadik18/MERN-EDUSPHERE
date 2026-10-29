const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Enrolment = require('../models/Enrolment');
const Course = require('../models/Course');
const { generateCertificatePdf } = require('../utils/certificateGenerator');

// Helper to generate unique certificate ID
const generateUniqueCertId = (courseCategory = 'MERN') => {
  const prefix = 'EDU-2026';
  const tag = (courseCategory || 'COURSE').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${tag}-${randomHex}`;
};

// @desc    Get certificate for a specific completed course
// @route   GET /api/certificates/course/:courseId
// @access  Private/Student
const getCertificateByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify student is enrolled and has fully completed the course
    const enrolment = await Enrolment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrolment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Verify completion status
    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
    const completedCount = enrolment.completedLessons?.length || 0;

    if (!enrolment.isCompleted && completedCount < totalLessons) {
      return res.status(400).json({
        success: false,
        isCompleted: false,
        message: 'Course is not completed yet. You must complete every lesson to earn a certificate.',
        progress: enrolment.progress,
        completedLessons: completedCount,
        totalLessons
      });
    }

    // Find existing certificate or issue a new one
    let certificate = await Certificate.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!certificate) {
      const certId = generateUniqueCertId(course.category || 'MERN');
      certificate = await Certificate.create({
        certificateId: certId,
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
        courseTitle: course.title,
        instructor: course.instructor,
        completionDate: enrolment.completedAt || new Date(),
        signatoryName: 'Dr. Aris Thorne',
        signatoryRole: 'Dean of Academic Affairs & EduSphere Director',
        verificationUrl: `/verify-certificate/${certId}`
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates belonging to current student
// @route   GET /api/certificates/my-certificates
// @access  Private/Student
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title category thumbnail duration')
      .sort({ completionDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public verification of a certificate by ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({
      certificateId: certificateId.toUpperCase().trim()
    }).populate('course', 'title category instructor duration');

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Certificate ID not found. This credential could not be verified by EduSphere.'
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      data: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        instructor: cert.instructor,
        completionDate: cert.completionDate,
        signatoryName: cert.signatoryName,
        signatoryRole: cert.signatoryRole,
        issuedAt: cert.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download personalized PDF certificate
// @route   GET /api/certificates/download/:certificateId
// @access  Private
const downloadCertificatePdf = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({
      certificateId: certificateId.toUpperCase().trim()
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Security check: Only the owning student or an Admin can download
    if (req.user.role !== 'Admin' && cert.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access another student\'s certificate.'
      });
    }

    const filename = `EduSphere_Certificate_${cert.certificateId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5173';
    const verificationBaseUrl = process.env.CLIENT_URL || `http://${host.replace(':5000', ':5173')}`;

    await generateCertificatePdf(
      {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        completionDate: cert.completionDate,
        signatoryName: cert.signatoryName,
        signatoryRole: cert.signatoryRole,
        verificationBaseUrl
      },
      res
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCertificateByCourse,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf
};
