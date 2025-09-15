import axios from 'axios';

// Use Railway backend for data operations, local API for auth
const BACKEND_URL = 'https://xeno-crm-backend-production.up.railway.app';
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('xeno-crm-v5.vercel.app');

// Create axios instance for data operations (Railway backend)
const api = axios.create({
  baseURL: isVercel ? BACKEND_URL : 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for auth operations (local API to avoid CORS)
const authApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
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

// Auth API (uses local API to avoid CORS)
export const authAPI = {
  googleLogin: (token: string) => authApi.post('/auth/google', { token }),
  refreshToken: (token: string) => authApi.post('/auth/refresh', { token }),
  logout: () => authApi.post('/auth/logout'),
  getProfile: () => authApi.get('/auth/profile'),
  updateProfile: (data: any) => authApi.put('/auth/profile', data),
  verifyToken: () => authApi.get('/auth/verify'),
};

// Customer API
export const customerAPI = {
  getCustomers: (params?: any) => api.get('/customers', { params }),
  getCustomerById: (id: string) => api.get(`/customers/${id}`),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: string, data: any) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
  getCustomerStats: () => api.get('/customers/stats'),
  searchCustomers: (query: string) => api.get('/customers/search', { params: { query } }),
};

// Order API
export const orderAPI = {
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders', data),
  updateOrder: (id: string, data: any) => api.put(`/orders/${id}`, data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
  getOrderStats: () => api.get('/orders/stats'),
  getCustomerOrders: (customerId: string, params?: any) => 
    api.get(`/customers/${customerId}/orders`, { params }),
};

// Segment API
export const segmentAPI = {
  getSegments: (params?: any) => api.get('/segments', { params }),
  getSegmentById: (id: string) => api.get(`/segments/${id}`),
  createSegment: (data: any) => api.post('/segments', data),
  updateSegment: (id: string, data: any) => api.put(`/segments/${id}`, data),
  deleteSegment: (id: string) => api.delete(`/segments/${id}`),
  previewSegment: (rules: any) => api.post('/segments/preview', { rules }),
  buildSegment: (id: string) => api.post(`/segments/${id}/build`),
  getSegmentCustomers: (id: string, params?: any) => 
    api.get(`/segments/${id}/customers`, { params }),
  getSegmentStats: (id: string) => api.get(`/segments/${id}/stats`),
  validateRules: (rules: any) => api.post('/segments/validate-rules', { rules }),
  getRuleFields: () => api.get('/segments/rule-fields'),
};

// Campaign API
export const campaignAPI = {
  getCampaigns: (params?: any) => api.get('/campaigns', { params }),
  getCampaignById: (id: string) => api.get(`/campaigns/${id}`),
  createCampaign: (data: any) => api.post('/campaigns', data),
  updateCampaign: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),
  startCampaign: (id: string) => api.post(`/campaigns/${id}/start`),
  pauseCampaign: (id: string) => api.post(`/campaigns/${id}/pause`),
  resumeCampaign: (id: string) => api.post(`/campaigns/${id}/resume`),
  cancelCampaign: (id: string) => api.post(`/campaigns/${id}/cancel`),
  scheduleCampaign: (id: string, scheduledAt: string) => 
    api.post(`/campaigns/${id}/schedule`, { scheduledAt }),
  getCampaignStats: (id: string) => api.get(`/campaigns/${id}/stats`),
  getCampaignLogs: (id: string, params?: any) => 
    api.get(`/campaigns/${id}/logs`, { params }),
  getCampaignInsights: (id: string) => api.get(`/campaigns/${id}/insights`),
};

// Delivery API
export const deliveryAPI = {
  getDeliveryStats: (params?: any) => api.get('/delivery/stats', { params }),
  getDeliveryLogs: (params?: any) => api.get('/delivery/logs', { params }),
  retryFailedDelivery: (logId: string) => api.post(`/delivery/retry/${logId}`),
};

// AI API
export const aiAPI = {
  parseNaturalLanguageToRules: (prompt: string) => 
    api.post('/ai/parse-rules', { prompt }),
  generateMessageSuggestions: (data: any) => 
    api.post('/ai/message-suggestions', data),
  generatePerformanceSummary: (campaignId: string) => 
    api.get(`/ai/performance-summary/${campaignId}`),
  suggestOptimalScheduling: (customerIds: string[]) => 
    api.post('/ai/suggest-scheduling', { customerIds }),
  generateLookalikeAudience: (segmentId: string) => 
    api.get(`/ai/lookalike-audience/${segmentId}`),
  autoTagCampaign: (campaignId: string) => 
    api.get(`/ai/auto-tag/${campaignId}`),
};

// Ingest API
export const ingestAPI = {
  createCustomer: (data: any) => api.post('/ingest/customers', data),
  createCustomerAsync: (data: any) => api.post('/ingest/customers/async', data),
  createCustomersBatch: (customers: any[]) => 
    api.post('/ingest/customers/batch', { customers }),
  createCustomersBatchAsync: (customers: any[]) => 
    api.post('/ingest/customers/batch/async', { customers }),
  createOrder: (data: any) => api.post('/ingest/orders', data),
  createOrderAsync: (data: any) => api.post('/ingest/orders/async', data),
  createOrdersBatch: (orders: any[]) => 
    api.post('/ingest/orders/batch', { orders }),
  createOrdersBatchAsync: (orders: any[]) => 
    api.post('/ingest/orders/batch/async', { orders }),
  getHealth: () => api.get('/ingest/health'),
  getStats: () => api.get('/ingest/stats'),
};

// Chat API (uses local API to avoid CORS)
export const chatAPI = {
  generateContent: (message: string) => authApi.post('/chat/generate', { message }),
};

export default api;
