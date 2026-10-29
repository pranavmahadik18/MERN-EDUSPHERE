const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  content: {
    type: String,
    default: 'Lesson content placeholder',
    required: [true, 'Lesson content is required']
  },
  duration: {
    type: String,
    default: '15 mins',
    trim: true
  },
  durationSeconds: {
    type: Number,
    default: 900
  },
  youtubeVideoId: {
    type: String,
    default: '',
    trim: true
  },
  videoUrl: {
    type: String,
    default: '',
    trim: true
  },
  startSeconds: {
    type: Number,
    default: 0
  },
  endSeconds: {
    type: Number,
    default: 0
  },
  sequence: {
    type: Number,
    default: 1
  },
  sourceAttribution: {
    type: String,
    default: 'Traversy Media on YouTube',
    trim: true
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  sequence: {
    type: Number,
    default: 1
  },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description']
    },
    category: {
      type: String,
      required: [true, 'Please provide a course category'],
      trim: true
    },
    instructor: {
      type: String,
      required: [true, 'Please provide an instructor name'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Please provide estimated duration (e.g., 6 Weeks)'],
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
    },
    modules: [moduleSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for counting total lessons in a course
courseSchema.virtual('totalLessons').get(function () {
  if (!this.modules || !Array.isArray(this.modules)) return 0;
  return this.modules.reduce((acc, mod) => acc + (mod.lessons ? mod.lessons.length : 0), 0);
});

module.exports = mongoose.model('Course', courseSchema);
