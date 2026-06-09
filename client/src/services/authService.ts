import api from './api';
import { UserResponse } from '../types/User';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<UserResponse> => {
    const { data } = await api.post<UserResponse>('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<UserResponse> => {
    const { data } = await api.post<UserResponse>('/auth/login', { email, password });
    return data;
  },

  getMe: async (): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>('/auth/me');
    return data;
  },

  refresh: async (refreshToken: string): Promise<any> => {
    const { data } = await api.post<any>('/auth/refresh', { refreshToken });
    return data;
  },
};
