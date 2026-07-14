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
  getMe: () => api.get('/auth/me'),
};

export const tests = {
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  submit: (data) => api.post('/tests/submit', data),
  review: (id) => api.get(`/tests/${id}/review`),
};

export const assignments = {
  getAll: () => api.get('/assignments'),
  submit: (data) => api.post('/assignments/submit', data),
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
  publishTest: (id) => api.post(`/admin/tests/${id}/publish`),
  unpublishTest: (id) => api.post(`/admin/tests/${id}/unpublish`),
  publishAllTests: () => api.post('/admin/tests/publish-all'),
  unpublishAllTests: () => api.post('/admin/tests/unpublish-all'),
  deleteTest: (id) => api.delete(`/admin/tests/${id}`),
  createAssignment: (data) => api.post('/admin/assignments', data),
  getAllAssignments: () => api.get('/admin/assignments'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getViolations: () => api.get('/admin/violations'),
  getStats: () => api.get('/admin/stats'),
  createUser: (data) => api.post('/admin/users', data),
  listUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
};

export default api;
