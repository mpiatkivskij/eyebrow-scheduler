import axios from 'axios';

const API_BASE = 'http://localhost:3333/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject auth token for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public API
export const getServices = () => api.get('/services');
export const getService = (id) => api.get(`/services/${id}`);
export const getGalleryItems = () => api.get('/gallery_items');
export const getAvailableSlots = (serviceId, date) =>
  api.get('/available_slots', { params: { service_id: serviceId, date } });
export const createAppointment = (data) => api.post('/appointments', data);

// Admin Auth
export const adminLogin = (email, password) =>
  api.post('/admin/auth/login', { email, password });
export const adminMe = () => api.get('/admin/auth/me');

// Admin Services
export const adminGetServices = () => api.get('/admin/services');
export const adminCreateService = (data) => api.post('/admin/services', { service: data });
export const adminUpdateService = (id, data) => api.put(`/admin/services/${id}`, { service: data });
export const adminDeleteService = (id) => api.delete(`/admin/services/${id}`);

// Admin Appointments
export const adminGetAppointments = (params) => api.get('/admin/appointments', { params });
export const adminUpdateAppointment = (id, data) =>
  api.put(`/admin/appointments/${id}`, { appointment: data });
export const adminDeleteAppointment = (id) => api.delete(`/admin/appointments/${id}`);

// Admin Dashboard
export const adminGetDashboard = () => api.get('/admin/dashboard');

// Admin Work Schedules
export const adminGetSchedules = () => api.get('/admin/work_schedules');
export const adminBulkUpdateSchedules = (schedules) =>
  api.put('/admin/work_schedules/bulk_update', { schedules });

// Admin Gallery
export const adminCreateGalleryItem = (data) =>
  api.post('/admin/gallery_items', { gallery_item: data });
export const adminUpdateGalleryItem = (id, data) =>
  api.put(`/admin/gallery_items/${id}`, { gallery_item: data });
export const adminDeleteGalleryItem = (id) => api.delete(`/admin/gallery_items/${id}`);

// Admin Holidays
export const adminGetHolidays = () => api.get('/admin/holidays');
export const adminCreateHoliday = (data) => api.post('/admin/holidays', { holiday: data });
export const adminDeleteHoliday = (id) => api.delete(`/admin/holidays/${id}`);

export default api;
