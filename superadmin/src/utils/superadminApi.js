import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for superadmin operations
const superadminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
superadminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superadmin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses - redirect to login on 401
superadminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for login endpoint
      const isLoginRequest = error.config?.url?.includes('/admin/login');
      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // Token expired or invalid - redirect to superadmin login
      const isOnLoginPage = window.location.pathname === '/login';
      if (!isOnLoginPage) {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('isSuperAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Superadmin Auth API
export const superadminAuthAPI = {
  login: (data) => superadminApi.post('/admin/login', data),
};

// Sidebar Settings API
export const sidebarAPI = {
  getSettings: () => superadminApi.get('/admin/settings/sidebar'),
  updateSettings: (items) => superadminApi.put('/admin/settings/sidebar', { items }),
};

// Column Settings API
export const columnAPI = {
  getSettings: () => superadminApi.get('/admin/settings/columns'),
  updateSettings: (userList) => superadminApi.put('/admin/settings/columns', { userList }),
  updatePageColumns: (pageKey, columns) => superadminApi.put('/admin/settings/columns', { pageKey, columns }),
};

// Settings API
export const settingsAPI = {
  getTheme: () => superadminApi.get('/admin/settings/theme'),
  updateTheme: (theme) => superadminApi.put('/admin/settings/theme', { theme }),
  getAllSettings: () => superadminApi.get('/admin/settings'),
  updateSetting: (key, value) => superadminApi.put(`/admin/settings/${key}`, { value }),
};

// Module Settings API
export const moduleAPI = {
  getSettings: () => superadminApi.get('/admin/settings/modules'),
  updateSettings: (modules) => superadminApi.put('/admin/settings/modules', { modules }),
};

export default superadminApi;
