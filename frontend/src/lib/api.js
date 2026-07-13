import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, full_name, role) => api.post('/auth/register', { email, password, full_name, role }),
  getMe: () => api.get('/auth/me'),
};

export const tests = {
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  submit: (data) => api.post('/tests/submit', data),
};

export const assignments = {
  getAll: () => api.get('/assignments'),
};

export const grades = {
  getAll: () => api.get('/grades'),
};

export const announcements = {
  getAll: () => api.get('/announcements'),
};

export const admin = {
  createTest: (data) => api.post('/admin/tests', data),
  getAllTests: () => api.get('/admin/tests'),
  createAssignment: (data) => api.post('/admin/assignments', data),
  getAllAssignments: () => api.get('/admin/assignments'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getViolations: () => api.get('/admin/violations'),
  getStats: () => api.get('/admin/stats'),
};

export default api;