import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  getUserById: (userId) => api.get(`/auth/user/${userId}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getUserProducts: (userId) => api.get(`/products/user/${userId}`),
};

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services/', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services/', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getUserServices: (userId) => api.get(`/services/user/${userId}`),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversationMessages: (conversationId) => api.get(`/messages/conversation/${conversationId}`),
  send: (data) => api.post('/messages/', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

// Reviews API
export const reviewsAPI = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getServiceReviews: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  create: (data) => api.post('/reviews/', data),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Reports API
export const reportsAPI = {
  create: (data) => api.post('/reports/', data),
  getAll: () => api.get('/reports/'),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => api.get('/transactions/'),
  create: (data) => api.post('/transactions/', data),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
  confirmDelivery: (id) => api.post(`/transactions/${id}/confirm-delivery`),
  confirmReceipt: (id) => api.post(`/transactions/${id}/confirm-receipt`),
  accept: (id) => api.put(`/transactions/${id}/accept`),
  reject: (id) => api.put(`/transactions/${id}/reject`),
};

// OTP API
export const otpAPI = {
  send: () => api.post('/otp/send'),
  verify: (code) => api.post('/otp/verify', { code }),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites/'),
  add: (itemType, itemId) => api.post(`/favorites/${itemType}/${itemId}`),
  remove: (itemType, itemId) => api.delete(`/favorites/${itemType}/${itemId}`),
  check: (itemType, itemId) => api.get(`/favorites/check/${itemType}/${itemId}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id) => api.put(`/admin/reports/${id}/resolve`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  warnUser: (id) => api.put(`/admin/users/${id}/warn`),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  getCollection: (name, params) => api.get(`/admin/collection/${name}`, { params }),
  deleteDocument: (collection, id) => api.delete(`/admin/collection/${collection}/${id}`),
};

export default api;
