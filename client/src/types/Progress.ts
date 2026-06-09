export interface Progress {
  completedLessons: string[];
  completedChallenges: string[];
  xpEarned: number;
  progressPercent: number;
  currentModule: string | null;
  currentLesson: string | null;
  currentLessonSlug?: string;
  lastAccessedAt?: string | null;
}
