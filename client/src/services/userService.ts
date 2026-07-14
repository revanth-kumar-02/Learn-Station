import api from './api';
import { UserResponse } from '../types/User';
import { AchievementsResponse } from '../types/Achievement';
import { LessonResponse } from '../types/Lesson';
import { progressService as progressServiceRef } from './progressService';

export const progressService = progressServiceRef;

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>('/users/me');
    return data;
  },

  updateProfile: async (updates: Partial<UserResponse['user']>): Promise<UserResponse> => {
    const { data } = await api.put<UserResponse>('/users/me', updates);
    return data;
  },

  getAchievements: async (): Promise<AchievementsResponse> => {
    const { data } = await api.get<AchievementsResponse>('/users/me/achievements');
    return data;
  },

  getActivity: async (): Promise<any> => {
    const { data } = await api.get<any>('/users/me/activity');
    return data;
  },

  getLeaderboard: async (): Promise<any> => {
    const { data } = await api.get<any>('/users/leaderboard');
    return data;
  },

  getPublicProfile: async (username: string): Promise<any> => {
    const { data } = await api.get<any>(`/users/public/${username}`);
    return data;
  },

  getSettings: async (): Promise<any> => {
    const { data } = await api.get<any>('/users/me/settings');
    return data;
  },

  updateSettings: async (settingsUpdates: any): Promise<any> => {
    const { data } = await api.put<any>('/users/me/settings', settingsUpdates);
    return data;
  },

  deleteAccount: async (): Promise<any> => {
    const { data } = await api.delete<any>('/users/me');
    return data;
  },
};

export const lessonService = {
  getBySlug: async (slug: string): Promise<LessonResponse> => {
    const { data } = await api.get<LessonResponse>(`/lessons/${slug}`);
    return data;
  },

  complete: async (slug: string, quizScore: number = 0, quizPassed: boolean = false): Promise<any> => {
    const { data } = await api.post<any>(`/lessons/${slug}/complete`, { quizScore, quizPassed });
    return data;
  },
};

export const challengeService = {
  submit: async (challengeId: string, answer: string): Promise<any> => {
    const { data } = await api.post<any>(`/challenges/${challengeId}/submit`, { answer });
    return data;
  },
};

export const aiService = {
  generate: async (payload: any): Promise<any> => {
    const { data } = await api.post<any>('/ai/generate', payload);
    return data;
  },

  mentor: async (message: string, lessonSlug?: string | null, trackSlug?: string | null, mode: string = 'default'): Promise<any> => {
    const { data } = await api.post<any>('/ai/mentor', { message, lessonSlug, trackSlug, mode });
    return data;
  },
};
