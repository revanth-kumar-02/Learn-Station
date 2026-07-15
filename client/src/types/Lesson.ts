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
  type: 'multiple-choice' | 'fill-blank' | 'output-prediction' | 'match-following' | 'debugging';
  question: string;
  xpReward: number;
  options?: string[];
  correctIndex?: number;
  template?: string;
  answer?: string;
  explanation: string;
  hint?: string;
  starter_code?: string;
  expected_output?: string;
  pairs?: Record<string, string>;
  language?: string;
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
  
  // Phase 3 extensions
  why_matters?: string;
  real_world_scenario?: string;
  learning_objective?: string | string[];
  visual_explanation?: any;
  code_walkthrough?: any;
  key_takeaways?: any;
  flashcards?: any[];
  concept_highlights?: string[];
  example_language?: string;
  example_code?: string;
  example_explanation?: string;
  practice_type?: string;
  practice_instruction?: string;
  practice_template?: string;
  practice_answer?: string;
}

export interface LessonResponse {
  lesson: Lesson;
  isCompleted: boolean;
  completedChallenges: string[];
  track?: any;
  progress?: any;
}
