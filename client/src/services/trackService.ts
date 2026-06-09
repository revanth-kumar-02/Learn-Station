import api from './api';
import { AllTracksResponse, TrackResponse } from '../types/Track';

export const trackService = {
  getAll: async (): Promise<AllTracksResponse> => {
    const { data } = await api.get<AllTracksResponse>('/tracks');
    return data;
  },

  getBySlug: async (slug: string): Promise<TrackResponse> => {
    const { data } = await api.get<TrackResponse>(`/tracks/${slug}`);
    return data;
  },
};
