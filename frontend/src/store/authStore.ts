import { create } from 'zustand';
import { AuthState, User } from '../types';
import { authAPI } from '../lib/api';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth_token') || null,
  user: JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('auth_token'),

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(username, password);
      if (response.success && response.data) {
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setToken: (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  updateSettings: async (theme?: string, enableStockAlerts?: boolean) => {
    try {
      const response = await authAPI.updateSettings({ theme, enableStockAlerts });
      if (response.success && response.data) {
        const updatedUser = { ...get().user, ...response.data };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (error: any) {
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw error;
    }
  },

  hasRole: (allowedRoles: string[]) => {
    const { user } = get();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },

  hasAnyRole: (roles: string[]) => {
    const { user } = get();
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  },
}));
