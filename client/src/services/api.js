const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Courses
  courses: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/courses${queryString}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getCategories: async () => {
      const res = await fetch(`${API_BASE}/courses/categories/list`);
      return handleResponse(res);
    },
    create: async (courseData) => {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(res);
    },
    update: async (id, courseData) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Enrolments & Progress
  enrolments: {
    enrol: async (courseId) => {
      const res = await fetch(`${API_BASE}/enrolments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ courseId })
      });
      return handleResponse(res);
    },
    getMyEnrolments: async () => {
      const res = await fetch(`${API_BASE}/enrolments/my-enrolments`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getCourseEnrolment: async (courseId) => {
      const res = await fetch(`${API_BASE}/enrolments/course/${courseId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    toggleLesson: async (courseId, lessonId, status) => {
      const res = await fetch(`${API_BASE}/enrolments/course/${courseId}/lesson/${lessonId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    updatePlaybackProgress: async (courseId, lessonId, progressData) => {
      const res = await fetch(`${API_BASE}/enrolments/course/${courseId}/lesson/${lessonId}/progress`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(progressData)
      });
      return handleResponse(res);
    }
  },

  // Certificates
  certificates: {
    getCourseCertificate: async (courseId) => {
      const res = await fetch(`${API_BASE}/certificates/course/${courseId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getMyCertificates: async () => {
      const res = await fetch(`${API_BASE}/certificates/my-certificates`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    verify: async (certificateId) => {
      const res = await fetch(`${API_BASE}/certificates/verify/${certificateId}`);
      return handleResponse(res);
    },
    downloadPdfUrl: (certificateId) => {
      return `${API_BASE}/certificates/download/${certificateId}`;
    }
  },

  // Admin Portal
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getStudents: async () => {
      const res = await fetch(`${API_BASE}/admin/students`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getAllEnrolments: async () => {
      const res = await fetch(`${API_BASE}/admin/enrolments`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
