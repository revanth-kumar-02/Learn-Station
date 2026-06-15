import api from './api';

export interface PracticeLesson {
  id: string;
  slug: string;
  title: string;
  track_id: string;
  module_id: string;
  display_order: number;
  estimated_minutes: number;
  xp_reward: number;
  concept_title: string;
  concept_content: string;
  concept_highlights: string[];
  example_language: string;
  example_code: string;
  example_explanation: string;
  practice_type: string;
  practice_instruction: string;
  practice_template: string;
  practice_answer: string;
  track?: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  challenges?: Array<{
    id: string;
    type: 'multiple-choice' | 'fill-blank';
    question: string;
    options?: string[];
    correct_index?: number;
    template?: string;
    answer?: string;
    explanation?: string;
  }>;
}

export interface PracticeStats {
  completedLessons: PracticeLesson[];
  dailyPracticeXp: number;
  completedLessonsToday: string[];
}

export const practiceService = {
  getCompletedLessons: async (): Promise<PracticeStats> => {
    const res = await api.get('/practice');
    return res.data;
  },

  completePracticeActivity: async (
    lessonId: string,
    activityType: 'quiz' | 'challenge' | 'ai-interview' | 'flashcard' | 'timed' | 'notes'
  ): Promise<{
    success: boolean;
    xpEarned: number;
    dailyPracticeXp: number;
    totalXp: number;
    level: number;
    message: string;
    newAchievements: any[];
  }> => {
    const res = await api.post('/practice/complete', { lessonId, activityType });
    return res.data;
  }
};
