// API Service - Chuẩn bị cho việc tích hợp Spring REST API
// Hiện tại sử dụng mock data, sau này sẽ thay thế bằng API calls thực tế

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function để tạo API calls
const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Account Management APIs (Admin only)
export const accountAPI = {
  getAll: (token) => apiCall('/accounts', 'GET', null, token),
  getById: (id, token) => apiCall(`/accounts/${id}`, 'GET', null, token),
  create: (account, token) => apiCall('/accounts', 'POST', account, token),
  update: (id, account, token) => apiCall(`/accounts/${id}`, 'PUT', account, token),
  delete: (id, token) => apiCall(`/accounts/${id}`, 'DELETE', null, token),
  search: (query, token) => apiCall(`/accounts/search?q=${encodeURIComponent(query)}`, 'GET', null, token),
  checkCanDelete: (id, token) => apiCall(`/accounts/${id}/can-delete`, 'GET', null, token),
};

// Category Management APIs (Staff only)
export const categoryAPI = {
  getAll: (token) => apiCall('/categories', 'GET', null, token),
  getById: (id, token) => apiCall(`/categories/${id}`, 'GET', null, token),
  create: (category, token) => apiCall('/categories', 'POST', category, token),
  update: (id, category, token) => apiCall(`/categories/${id}`, 'PUT', category, token),
  delete: (id, token) => apiCall(`/categories/${id}`, 'DELETE', null, token),
  search: (query, token) => apiCall(`/categories/search?q=${encodeURIComponent(query)}`, 'GET', null, token),
  checkCanDelete: (id, token) => apiCall(`/categories/${id}/can-delete`, 'GET', null, token),
};

// News Article Management APIs (Staff only)
export const newsAPI = {
  getAll: (token) => apiCall('/news', 'GET', null, token),
  getById: (id, token) => apiCall(`/news/${id}`, 'GET', null, token),
  create: (news, token) => apiCall('/news', 'POST', news, token),
  update: (id, news, token) => apiCall(`/news/${id}`, 'PUT', news, token),
  delete: (id, token) => apiCall(`/news/${id}`, 'DELETE', null, token),
  search: (query, token) => apiCall(`/news/search?q=${encodeURIComponent(query)}`, 'GET', null, token),
  getByCreator: (creatorId, token) => apiCall(`/news/creator/${creatorId}`, 'GET', null, token),
};

// Tag Management APIs (Staff only)
export const tagAPI = {
  getAll: (token) => apiCall('/tags', 'GET', null, token),
  getById: (id, token) => apiCall(`/tags/${id}`, 'GET', null, token),
  create: (tag, token) => apiCall('/tags', 'POST', tag, token),
  update: (id, tag, token) => apiCall(`/tags/${id}`, 'PUT', tag, token),
  delete: (id, token) => apiCall(`/tags/${id}`, 'DELETE', null, token),
  search: (query, token) => apiCall(`/tags/search?q=${encodeURIComponent(query)}`, 'GET', null, token),
};

// Profile Management APIs (Staff only)
export const profileAPI = {
  getProfile: (token) => apiCall('/profile', 'GET', null, token),
  updateProfile: (profile, token) => apiCall('/profile', 'PUT', profile, token),
  changePassword: (passwordData, token) => apiCall('/profile/password', 'PUT', passwordData, token),
};

// Authentication APIs
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', 'POST', credentials),
  logout: (token) => apiCall('/auth/logout', 'POST', null, token),
  refreshToken: (refreshToken) => apiCall('/auth/refresh', 'POST', { refreshToken }),
};

export default {
  accountAPI,
  categoryAPI,
  newsAPI,
  tagAPI,
  profileAPI,
  authAPI,
};
