export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  dailyXpGoal: number;
  dailyXpEarned: number;
  currentTrack?: string;
  bio?: string;
  username?: string;
  createdAt?: string;
  role?: 'student' | 'admin' | 'owner';
  isSuspended?: boolean;
  avatarUrl?: string;
  provider?: string;
  daily_missions?: any;
}

export interface UserResponse {
  user: User;
  stats?: Record<string, any>;
  levelInfo?: any;
  trackProgress?: any;
}
