import api from './api';

export const userService = {
  getProfile: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/users/me', updates);
    return data;
  },

  getAchievements: async () => {
    const { data } = await api.get('/users/me/achievements');
    return data;
  },

  getActivity: async () => {
    const { data } = await api.get('/users/me/activity');
    return data;
  },
};

export const lessonService = {
  getBySlug: async (slug) => {
    const { data } = await api.get(`/lessons/${slug}`);
    return data;
  },

  complete: async (slug, perfectScore = false) => {
    const { data } = await api.post(`/lessons/${slug}/complete`, { perfectScore });
    return data;
  },
};

export const challengeService = {
  submit: async (challengeId, answer) => {
    const { data } = await api.post(`/challenges/${challengeId}/submit`, { answer });
    return data;
  },
};
