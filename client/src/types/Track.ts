import { Lesson } from './Lesson';
import { Progress } from './Progress';

export interface CapstoneProject {
  title?: string;
  description?: string;
  requirements?: string[];
}

export interface Module {
  id: string;
  name: string;
  order: number;
  learning_objective?: string;
  lessons: Lesson[];
}

export interface Track {
  _id: string;
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  order?: number;
  isAiGenerated: boolean;
  modules?: Module[];
  capstone_project?: CapstoneProject;
  progress?: Progress;
}

export interface TrackResponse {
  track: Track;
  progress?: Progress;
}

export interface AllTracksResponse {
  tracks: Track[];
}
