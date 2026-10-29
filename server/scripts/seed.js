const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrolment = require('../models/Enrolment');
const Certificate = require('../models/Certificate');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_management_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing records...');
// NOTE: Skipping destructive deletions to preserve existing data.
// await User.deleteMany();
// await Course.deleteMany();
// await Enrolment.deleteMany();
// await Certificate.deleteMany();

    console.log('Creating Admin and Student users (idempotent)...');
    // Upsert Admin User
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@coursems.edu' },
      { $setOnInsert: { name: 'Dr. Aris Thorne (Admin)', password: 'adminpassword123', role: 'Admin' } },
      { upsert: true, new: true }
    );

    // Upsert Student User 1
    const studentUser1 = await User.findOneAndUpdate(
      { email: 'rohan@student.edu' },
      { $setOnInsert: { name: 'Rohan Sharma', password: 'studentpassword123', role: 'Student' } },
      { upsert: true, new: true }
    );

    // Upsert Student User 2
    const studentUser2 = await User.findOneAndUpdate(
      { email: 'priya@student.edu' },
      { $setOnInsert: { name: 'Priya Patel', password: 'studentpassword123', role: 'Student' } },
      { upsert: true, new: true }
    );

    console.log('Seeding curated courses with modules and lessons...');

    const coursesData = [
      {
        title: 'Learn The MERN Stack',
        description: 'Master MongoDB, Express.js, React, and Node.js with Brad Traversy in this comprehensive 5-hour project-based masterclass. Build a full-stack shopping list application with Redux state management, custom REST APIs, and production JWT authentication.',
        category: 'Web Development',
        instructor: 'Brad Traversy (Traversy Media)',
        duration: '5 Hours 16 Mins (11 Modules)',
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
        modules: [
          {
            title: 'Module 1: MERN Stack Architecture & Project Setup',
            description: 'Introduction to MERN stack architecture, development environment setup, project breakdown, and repository structuring.',
            sequence: 1,
            lessons: [
              {
                title: 'Learn The MERN Stack [1] - Series Introduction',
                content: 'Understand full-stack JavaScript architecture using MongoDB, Express, React, and Node.js. Review the complete application workflow, component hierarchy, RESTful API design, and prerequisites.',
                duration: '7m 13s',
                durationSeconds: 433,
                youtubeVideoId: 'PBTYxXADG_k',
                videoUrl: 'https://www.youtube.com/watch?v=PBTYxXADG_k',
                startSeconds: 0,
                endSeconds: 433,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 2: Node.js, Express API & MongoDB Integration',
            description: 'Building RESTful backend services, connecting MongoDB Atlas with Mongoose, and handling CRUD operations.',
            sequence: 2,
            lessons: [
              {
                title: 'Learn the MERN Stack [2] - Express API & MongoDB',
                content: 'Initialize Express.js, install dependencies (mongoose, body-parser), establish MongoDB Atlas cloud connection, configure Mongoose Item Schema, and build GET, POST, and DELETE item routes.',
                duration: '35m 39s',
                durationSeconds: 2139,
                youtubeVideoId: '5yTazHkDR4o',
                videoUrl: 'https://www.youtube.com/watch?v=5yTazHkDR4o',
                startSeconds: 0,
                endSeconds: 2139,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 3: React Setup & Bootstrap Components',
            description: 'Frontend client initialization using create-react-app, configuring Reactstrap for UI, and navbar construction.',
            sequence: 3,
            lessons: [
              {
                title: 'Learn The MERN Stack [3] - Client Setup & Reactstrap',
                content: 'Set up the React application client folder, install Reactstrap and Bootstrap 4, create a modular AppNavbar component with collapse toggle state, and prepare layout containers.',
                duration: '27m 06s',
                durationSeconds: 1626,
                youtubeVideoId: 'R54neaLznFA',
                videoUrl: 'https://www.youtube.com/watch?v=R54neaLznFA',
                startSeconds: 0,
                endSeconds: 1626,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 4: Dynamic UI & Interactive Animations',
            description: 'Building responsive React list components and integrating smooth CSS transition effects.',
            sequence: 4,
            lessons: [
              {
                title: 'Learn The MERN Stack [4] - ShoppingList Component & Transitions',
                content: 'Create the core ShoppingList component with static mock data, implement react-transition-group CSSTransition for animated item additions and removals, and handle UUID key generation.',
                duration: '18m 41s',
                durationSeconds: 1121,
                youtubeVideoId: 'fcna-jJtAXk',
                videoUrl: 'https://www.youtube.com/watch?v=fcna-jJtAXk',
                startSeconds: 0,
                endSeconds: 1121,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 5: State Management with Redux Fundamentals',
            description: 'Architecting predictable state containers with Redux, actions, reducers, and React-Redux Provider.',
            sequence: 5,
            lessons: [
              {
                title: 'Learn The MERN Stack [5] - Implementing Redux',
                content: 'Integrate Redux and Redux-Thunk middleware. Create the central store, establish itemAction types (GET_ITEMS, ADD_ITEM, DELETE_ITEM), build the itemReducer, and connect React components using connect() and mapStateToProps.',
                duration: '29m 58s',
                durationSeconds: 1798,
                youtubeVideoId: 'iI5h4-pChho',
                videoUrl: 'https://www.youtube.com/watch?v=iI5h4-pChho',
                startSeconds: 0,
                endSeconds: 1798,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 6: Advanced Redux & Action Dispatching',
            description: 'Building interactive modal dialogs and dispatching payload mutations through Redux.',
            sequence: 6,
            lessons: [
              {
                title: 'Learn The MERN Stack [6] - Finishing Redux',
                content: 'Build the ItemModal component for adding new items. Handle local component form state, dispatch Redux actions with dynamic payloads, and bind state seamlessly to the global store.',
                duration: '30m 18s',
                durationSeconds: 1818,
                youtubeVideoId: 'TO6akRGXhx8',
                videoUrl: 'https://www.youtube.com/watch?v=TO6akRGXhx8',
                startSeconds: 0,
                endSeconds: 1818,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 7: Connecting Frontend and Backend & Deployment',
            description: 'Bridging client and server with Axios, synchronizing state with MongoDB, and deploying to cloud infrastructure.',
            sequence: 7,
            lessons: [
              {
                title: 'Learn The MERN Stack [7] - Connecting The Backend',
                content: 'Configure Axios in Redux action creators. Fetch live database records on component mount, send POST requests to create database documents, and issue DELETE requests to remove items from MongoDB.',
                duration: '17m 08s',
                durationSeconds: 1028,
                youtubeVideoId: '431EvDGKwks',
                videoUrl: 'https://www.youtube.com/watch?v=431EvDGKwks',
                startSeconds: 0,
                endSeconds: 1028,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              },
              {
                title: 'Learn The MERN Stack [8] - Prepare & Deploy',
                content: 'Prepare the MERN project for production. Configure concurrently for development scripts, set up Express static serving for React production build, and deploy the application.',
                duration: '16m 21s',
                durationSeconds: 981,
                youtubeVideoId: '71wSzpLyW9k',
                videoUrl: 'https://www.youtube.com/watch?v=71wSzpLyW9k',
                startSeconds: 0,
                endSeconds: 981,
                sequence: 2,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 8: Backend JWT Authentication - Part 1',
            description: 'User registration, Mongoose schema validation, salted password encryption with bcryptjs.',
            sequence: 8,
            lessons: [
              {
                title: 'Learn The Mern Stack [9] - Backend JWT Auth: Part 1',
                content: 'Construct the User model with name, email, password, and registration date. Implement the registration route: check existing user emails, generate bcrypt salt and hash, and store credentials securely.',
                duration: '24m 00s',
                durationSeconds: 1440,
                youtubeVideoId: 'USaB1adUHM0',
                videoUrl: 'https://www.youtube.com/watch?v=USaB1adUHM0',
                startSeconds: 0,
                endSeconds: 1440,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 9: Backend JWT Authentication - Part 2',
            description: 'JSON Web Token signing, auth verification middleware, and securing private API endpoints.',
            sequence: 9,
            lessons: [
              {
                title: 'Learn The Mern Stack [9] - Backend JWT Auth: Part 2',
                content: 'Sign JWT tokens upon user registration and login. Write custom Express auth middleware to inspect Authorization x-auth-token headers, decode user tokens, and protect item mutation endpoints.',
                duration: '24m 57s',
                durationSeconds: 1497,
                youtubeVideoId: 'USaB1adUHM0',
                videoUrl: 'https://www.youtube.com/watch?v=USaB1adUHM0',
                startSeconds: 1440,
                endSeconds: 2937,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 10: React & Redux Authentication State',
            description: 'Redux authentication reducer, token persistence in localStorage, and error state handling.',
            sequence: 10,
            lessons: [
              {
                title: 'Learn The Mern Stack [10] - React & Redux Auth State',
                content: 'Build the authReducer and errorReducer. Dispatch USER_LOADING, USER_LOADED, and AUTH_ERROR actions. Configure helper function tokenConfig to automatically attach JWT tokens to outgoing requests.',
                duration: '29m 00s',
                durationSeconds: 1740,
                youtubeVideoId: 'qyomEaXQJFk',
                videoUrl: 'https://www.youtube.com/watch?v=qyomEaXQJFk',
                startSeconds: 0,
                endSeconds: 1740,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          },
          {
            title: 'Module 11: Registration, Login & Role Access Control',
            description: 'Student registration modals, login forms, logout triggers, and conditional UI access control.',
            sequence: 11,
            lessons: [
              {
                title: 'Learn The Mern Stack [11] - React Registration',
                content: 'Build the RegisterModal component. Handle client-side registration forms, capture validation errors from Redux state, and display contextual error alert banners.',
                duration: '31m 48s',
                durationSeconds: 1908,
                youtubeVideoId: 'de5gkk_40Eo',
                videoUrl: 'https://www.youtube.com/watch?v=de5gkk_40Eo',
                startSeconds: 0,
                endSeconds: 1908,
                sequence: 1,
                sourceAttribution: 'Traversy Media on YouTube'
              },
              {
                title: 'Learn The Mern Stack [12] - React Login & Access Control',
                content: 'Construct the LoginModal and Logout components. Update navigation links dynamically based on authentication state, restrict item deletion to authenticated users, and complete the full-stack MERN course.',
                duration: '23m 51s',
                durationSeconds: 1431,
                youtubeVideoId: 'Efwp65XF0bM',
                videoUrl: 'https://www.youtube.com/watch?v=Efwp65XF0bM',
                startSeconds: 0,
                endSeconds: 1431,
                sequence: 2,
                sourceAttribution: 'Traversy Media on YouTube'
              }
            ]
          }
        ]
      },
      {
        title: 'Applied Python & Machine Learning Essentials',
        description: 'Hands-on journey into exploratory data analysis, NumPy, Pandas, scikit-learn models, classification algorithms, and practical real-world prediction workflows.',
        category: 'Data Science',
        instructor: 'Dr. Anita Desai',
        duration: '6 Weeks',
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
        modules: [
          {
            title: 'Module 1: Data Wrangling with Pandas & NumPy',
            lessons: [
              {
                title: 'Vectorized Operations & DataFrames',
                duration: '30 mins',
                content: 'Perform high-performance numerical computing using NumPy arrays and clean messy real-world datasets with Pandas DataFrames.'
              },
              {
                title: 'Exploratory Data Analysis & Visualization',
                duration: '35 mins',
                content: 'Plot statistical distributions, correlation matrices, and identify outliers using Matplotlib and Seaborn.'
              }
            ]
          },
          {
            title: 'Module 2: Supervised Machine Learning Algorithms',
            lessons: [
              {
                title: 'Linear & Logistic Regression for Predictions',
                duration: '40 mins',
                content: 'Understand cost functions, gradient descent, feature scaling, model fitting, and evaluating classification metrics like Precision, Recall, and ROC-AUC.'
              },
              {
                title: 'Decision Trees & Random Forests',
                duration: '45 mins',
                content: 'Learn ensemble techniques, avoiding overfitting through tree pruning, and tuning hyperparameters with GridSearchCV.'
              }
            ]
          }
        ]
      },
      {
        title: 'Cloud Native DevOps & Container Orchestration',
        description: 'Demystify Docker containers, microservices architecture, CI/CD pipeline automation, and production deployments on cloud infrastructure.',
        category: 'Cloud & DevOps',
        instructor: 'Eng. Vikram Patil',
        duration: '5 Weeks',
        difficulty: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60',
        modules: [
          {
            title: 'Module 1: Containerization with Docker',
            lessons: [
              {
                title: 'Dockerfile Construction & Multi-Stage Builds',
                duration: '30 mins',
                content: 'Write optimized Dockerfiles, reduce image size using multi-stage builds, and manage container volumes for persistent storage.'
              },
              {
                title: 'Multi-Container Orchestration with Docker Compose',
                duration: '35 mins',
                content: 'Link frontend, backend, and MongoDB services together in a unified network using declarative docker-compose configuration.'
              }
            ]
          },
          {
            title: 'Module 2: CI/CD Pipelines & Cloud Deployment',
            lessons: [
              {
                title: 'Automated Testing & GitHub Actions',
                duration: '40 mins',
                content: 'Configure continuous integration pipelines that automatically run linting, unit tests, and security scans on pull requests.'
              }
            ]
          }
        ]
      },
      {
        title: 'UI/UX Design Systems & High-Fidelity Prototyping',
        description: 'Design intuitive, accessible, and stunning digital interfaces using modern typography, design tokens, micro-interactions, and user-centric wireframing.',
        category: 'Design',
        instructor: 'Sarah Jenkins',
        duration: '4 Weeks',
        difficulty: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60',
        modules: [
          {
            title: 'Module 1: Foundations of Visual Design',
            lessons: [
              {
                title: 'Color Theory, Contrast, and Accessibility (WCAG)',
                duration: '25 mins',
                content: 'Explore harmonious HSL color palettes, 60-30-10 color distribution rule, and ensuring AA/AAA contrast ratios for maximum accessibility.'
              },
              {
                title: 'Typography & Spatial Grid Systems',
                duration: '30 mins',
                content: 'Establish 8pt grid systems, vertical rhythm, modular type scales, and establishing crisp visual hierarchy.'
              }
            ]
          },
          {
            title: 'Module 2: Interactive Prototyping & User Testing',
            lessons: [
              {
                title: 'Component Design Tokens & Atomic Design',
                duration: '35 mins',
                content: 'Structure UI elements into atoms, molecules, and organisms for frictionless design-to-code handoff.'
              }
            ]
          }
        ]
      }, // UI/UX course end
    // --- Additional Courses (real YouTube lessons) ---
        {
          title: 'Java Full Stack Development',
          description: 'Full‑stack Java development using Spring Boot, React, and MongoDB. Build a real‑world movie review app.',
          category: 'Web Development',
          instructor: 'freeCodeCamp',
          duration: '2h 40m',
          difficulty: 'Intermediate',
          thumbnail: 'https://i.ytimg.com/vi/5PdEmeopJVQ/hqdefault.jpg',
          modules: [
            {
              title: 'Java Full‑Stack Course',
              description: 'Complete freeCodeCamp Java full‑stack tutorial.',
              lessons: [
                {
                  title: 'Java Full Stack Development',
                  youtubeVideoId: '5PdEmeopJVQ',
                  content: 'Lesson content placeholder',
                  startSeconds: 0,
                  endSeconds: 9608,
                  durationSeconds: 9608,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'Python Programming',
          description: 'Comprehensive Python programming tutorial covering fundamentals to advanced topics.',
          category: 'Programming',
          instructor: 'freeCodeCamp',
          duration: '4h 40m',
          difficulty: 'Beginner',
          thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
          modules: [
            {
              title: 'Full Python Course',
              description: 'Complete freeCodeCamp Python tutorial.',
              lessons: [
                {
                  title: 'Python Programming',
                  youtubeVideoId: 'rfscVS0vtbw',
                  startSeconds: 0,
                  endSeconds: 16800,
                  durationSeconds: 16800,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'HTML, CSS & JavaScript',
          description: 'Learn web fundamentals: HTML5, CSS3, and modern JavaScript from scratch.',
          category: 'Web Development',
          instructor: 'freeCodeCamp',
          duration: '2h',
          difficulty: 'Beginner',
          thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
          modules: [
            {
              title: 'HTML, CSS & JavaScript Full Course',
              description: 'Complete freeCodeCamp front‑end tutorial.',
              lessons: [
                {
                  title: 'HTML, CSS, JavaScript',
                  youtubeVideoId: 'PkZNo7MFNFg',
                  startSeconds: 0,
                  endSeconds: 7200,
                  durationSeconds: 7200,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'React.js for Beginners',
          description: 'Introductory React.js course covering components, state, hooks, and routing.',
          category: 'Web Development',
          instructor: 'freeCodeCamp',
          duration: '1h 30m',
          difficulty: 'Beginner',
          thumbnail: 'https://i.ytimg.com/vi/Ke90Tje7VS0/hqdefault.jpg',
          modules: [
            {
              title: 'React.js Crash Course',
              description: 'Complete freeCodeCamp React tutorial.',
              lessons: [
                {
                  title: 'React.js Basics',
                  youtubeVideoId: 'Ke90Tje7VS0',
                  startSeconds: 0,
                  endSeconds: 5400,
                  durationSeconds: 5400,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'Node.js and Express.js',
          description: 'Learn server‑side JavaScript with Node.js and Express.js, building REST APIs.',
          category: 'Backend',
          instructor: 'freeCodeCamp',
          duration: '2h',
          difficulty: 'Intermediate',
          thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
          modules: [
            {
              title: 'Node.js & Express Full Course',
              description: 'Complete freeCodeCamp Node.js tutorial.',
              lessons: [
                {
                  title: 'Node.js & Express',
                  youtubeVideoId: 'Oe421EPjeBE',
                  startSeconds: 0,
                  endSeconds: 7200,
                  durationSeconds: 7200,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'MongoDB and NoSQL Databases',
          description: 'Introduction to MongoDB, CRUD operations, and schema design with Mongoose.',
          category: 'Database',
          instructor: 'freeCodeCamp',
          duration: '1h 30m',
          difficulty: 'Intermediate',
          thumbnail: 'https://i.ytimg.com/vi/4BzuBULR6Dg/hqdefault.jpg',
          modules: [
            {
              title: 'MongoDB Tutorial',
              description: 'Complete freeCodeCamp MongoDB tutorial.',
              lessons: [
                {
                  title: 'MongoDB Basics',
                  youtubeVideoId: '4BzuBULR6Dg',
                  startSeconds: 0,
                  endSeconds: 5400,
                  durationSeconds: 5400,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'Data Structures and Algorithms in Java',
          description: 'Comprehensive DSA curriculum in Java, covering arrays, linked lists, trees, sorting, and searching.',
          category: 'Computer Science',
          instructor: 'freeCodeCamp',
          duration: '2h',
          difficulty: 'Intermediate',
          thumbnail: 'https://i.ytimg.com/vi/8hlyc0ZA0Xs/hqdefault.jpg',
          modules: [
            {
              title: 'Java DSA Full Course',
              description: 'Complete freeCodeCamp Java DSA tutorial.',
              lessons: [
                {
                  title: 'Data Structures & Algorithms',
                  youtubeVideoId: '8hlyc0ZA0Xs',
                  startSeconds: 0,
                  endSeconds: 7200,
                  durationSeconds: 7200,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'SQL and Database Management',
          description: 'SQL fundamentals, queries, joins, and database design using MySQL.',
          category: 'Database',
          instructor: 'freeCodeCamp',
          duration: '1h 30m',
          difficulty: 'Beginner',
          thumbnail: 'https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg',
          modules: [
            {
              title: 'SQL Full Course',
              description: 'Complete freeCodeCamp SQL tutorial.',
              lessons: [
                {
                  title: 'SQL Basics',
                  youtubeVideoId: 'HXV3zeQKqGY',
                  startSeconds: 0,
                  endSeconds: 5400,
                  durationSeconds: 5400,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        },
        {
          title: 'Git and GitHub Fundamentals',
          description: 'Learn version control with Git and collaboration on GitHub.',
          category: 'Tools',
          instructor: 'freeCodeCamp',
          duration: '1h 30m',
          difficulty: 'Beginner',
          thumbnail: 'https://i.ytimg.com/vi/RGOj5y10JKQ/hqdefault.jpg',
          modules: [
            {
              title: 'Git & GitHub Full Course',
              description: 'Complete freeCodeCamp Git tutorial.',
              lessons: [
                {
                  title: 'Git & GitHub',
                  youtubeVideoId: 'RGOj5y10JKQ',
                  startSeconds: 0,
                  endSeconds: 5400,
                  durationSeconds: 5400,
                  sourceAttribution: 'freeCodeCamp'
                }
              ]
            }
          ]
        }
];

    // --- Backup existing collections ---
    // Backup step skipped on Windows (mongodump not available). If needed, run a manual MongoDB dump.
    // const { execSync } = require('child_process');
    // try {
    //   console.log('Backing up Course, Enrolment, User, Certificate collections...');
    //   execSync('mongodump --db course_management_db --collection courses --out backup/', { stdio: 'inherit' });
    //   execSync('mongodump --db course_management_db --collection enrolments --out backup/', { stdio: 'inherit' });
    //   execSync('mongodump --db course_management_db --collection users --out backup/', { stdio: 'inherit' });
    //   execSync('mongodump --db course_management_db --collection certificates --out backup/', { stdio: 'inherit' });
    // } catch (e) {
    //   console.error('Backup step failed (may already exist):', e.message);
    // }

    // --- Upsert courses (idempotent) ---
    let insertedCount = 0;
    let unchangedCount = 0;
    for (const course of coursesData) {
      const existing = await Course.findOne({ title: course.title });
      if (!existing) {
        await Course.create(course);
        insertedCount++;
        console.log(`Inserted new course: ${course.title}`);
      } else {
        unchangedCount++;
        console.log(`Course already exists, skipped: ${course.title}`);
      }
    }
    console.log(`Courses inserted: ${insertedCount}, unchanged: ${unchangedCount}`);

    // --- Idempotent demo enrolments ---
    const demoEnrolments = [
      { student: studentUser1._id, courseTitle: 'Learn The MERN Stack' },
      { student: studentUser2._id, courseTitle: 'Learn The MERN Stack' }
    ];
    for (const { student, courseTitle } of demoEnrolments) {
      const courseDoc = await Course.findOne({ title: courseTitle });
      if (!courseDoc) continue;
      const existingEnrol = await Enrolment.findOne({ student, course: courseDoc._id });
      if (!existingEnrol) {
        await Enrolment.create({ student, course: courseDoc._id, completedLessons: [], completedModules: [], lessonProgress: [], progress: 0 });
        console.log(`Created enrolment for student ${student} in ${courseTitle}`);
      } else {
        console.log(`Enrolment already exists for student ${student} in ${courseTitle}`);
      }
    }
    console.log(`Courses inserted: ${insertedCount}, unchanged: ${unchangedCount}`);

    // Detailed enrolment creation removed. Demo enrolments are handled earlier via the demoEnrolments array.
    // No additional enrolment logic is required here.
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
