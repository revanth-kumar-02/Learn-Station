import api from './api';

export const trackService = {
  getAll: async () => {
    const { data } = await api.get('/tracks');
    return data;
  },

  getBySlug: async (slug) => {
    const { data } = await api.get(`/tracks/${slug}`);
    return data;
  },
};
