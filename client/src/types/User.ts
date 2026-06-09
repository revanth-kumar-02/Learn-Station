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
}

export interface UserResponse {
  user: User;
  stats?: Record<string, any>;
  levelInfo?: any;
  trackProgress?: any;
}
