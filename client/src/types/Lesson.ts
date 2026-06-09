export interface Concept {
  title: string;
  content: string;
  highlights: string[];
}

export interface Example {
  language: string;
  code: string;
  explanation: string;
}

export interface Practice {
  type: string;
  instruction: string;
  template: string;
  answer: string;
}

export interface Challenge {
  _id: string;
  id: string;
  lesson: string;
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  xpReward: number;
  options?: string[];
  correctIndex?: number;
  template?: string;
  answer?: string;
  explanation: string;
  hint?: string;
}

export interface Lesson {
  _id: string;
  id: string;
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  moduleId: string;
  challengeIds?: string[];
  summary?: string;
  concept?: Concept;
  example?: Example;
  practice?: Practice;
  challenges?: Challenge[];
}

export interface LessonResponse {
  lesson: Lesson;
  isCompleted: boolean;
  completedChallenges: string[];
  track?: any;
  progress?: any;
}
