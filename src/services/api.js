// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  // Add '/auth' to both paths
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const quizAPI = {
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  getQuizzes: () => api.get('/quizzes'),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (quizId, submission) => api.post(`/quizzes/${quizId}/submit`, submission),
};

export const imageAPI = {
  processImage: (imageData) => api.post('/process/image', imageData),
};

export const classAPI = {
  createClass: (classData) => api.post('/classes', classData),
  joinClass: (classCode) => api.post(`/classes/${classCode}/join`),
};

export default api;