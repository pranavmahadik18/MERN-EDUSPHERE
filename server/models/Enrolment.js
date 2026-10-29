const mongoose = require('mongoose');

const enrolmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    lastAccessedLesson: {
      lessonId: { type: mongoose.Schema.Types.ObjectId },
      moduleId: { type: mongoose.Schema.Types.ObjectId },
      positionSeconds: { type: Number, default: 0 }
    },
    lessonProgress: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        lastPosition: {
          type: Number,
          default: 0
        },
        maxContinuousPosition: {
          type: Number,
          default: 0
        },
        intervals: [
          {
            type: [Number] // [start, end]
          }
        ],
        watchSeconds: {
          type: Number,
          default: 0
        },
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: {
          type: Date
        }
      }
    ],
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate enrolment for the same student and course
enrolmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrolment', enrolmentSchema);
