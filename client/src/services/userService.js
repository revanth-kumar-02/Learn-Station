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

  getLeaderboard: async () => {
    const { data } = await api.get('/users/leaderboard');
    return data;
  },

  getPublicProfile: async (username) => {
    const { data } = await api.get(`/users/public/${username}`);
    return data;
  },
};

export const lessonService = {
  getBySlug: async (slug) => {
    const { data } = await api.get(`/lessons/${slug}`);
    return data;
  },

  complete: async (slug, quizScore = 0, quizPassed = false) => {
    const { data } = await api.post(`/lessons/${slug}/complete`, { quizScore, quizPassed });
    return data;
  },
};

export const challengeService = {
  submit: async (challengeId, answer) => {
    const { data } = await api.post(`/challenges/${challengeId}/submit`, { answer });
    return data;
  },
};

export const progressService = {
  getAll: async () => {
    const { data } = await api.get('/progress');
    return data;
  },

  getByTrack: async (trackSlug) => {
    const { data } = await api.get(`/progress/${trackSlug}`);
    return data;
  },

  submitCapstone: async (trackId, repoUrl, demoUrl) => {
    const { data } = await api.post('/progress/capstone/submit', { trackId, repoUrl, demoUrl });
    return data;
  },

  getCertificate: async (certId) => {
    const { data } = await api.get(`/progress/certificate/${certId}`);
    return data;
  },
};

export const aiService = {
  generate: async (payload) => {
    const { data } = await api.post('/ai/generate', payload);
    return data;
  },

  mentor: async (message, lessonSlug, trackSlug, mode = 'default') => {
    const { data } = await api.post('/ai/mentor', { message, lessonSlug, trackSlug, mode });
    return data;
  },
};
