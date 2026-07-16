import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  reputation: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  admin_id: string;
  learning_goal?: string;
  created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  track_id: string;
  title: string;
  content: string;
  upvotes: number;
  is_resolved: boolean;
  created_at: string;
  author: UserProfile;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  is_accepted: boolean;
  created_at: string;
  author: UserProfile;
}

export interface PeerReview {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  created_at: string;
  author: UserProfile;
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  category: 'readability' | 'logic' | 'best-practices' | 'performance' | 'style';
  comment: string;
  created_at: string;
  author: UserProfile;
}

export interface SharedResource {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'notes' | 'cheatsheet' | 'mindmap' | 'template' | 'snippet';
  content: string;
  likes: number;
  downloads: number;
  created_at: string;
  author: UserProfile;
}

export const communityService = {
  getFriends: async (): Promise<{ active: UserProfile[]; incoming: UserProfile[]; outgoing: UserProfile[]; suggestions: UserProfile[] }> => {
    const { data } = await api.get('/community/friends');
    return data;
  },

  sendFriendRequest: async (friendId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/friends/request', { friendId });
    return data;
  },

  acceptFriendRequest: async (friendId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/friends/accept', { friendId });
    return data;
  },

  rejectFriendRequest: async (friendId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/friends/reject', { friendId });
    return data;
  },

  getStudyGroups: async (): Promise<{ myGroups: StudyGroup[]; discover: StudyGroup[] }> => {
    const { data } = await api.get('/community/groups');
    return data;
  },

  createStudyGroup: async (groupData: { name: string; description: string; category: string; learningGoal: string }): Promise<{ success: boolean; group: StudyGroup }> => {
    const { data } = await api.post('/community/groups/create', groupData);
    return data;
  },

  joinStudyGroup: async (groupId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/groups/join', { groupId });
    return data;
  },

  leaveStudyGroup: async (groupId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/groups/leave', { groupId });
    return data;
  },

  getForumPosts: async (trackId?: string): Promise<{ posts: ForumPost[] }> => {
    const { data } = await api.get('/community/forum', { params: { trackId } });
    return data;
  },

  createForumPost: async (postData: { trackId: string; title: string; content: string }): Promise<{ success: boolean; post: ForumPost }> => {
    const { data } = await api.post('/community/forum/post', postData);
    return data;
  },

  createForumReply: async (replyData: { postId: string; content: string }): Promise<{ success: boolean; reply: ForumReply }> => {
    const { data } = await api.post('/community/forum/reply', replyData);
    return data;
  },

  upvoteForumItem: async (itemId: string, type: 'post' | 'reply'): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/forum/upvote', { itemId, type });
    return data;
  },

  getPeerReviews: async (): Promise<{ reviews: PeerReview[] }> => {
    const { data } = await api.get('/community/peer-review');
    return data;
  },

  submitCodeForReview: async (reviewData: { title: string; code: string; language: string; description?: string }): Promise<{ success: boolean; review: PeerReview }> => {
    const { data } = await api.post('/community/peer-review/submit', reviewData);
    return data;
  },

  createReviewComment: async (commentData: { reviewId: string; category: string; comment: string }): Promise<{ success: boolean; comment: ReviewComment }> => {
    const { data } = await api.post('/community/peer-review/comment', commentData);
    return data;
  },

  getSharedResources: async (): Promise<{ resources: SharedResource[] }> => {
    const { data } = await api.get('/community/resources');
    return data;
  },

  shareResource: async (resourceData: { title: string; description?: string; type: string; content: string }): Promise<{ success: boolean; resource: SharedResource }> => {
    const { data } = await api.post('/community/resources/share', resourceData);
    return data;
  },

  likeResource: async (resourceId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/community/resources/like', { resourceId });
    return data;
  }
};
