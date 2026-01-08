import { apiClient } from './apiClient';
import type { LoginRequest, LoginResponse, MFARequest, User } from '@/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  verifyMFA: async (mfaData: MFARequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/mfa/verify', mfaData);
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    return apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  forgotPassword: async (email: string): Promise<void> => {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    return apiClient.post<void>('/auth/reset-password', { token, password });
  },
};
