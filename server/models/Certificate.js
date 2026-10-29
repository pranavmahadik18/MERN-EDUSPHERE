const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required'],
      trim: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true
    },
    completionDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    signatoryName: {
      type: String,
      default: 'Dr. Aris Thorne',
      trim: true
    },
    signatoryRole: {
      type: String,
      default: 'Dean of Academic Affairs & EduSphere Director',
      trim: true
    },
    verificationUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate certificates for the same student and course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
