import api from './api';
import { Progress } from '../types/Progress';

export interface ProgressListResponse {
  progress: (Progress & {
    _id: string;
    id: string;
    track: {
      _id: string;
      id: string;
      slug: string;
      name: string;
      color: string;
      icon: string;
    } | null;
    currentLesson: {
      _id: string;
      id: string;
      slug: string;
      title: string;
    } | null;
  })[];
  streak: number;
  longestStreak: number;
  dailyXpGoal: number;
  dailyXpEarned: number;
}

export interface TrackProgressResponse {
  progress: Progress & {
    _id?: string;
    id?: string;
    currentLesson: {
      _id: string;
      id: string;
      slug: string;
      title: string;
    } | null;
  };
}

export const progressService = {
  getAll: async (): Promise<ProgressListResponse> => {
    const { data } = await api.get<ProgressListResponse>('/progress');
    return data;
  },

  getByTrack: async (trackSlug: string): Promise<TrackProgressResponse> => {
    const { data } = await api.get<TrackProgressResponse>(`/progress/${trackSlug}`);
    return data;
  },

  submitCapstone: async (trackId: string, repoUrl: string, demoUrl?: string): Promise<any> => {
    const { data } = await api.post<any>('/progress/capstone/submit', { trackId, repoUrl, demoUrl });
    return data;
  },

  getCertificate: async (certId: string): Promise<any> => {
    const { data } = await api.get<any>(`/progress/certificate/${certId}`);
    return data;
  },

  submitAssessment: async (payload: {
    trackId: string;
    moduleId?: string;
    type: 'module' | 'track';
    answers: { challengeId: string; answer: string }[];
  }): Promise<any> => {
    const { data } = await api.post<any>('/progress/assessment/submit', payload);
    return data;
  },

  getAssessmentStatus: async (trackId: string, type: 'module' | 'track', moduleId?: string): Promise<any> => {
    const { data } = await api.get<any>('/progress/assessment/status', {
      params: { trackId, type, moduleId },
    });
    return data;
  },

  getAssessmentQuestions: async (trackId: string, type: 'module' | 'track', moduleId?: string): Promise<any> => {
    const { data } = await api.get<any>('/progress/assessment/questions', {
      params: { trackId, type, moduleId },
    });
    return data;
  },

  generatePracticeChallenge: async (trackId: string, difficulty: 'easy' | 'medium' | 'hard', type: string): Promise<any> => {
    const { data } = await api.post<any>('/practice/generate', { trackId, difficulty, type });
    return data;
  },

  validatePracticeSolution: async (payload: {
    code: string;
    language: string;
    challenge: any;
    timeSpent: number;
  }): Promise<any> => {
    const { data } = await api.post<any>('/practice/validate', payload);
    return data;
  },

  getCodingAnalytics: async (): Promise<any> => {
    const { data } = await api.get<any>('/practice/analytics');
    return data;
  },
};
