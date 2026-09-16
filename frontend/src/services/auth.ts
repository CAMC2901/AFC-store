import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const AuthApi = {
  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', payload);
    return data.data.user;
  },

  async login(payload: { email: string; password: string }): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/auth/login', payload);
    return data.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data.user;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.post('/account/change-password', payload);
  },

  async forgotPassword(email: string): Promise<{ message: string; devResetToken?: string }> {
    const { data } = await apiClient.post<ApiResponse<{ message: string; devResetToken?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return data.data;
  },

  async resetPassword(payload: {
    email: string;
    resetToken: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      payload
    );
    return data.data;
  },
};
