import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Keep-alive pinger to prevent Render cold starts
let keepAlivePingInterval: NodeJS.Timeout | null = null;

const startKeepAlivePing = () => {
  // Only ping if using Render backend (production)
  const baseUrl = API_BASE_URL.replace('/api/v1', '');
  if (baseUrl.includes('render.com')) {
    console.log('🏓 Starting keep-alive pinger for Render backend');
    
    // Initial ping immediately
    axios.get(`${baseUrl}/ping`, { timeout: 5000 }).catch(() => {});
    
    // Then ping every 10 minutes (Render spins down after 15 min)
    keepAlivePingInterval = setInterval(async () => {
      try {
        await axios.get(`${baseUrl}/ping`, { timeout: 5000 });
        console.log('🏓 Keep-alive ping sent');
      } catch (err) {
        console.warn('⚠️ Keep-alive ping failed');
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
};

const stopKeepAlivePing = () => {
  if (keepAlivePingInterval) {
    clearInterval(keepAlivePingInterval);
    keepAlivePingInterval = null;
  }
};

// Start keep-alive on module load
startKeepAlivePing();

// Stop on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopKeepAlivePing);
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    
    // Handle 502/503/504 errors (likely Render cold start)
    if (error.response?.status === 502 || error.response?.status === 503 || error.response?.status === 504) {
      const customError = {
        message: 'Server is waking up from sleep. Please wait a moment and try again...',
        code: 'SERVER_STARTING',
        isRecoverable: true,
      };
      return Promise.reject(customError);
    }
    
    // Handle network errors (no response from server)
    if (!error.response && error.message === 'Network Error') {
      const customError = {
        message: 'Server is starting up. Please wait 30 seconds and refresh the page...',
        code: 'COLD_START',
        isRecoverable: true,
      };
      return Promise.reject(customError);
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<any, ApiResponse>('/auth/login', { username, password }),
  getMe: () => api.get<any, ApiResponse>('/auth/me'),
  updateSettings: (data: { theme?: string; enableStockAlerts?: boolean }) =>
    api.put<any, ApiResponse>('/auth/settings', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<any, ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
};

// Customer API
export const customerAPI = {
  create: (data: any) =>
    api.post<any, ApiResponse>('/customers', data),
  getAll: (limit?: number, offset?: number, search?: string, status?: string) =>
    api.get<any, ApiResponse>('/customers', {
      params: { limit, offset, search, status },
    }),
  getById: (id: string) =>
    api.get<any, ApiResponse>(`/customers/${id}`),
  update: (id: string, data: any) =>
    api.put<any, ApiResponse>(`/customers/${id}`, data),
  addFollowUp: (id: string, note: string) =>
    api.post<any, ApiResponse>(`/customers/${id}/follow-ups`, { note }),
  getFollowUps: (id: string, limit?: number, offset?: number) =>
    api.get<any, ApiResponse>(`/customers/${id}/follow-ups`, {
      params: { limit, offset },
    }),
};

// Product API
export const productAPI = {
  create: (data: any) =>
    api.post<any, ApiResponse>('/products', data),
  getAll: (limit?: number, offset?: number, search?: string, category?: string) =>
    api.get<any, ApiResponse>('/products', {
      params: { limit, offset, search, category },
    }),
  getById: (id: string) =>
    api.get<any, ApiResponse>(`/products/${id}`),
  update: (id: string, data: any) =>
    api.put<any, ApiResponse>(`/products/${id}`, data),
  getLowStock: (limit?: number) =>
    api.get<any, ApiResponse>('/products/low-stock', { params: { limit } }),
};

// Stock API
export const stockAPI = {
  create: (data: any) =>
    api.post<any, ApiResponse>('/stock/movements', data),
  getAll: (limit?: number, offset?: number, productId?: string, movementType?: string) =>
    api.get<any, ApiResponse>('/stock/movements', {
      params: { limit, offset, productId, movementType },
    }),
};

// Challan API
export const challanAPI = {
  create: (data: any) =>
    api.post<any, ApiResponse>('/challans', data),
  getAll: (limit?: number, offset?: number, status?: string, customerId?: string) =>
    api.get<any, ApiResponse>('/challans', {
      params: { limit, offset, status, customerId },
    }),
  getById: (id: string) =>
    api.get<any, ApiResponse>(`/challans/${id}`),
  update: (id: string, data: any) =>
    api.put<any, ApiResponse>(`/challans/${id}`, data),
  confirm: (id: string) =>
    api.post<any, ApiResponse>(`/challans/${id}/confirm`, {}),
  cancel: (id: string) =>
    api.post<any, ApiResponse>(`/challans/${id}/cancel`, {}),
  downloadPDF: async (id: string, challanNumber: string) => {
    const response = await axios.get(`${API_BASE_URL}/challans/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `challan-${challanNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return response;
  },
};

// Dashboard API
export const dashboardAPI = {
  getSummary: () =>
    api.get<any, ApiResponse>('/dashboard/summary'),
  getSalesTrend: () =>
    api.get<any, ApiResponse>('/dashboard/sales-trend'),
  getStockHealth: () =>
    api.get<any, ApiResponse>('/dashboard/stock-health'),
};

// User API (ADMIN only)
export const userAPI = {
  getAll: (limit?: number, offset?: number) =>
    api.get<any, ApiResponse>('/users', {
      params: { limit, offset },
    }),
  getById: (id: string) =>
    api.get<any, ApiResponse>(`/users/${id}`),
  create: (data: any) =>
    api.post<any, ApiResponse>('/users', data),
  update: (id: string, data: any) =>
    api.put<any, ApiResponse>(`/users/${id}`, data),
  delete: (id: string) =>
    api.delete<any, ApiResponse>(`/users/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post<any, ApiResponse>(`/users/${id}/reset-password`, { newPassword }),
};
