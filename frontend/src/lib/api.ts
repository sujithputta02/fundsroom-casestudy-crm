import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
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
