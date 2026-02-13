import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const isAdminRoute = window.location.pathname.startsWith('/admin');

      // Only clear tokens and redirect for non-admin user sessions
      if (!isAdmin && !isAdminRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // For admin routes or admin sessions, just reject the error without redirect
      // Admin pages will handle their own auth errors
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (phone) => api.post('/auth/forgot-password', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  resetPassword: (phone, resetToken, newPassword) => api.post('/auth/reset-password', { phone, resetToken, newPassword }),
};

export const profileAPI = {
  updateProfile: (data) => api.put('/profile/update', data),
  getProfile: (id) => api.get(`/profile/${id}`),
  updatePreferences: (data) => api.put('/profile/preferences', data),
  getPreferences: () => api.get('/profile/preferences/get'),
  getProfileViewsCount: () => api.get('/profile/views/count'),
  getViewStats: () => api.get('/profile/view-stats'),
  checkCanViewProfile: (profileId) => api.get(`/profile/can-view/${profileId}`),
  uploadPhoto: (formData) => api.post('/profile/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const matchAPI = {
  getRecommendations: (limit = 10) => api.get(`/match/recommendations?limit=${limit}`),
  getTopMatches: () => api.get('/match/top-matches'),
  searchProfiles: (params) => api.get('/match/search', { params }),
  sendInterest: (data) => api.post('/match/interest/send', data),
  getReceivedInterests: () => api.get('/match/interest/received'),
  getSentInterests: () => api.get('/match/interest/sent'),
  respondToInterest: (data) => api.put('/match/interest/respond', data),
};

export default api;
