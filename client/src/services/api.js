import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scholarsync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const authLogin = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const authRegister = (data) => api.post('/auth/register', data).then(res => res.data);
export const authMe = () => api.get('/auth/me').then(res => res.data);

// Faculty Endpoints
export const getFacultyList = () => api.get('/faculty').then(res => res.data);
export const getFaculty = (id) => api.get(`/faculty/${id}`).then(res => res.data);
export const getFacultySchedule = (id) => api.get(`/faculty/${id}/schedule`).then(res => res.data);
export const getFacultyFreeSlots = (id, date) =>
  api.get(`/faculty/${id}/free-slots`, { params: { date } }).then(res => res.data);

// Task Endpoints
export const getTasks = (facultyId) =>
  api.get('/tasks', { params: { facultyId } }).then(res => res.data);
export const createTask = (payload) => api.post('/tasks', payload).then(res => res.data);
export const updateTask = (id, payload) => api.patch(`/tasks/${id}`, payload).then(res => res.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(res => res.data);

// Application Endpoints
export const getApplications = (facultyId) =>
  api.get('/applications', { params: { facultyId } }).then(res => res.data);
export const createApplication = (payload) => api.post('/applications', payload).then(res => res.data);
export const decideApplication = (id, status) =>
  api.patch(`/applications/${id}`, { status }).then(res => res.data);
export const getMentorships = (facultyId) =>
  api.get('/mentorships', { params: { facultyId } }).then(res => res.data);

// Booking Endpoints
export const getBookings = (facultyId) =>
  api.get('/bookings', { params: { facultyId } }).then(res => res.data);
export const createBooking = (payload) => api.post('/bookings', payload).then(res => res.data);
export const decideBooking = (id, status) =>
  api.patch(`/bookings/${id}`, { status }).then(res => res.data);

// AI Chatbot Endpoints
export const postChatMessage = (payload) => api.post('/ai/chat', payload).then(res => res.data);

export default api;
