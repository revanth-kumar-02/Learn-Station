import api from './api';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  icon: string;
  action_url: string | null;
  is_read: boolean;
  metadata: any | null;
  scheduled_at: string;
  created_at: string;
  expires_at: string | null;
}

export const notificationService = {
  getAll: async (
    type: string = 'All',
    search: string = '',
    limit: number = 15,
    offset: number = 0
  ): Promise<{ notifications: NotificationItem[]; count: number; hasMore: boolean }> => {
    const { data } = await api.get<{ notifications: NotificationItem[]; count: number; hasMore: boolean }>('/notifications', {
      params: { type, search, limit, offset },
    });
    return data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean; notification: NotificationItem }> => {
    const { data } = await api.put<{ success: boolean; notification: NotificationItem }>(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    const { data } = await api.put<{ success: boolean }>('/notifications/read-all');
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete<{ success: boolean }>(`/notifications/${id}`);
    return data;
  },

  deleteAll: async (): Promise<{ success: boolean }> => {
    const { data } = await api.delete<{ success: boolean }>('/notifications');
    return data;
  },

  // Admin Broadcast / Targeted Notifications
  sendAdminNotification: async (payload: {
    targetType: 'everyone' | 'selected' | 'track';
    userIds?: string[];
    trackId?: string;
    title: string;
    message: string;
    type?: string;
    icon?: string;
    actionUrl?: string;
    scheduledAt?: string;
  }): Promise<{ success: boolean; message: string; scheduledAt: string }> => {
    const { data } = await api.post<{ success: boolean; message: string; scheduledAt: string }>('/admin/notifications', payload);
    return data;
  },

  previewAdminNotification: async (payload: {
    title: string;
    message: string;
    type?: string;
    icon?: string;
    actionUrl?: string;
  }): Promise<{ preview: Partial<NotificationItem> }> => {
    const { data } = await api.post<{ preview: Partial<NotificationItem> }>('/admin/notifications/preview', payload);
    return data;
  },
};
