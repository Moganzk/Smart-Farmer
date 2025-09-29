import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // Get auth token from storage
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 (Unauthorized) - Token expired
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        if (!refreshToken) {
          // No refresh token, user needs to log in again
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        if (response.data.token) {
          await AsyncStorage.setItem('@auth_token', response.data.token);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, user needs to log in again
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@refresh_token');
        // You could dispatch an action to redirect to login here
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verify: () => api.get('/auth/verify'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
    resetPassword: (email) => api.post('/auth/reset-password', { email }),
    verifyCode: (phone, code) => api.post('/auth/verify-code', { phone, code }),
  },
  
  // User profile endpoints
  user: {
    getProfile: () => api.get('/profile'),
    updateProfile: (userData) => api.put('/profile', userData),
    uploadProfileImage: (formData) => api.post('/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },
  
  // Disease detection endpoints
  diseases: {
    detect: (formData) => api.post('/diseases/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getHistory: (params) => api.get('/diseases/history', { params }),
    getDetails: (id) => api.get(`/diseases/${id}`),
    deleteDetection: (id) => api.delete(`/diseases/${id}`),
  },
  
  // Advisory endpoints
  advisory: {
    getCategories: () => api.get('/advisory/categories'),
    getContent: (categoryId, params) => api.get(`/advisory/categories/${categoryId}`, { params }),
    search: (query) => api.get('/advisory/search', { params: { query } }),
    getFeatured: () => api.get('/advisory/featured'),
    getRecent: () => api.get('/advisory/recent'),
    getSaved: () => api.get('/advisory/saved'),
    toggleSave: (contentId) => api.post(`/advisory/${contentId}/save`),
    askQuestion: (question) => api.post('/advisory/ask', { question }),
  },
  
  // Groups endpoints
  groups: {
    getMyGroups: () => api.get('/groups/mine'),
    discover: (params) => api.get('/groups/discover', { params }),
    create: (groupData) => api.post('/groups', groupData),
    getDetails: (groupId) => api.get(`/groups/${groupId}`),
    join: (groupCode) => api.post('/groups/join', { code: groupCode }),
    leave: (groupId) => api.post(`/groups/${groupId}/leave`),
    getMembers: (groupId) => api.get(`/groups/${groupId}/members`),
    getMessages: (groupId, params) => api.get(`/groups/${groupId}/messages`, { params }),
    sendMessage: (groupId, message) => api.post(`/groups/${groupId}/messages`, message),
  },
};

export default apiService;