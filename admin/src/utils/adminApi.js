import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a separate axios instance for admin operations
// This instance does NOT redirect to login on 401 errors
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use(
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

// Handle responses - redirect to login on 401 for admin
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to admin login
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAuthAPI = {
  login: (data) => adminApi.post('/admin/login', data),
};

export const adminUserAPI = {
  getAllUsers: () => adminApi.get('/admin/users'),
  getPaidUsersWithoutPassword: () => adminApi.get('/admin/users/paid-no-password'),
  getApprovedUsers: () => adminApi.get('/admin/users/approved'),
  getUsersWithPasswords: () => adminApi.get('/admin/users/with-passwords'),
  createUser: (data) => adminApi.post('/admin/users/create', data),
  updatePaymentStatus: (userId, data) => adminApi.patch(`/admin/users/${userId}/payment`, data),
  updateApprovalStatus: (userId, data) => adminApi.patch(`/admin/users/${userId}/approval`, data),
  updateUserData: (userId, data) => adminApi.patch(`/admin/users/${userId}/update`, data),
  setPassword: (userId, data) => adminApi.post(`/admin/users/${userId}/set-password`, data),
  assignMembership: (userId, data) => adminApi.post(`/admin/users/${userId}/assign-membership`, data),
  revokeMembership: (userId) => adminApi.post(`/admin/users/${userId}/revoke-membership`),
  getFullProfile: (userId) => adminApi.get(`/admin/users/${userId}/full`),
  updateFullProfile: (userId, data) => adminApi.put(`/admin/users/${userId}/full`, data),
  uploadPhoto: (userId, formData) => adminApi.post(`/admin/users/${userId}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteUser: (userId) => adminApi.delete(`/admin/users/${userId}`),
};

export const adminDashboardAPI = {
  getStats: () => adminApi.get('/admin/dashboard'),
};

export const adminMatchAPI = {
  getAllMatches: () => adminApi.get('/admin/matches'),
  createMatch: (data) => adminApi.post('/admin/matches/create', data),
  deleteMatch: (matchId) => adminApi.delete(`/admin/matches/${matchId}`),
};

export const adminInterestAPI = {
  getAllInterests: () => adminApi.get('/admin/interests'),
  getInterestsByUser: (userId) => adminApi.get(`/admin/interests/user/${userId}`),
};

export const adminMembershipAPI = {
  getPlans: () => adminApi.get('/admin/membership-plans'),
  createPlan: (data) => adminApi.post('/admin/membership-plans', data),
  updatePlan: (planId, data) => adminApi.put(`/admin/membership-plans/${planId}`, data),
  togglePlan: (planId) => adminApi.patch(`/admin/membership-plans/${planId}/toggle`),
  deletePlan: (planId) => adminApi.delete(`/admin/membership-plans/${planId}`),
};

export default adminApi;
