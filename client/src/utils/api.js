import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const profileAPI = {
  updateProfile: (data) => api.put('/profile/update', data),
  getProfile: (id) => api.get(`/profile/${id}`),
  updatePreferences: (data) => api.put('/profile/preferences', data),
  getPreferences: () => api.get('/profile/preferences/get'),
};

export const matchAPI = {
  getRecommendations: (limit = 10) => api.get(`/match/recommendations?limit=${limit}`),
  searchProfiles: (params) => api.get('/match/search', { params }),
  sendInterest: (data) => api.post('/match/interest/send', data),
  getReceivedInterests: () => api.get('/match/interest/received'),
  getSentInterests: () => api.get('/match/interest/sent'),
  respondToInterest: (data) => api.put('/match/interest/respond', data),
};

export default api;
