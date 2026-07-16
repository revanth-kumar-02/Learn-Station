import api from './api';

export interface ResumeData {
  id?: string;
  user_id?: string;
  template: 'modern' | 'professional' | 'ats' | 'minimal';
  experience: { company: string; role: string; duration: string; details: string }[];
  education: { institution: string; degree: string; year: string }[];
  additional_skills: string[];
}

export interface PortfolioData {
  id?: string;
  user_id?: string;
  theme: 'minimal' | 'developer' | 'creative';
  slug: string;
  custom_sections: Record<string, any>;
  is_published: boolean;
}

export interface ShowcasedProject {
  id?: string;
  user_id?: string;
  project_name: string;
  description: string;
  technologies: string[];
  github_url: string;
  live_url: string;
  skills_used: string[];
}

export interface CompanyPrep {
  name: string;
  roadmap: string[];
  challengesCount: number;
  questionsCount: number;
}

export interface LearningReportMetrics {
  completedLessons: number;
  activeLessons: number;
  totalXp: number;
  currentStreak: number;
  learningHours: number;
  growthTrend: { week: string; xp: number }[];
}

export const careerService = {
  getResume: async (): Promise<{ resume: ResumeData; profile: any }> => {
    const { data } = await api.get('/career/resume');
    return data;
  },

  saveResume: async (resumeData: ResumeData): Promise<{ success: boolean; resume: ResumeData }> => {
    const { data } = await api.post('/career/resume/save', resumeData);
    return data;
  },

  getPortfolio: async (): Promise<{ portfolio: PortfolioData }> => {
    const { data } = await api.get('/career/portfolio');
    return data;
  },

  savePortfolio: async (portfolioData: PortfolioData): Promise<{ success: boolean; portfolio: PortfolioData }> => {
    const { data } = await api.post('/career/portfolio/save', portfolioData);
    return data;
  },

  getProjects: async (): Promise<{ projects: ShowcasedProject[] }> => {
    const { data } = await api.get('/career/projects');
    return data;
  },

  saveProject: async (projectData: ShowcasedProject): Promise<{ success: boolean; project: ShowcasedProject }> => {
    const { data } = await api.post('/career/projects/save', projectData);
    return data;
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.post('/career/projects/delete', { id });
    return data;
  },

  connectGithub: async (githubUsername: string): Promise<{ success: boolean; githubConnected: boolean; githubUsername: string; stats: any }> => {
    const { data } = await api.post('/career/github/connect', { githubUsername });
    return data;
  },

  getPlacementPrep: async (): Promise<{ companies: CompanyPrep[] }> => {
    const { data } = await api.get('/career/placement-prep');
    return data;
  },

  getLearningReports: async (): Promise<{ report: LearningReportMetrics }> => {
    const { data } = await api.get('/career/learning-reports');
    return data;
  },

  getPublicPortfolio: async (slug: string): Promise<any> => {
    const { data } = await api.get(`/career/portfolio/public/${slug}`);
    return data;
  }
};
