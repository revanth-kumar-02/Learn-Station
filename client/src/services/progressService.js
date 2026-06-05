import api from './api';

export const progressService = {
  getAll: async () => {
    const { data } = await api.get('/progress');
    return data;
  },

  getByTrack: async (trackSlug) => {
    const { data } = await api.get(`/progress/${trackSlug}`);
    return data;
  },
};
