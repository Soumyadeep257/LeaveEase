import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leaveEase_token');
    // Only attach token if it's a valid JWT format (contains dots)
    if (token && token.includes('.')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/demo');

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('leaveEase_token');
      localStorage.removeItem('leaveEase_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  demoLogin: (role) => api.post('/auth/demo', { role }),
  getProfile: () => api.get('/auth/profile'),
};

// Leave endpoints
export const leaveAPI = {
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  applyLeave: (leaveData) => api.post('/leaves/apply', leaveData),
  cancelLeave: (id) => api.put(`/leaves/${id}/cancel`),
  getAllLeaves: (params) => api.get('/leaves/all', { params }),
  updateLeaveStatus: (id, updateData) => api.put(`/leaves/${id}/status`, updateData),
};

// User / Quota management endpoints (Manager only)
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  updateUserQuota: (userId, quotaData) => api.put(`/users/${userId}/quota`, quotaData),
};

export default api;
