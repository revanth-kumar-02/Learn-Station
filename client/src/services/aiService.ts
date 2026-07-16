import api from './api';

export interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'debugging' | 'output-prediction';
  options?: string[];
  correct_index?: number;
  answer?: string;
  explanation: string;
}

export interface PracticeChallenge {
  title: string;
  description: string;
  starter_code: string;
  expected_output: string;
  language: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  category: string;
}

export interface InterviewMessage {
  sender: 'interviewer' | 'user';
  text: string;
}

export interface InterviewScorecard {
  communicationScore: number;
  technicalAccuracyScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  overallFeedback: string;
  keyTakeaways: string[];
}

export interface RoadmapStage {
  title: string;
  duration: string;
  topics: string[];
}

export interface CareerAdvice {
  skillGaps: string[];
  resumeTips: string[];
  projects: string[];
  nextTracks: string[];
}

export const aiService = {
  mentorChat: async (message: string, lessonSlug?: string, trackSlug?: string, mode?: string): Promise<{ response: string }> => {
    const { data } = await api.post('/ai/mentor', { message, lessonSlug, trackSlug, mode });
    return data;
  },

  generateQuiz: async (scope: string, difficulty: string): Promise<{ questions: QuizQuestion[] }> => {
    const { data } = await api.post('/ai/quiz/generate', { scope, difficulty });
    return data;
  },

  generatePractice: async (language: string, topic: string): Promise<{ challenge: PracticeChallenge }> => {
    const { data } = await api.post('/ai/practice/generate', { language, topic });
    return data;
  },

  generateFlashcards: async (topic: string): Promise<{ cards: Flashcard[] }> => {
    const { data } = await api.post('/ai/flashcards/generate', { topic });
    return data;
  },

  interviewChat: async (category: string, mode: string, history: InterviewMessage[], message: string): Promise<{ response: string }> => {
    const { data } = await api.post('/ai/interview/chat', { category, mode, history, message });
    return data;
  },

  interviewEvaluate: async (category: string, mode: string, history: InterviewMessage[]): Promise<InterviewScorecard> => {
    const { data } = await api.post('/ai/interview/evaluate', { category, mode, history });
    return data;
  },

  plannerRoadmap: async (careerGoal: string, skillLevel: string, hoursAvailable: number): Promise<{ roadmap: RoadmapStage[] }> => {
    const { data } = await api.post('/ai/planner/roadmap', { careerGoal, skillLevel, hoursAvailable });
    return data;
  },

  studyAssist: async (topic: string, type: 'summary' | 'cheatsheet' | 'mindmap'): Promise<{ markdown: string }> => {
    const { data } = await api.post('/ai/study/assist', { topic, type });
    return data;
  },

  careerCoach: async (careerGoal: string, skills: string): Promise<CareerAdvice> => {
    const { data } = await api.post('/ai/career/coach', { careerGoal, skills });
    return data;
  },

  detectWeakness: async (mistakes: string[]): Promise<{ weakTopics: string[] }> => {
    const { data } = await api.post('/ai/detect-weakness', { mistakes });
    return data;
  }
};
