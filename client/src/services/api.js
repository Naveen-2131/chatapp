import axios from 'axios';

// Get base URL from environment, fallback to localhost
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Ensure NO trailing slash and ALWAYS end with /api
const cleanUrl = rawUrl.replace(/\/$/, '');
const BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

// Main axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Important for cookies/session
});

// Upload axios instance (for FormData)
const uploadApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach token to requests
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
uploadApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// Auth service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User service
export const userService = {
  searchUsers: (query) => api.get(`/users/search?search=${query}`),
  updateProfile: (data) =>
    data instanceof FormData
      ? uploadApi.put('/users/profile', data)
      : api.put('/users/profile', data),
  updateStatus: (status) => api.put('/users/status', { status }),
};

// Chat service
export const chatService = {
  fetchConversations: () => api.get('/conversations'),
  accessConversation: (userId) => api.post('/conversations', { userId }),
  fetchMessages: (conversationId) =>
    api.get(`/messages/conversation/${conversationId}`),
  fetchGroupMessages: (groupId) =>
    api.get(`/messages/group/${groupId}`),
  sendMessage: (data) =>
    data instanceof FormData
      ? uploadApi.post('/messages', data)
      : api.post('/messages', data),
};

// Group service
export const groupService = {
  createGroup: (data) => api.post('/groups', data),
  fetchGroups: () => api.get('/groups'),
  addToGroup: (groupId, userId) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  removeFromGroup: (groupId, userId) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
  renameGroup: (groupId, name) =>
    api.put(`/groups/${groupId}`, { name }),
};

// Notification service
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;

