/**
 * XP & Level Calculation Utilities
 * Phase 2 — Learn Station Evolution
 */

export interface UserDataStats {
  completedLessonsCount?: number;
  xp?: number;
  streak?: number;
  longestStreak?: number;
  completedTracksList?: string[];
  perfectQuizzesCount?: number;
  completedChallengesCount?: number;
  aiPathsGenerated?: number;
  completedProjectsCount?: number;
  isNightLearning?: boolean;
  isEarlyLearning?: boolean;
  isWeekendLearning?: boolean;
  achievements?: string[];
  level?: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'Standard' | 'Rare' | 'Legendary';
  xpBonus: number;
  target: number;
  check: (stats: UserDataStats) => boolean;
}

export interface Mission {
  id: string;
  text: string;
  target: number;
  current: number;
  xp_reward: number;
  completed: boolean;
}

export interface DailyMissions {
  date: string;
  missions: Mission[];
  bonusClaimed: boolean;
  stats: {
    perfectQuizzes: number;
    challengesSolved: number;
    projectsSubmitted: number;
    aiRoadmaps: number;
  };
}

// Level thresholds: Level N requires increasing XP cumulative steps
export const xpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  let total = 250;
  let currentRequirement = 500;
  for (let i = 3; i <= level; i++) {
    total += currentRequirement;
    if (i === 3) currentRequirement = 1000;
    else if (i === 4) currentRequirement = 1500;
    else currentRequirement += 500; // grows by 500 each level thereafter
  }
  return total;
};

export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  while (totalXP >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
};

export const xpForNextLevel = (level: number): number => {
  return xpForLevel(level + 1);
};

export const xpProgressInLevel = (totalXP: number) => {
  const level = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForNextLevel(level);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return {
    level,
    xpInLevel,
    xpNeeded,
    progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 1,
  };
};

// Achievement definitions
export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // --- Learning Milestones ---
  'lesson-1': {
    id: 'lesson-1',
    name: 'First Lesson',
    description: 'Complete your first lesson in Learn Station',
    icon: '📚',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 50,
    target: 1,
    check: (stats) => (stats.completedLessonsCount || 0) >= 1,
  },
  'lesson-10': {
    id: 'lesson-10',
    name: '10 Lessons',
    description: 'Complete 10 lessons',
    icon: '📖',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 100,
    target: 10,
    check: (stats) => (stats.completedLessonsCount || 0) >= 10,
  },
  'lesson-25': {
    id: 'lesson-25',
    name: '25 Lessons',
    description: 'Complete 25 lessons',
    icon: '📝',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 150,
    target: 25,
    check: (stats) => (stats.completedLessonsCount || 0) >= 25,
  },
  'lesson-50': {
    id: 'lesson-50',
    name: '50 Lessons',
    description: 'Complete 50 lessons',
    icon: '🎓',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 200,
    target: 50,
    check: (stats) => (stats.completedLessonsCount || 0) >= 50,
  },
  'lesson-100': {
    id: 'lesson-100',
    name: '100 Lessons',
    description: 'Complete 100 lessons',
    icon: '🧠',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 300,
    target: 100,
    check: (stats) => (stats.completedLessonsCount || 0) >= 100,
  },
  'lesson-250': {
    id: 'lesson-250',
    name: '250 Lessons',
    description: 'Complete 250 lessons',
    icon: '🏛️',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 500,
    target: 250,
    check: (stats) => (stats.completedLessonsCount || 0) >= 250,
  },
  'lesson-500': {
    id: 'lesson-500',
    name: '500 Lessons',
    description: 'Complete 500 lessons',
    icon: '👑',
    category: 'milestones',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 500,
    check: (stats) => (stats.completedLessonsCount || 0) >= 500,
  },

  // --- XP Achievements ---
  'xp-100': {
    id: 'xp-100',
    name: 'First 100 XP',
    description: 'Earn your first 100 XP points',
    icon: '⚡',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 50,
    target: 100,
    check: (stats) => (stats.xp || 0) >= 100,
  },
  'xp-500': {
    id: 'xp-500',
    name: '500 XP',
    description: 'Accumulate 500 XP points',
    icon: '🔥',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 100,
    target: 500,
    check: (stats) => (stats.xp || 0) >= 500,
  },
  'xp-1000': {
    id: 'xp-1000',
    name: '1,000 XP',
    description: 'Accumulate 1,000 XP points',
    icon: '🌟',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 150,
    target: 1000,
    check: (stats) => (stats.xp || 0) >= 1000,
  },
  'xp-5000': {
    id: 'xp-5000',
    name: '5,000 XP',
    description: 'Accumulate 5,000 XP points',
    icon: '💫',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 500,
    target: 5000,
    check: (stats) => (stats.xp || 0) >= 5000,
  },
  'xp-10000': {
    id: 'xp-10000',
    name: '10,000 XP',
    description: 'Accumulate 10,000 XP points',
    icon: '☄️',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 10000,
    check: (stats) => (stats.xp || 0) >= 10000,
  },
  'xp-25000': {
    id: 'xp-25000',
    name: '25,000 XP',
    description: 'Accumulate 25,000 XP points',
    icon: '💎',
    category: 'xp',
    rarity: 'Standard',
    xpBonus: 2500,
    target: 25000,
    check: (stats) => (stats.xp || 0) >= 25000,
  },

  // --- Streak Achievements ---
  'streak-3': {
    id: 'streak-3',
    name: '3 Day Streak',
    description: 'Maintain a 3-day learning streak',
    icon: '🥉',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 50,
    target: 3,
    check: (stats) => (stats.streak || 0) >= 3,
  },
  'streak-7': {
    id: 'streak-7',
    name: '7 Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: '🥈',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 100,
    target: 7,
    check: (stats) => (stats.streak || 0) >= 7,
  },
  'streak-14': {
    id: 'streak-14',
    name: '14 Day Streak',
    description: 'Maintain a 14-day learning streak',
    icon: '🥇',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 150,
    target: 14,
    check: (stats) => (stats.streak || 0) >= 14,
  },
  'streak-30': {
    id: 'streak-30',
    name: '30 Day Streak',
    description: 'Maintain a 30-day learning streak',
    icon: '🔥',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 250,
    target: 30,
    check: (stats) => (stats.streak || 0) >= 30,
  },
  'streak-60': {
    id: 'streak-60',
    name: '60 Day Streak',
    description: 'Maintain a 60-day learning streak',
    icon: '🔮',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 500,
    target: 60,
    check: (stats) => (stats.streak || 0) >= 60,
  },
  'streak-100': {
    id: 'streak-100',
    name: '100 Day Streak',
    description: 'Maintain a 100-day learning streak',
    icon: '💯',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 100,
    check: (stats) => (stats.streak || 0) >= 100,
  },
  'streak-365': {
    id: 'streak-365',
    name: '365 Day Streak',
    description: 'Maintain a 365-day learning streak',
    icon: '⏳',
    category: 'streaks',
    rarity: 'Standard',
    xpBonus: 5000,
    target: 365,
    check: (stats) => (stats.streak || 0) >= 365,
  },

  // --- Track Completion ---
  'track-sql': {
    id: 'track-sql',
    name: 'SQL Explorer',
    description: 'Complete the structured SQL track',
    icon: '🗄️',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('sql'),
  },
  'track-python': {
    id: 'track-python',
    name: 'Python Explorer',
    description: 'Complete the structured Python track',
    icon: '🐍',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('python'),
  },
  'track-webdev': {
    id: 'track-webdev',
    name: 'Web Developer',
    description: 'Complete the structured Web Development track',
    icon: '🌐',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('webdev'),
  },
  'track-ai': {
    id: 'track-ai',
    name: 'AI Explorer',
    description: 'Complete the structured AI Fundamentals track',
    icon: '🤖',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('ai'),
  },
  'track-datascience': {
    id: 'track-datascience',
    name: 'Data Scientist',
    description: 'Complete the structured Data Science track',
    icon: '📊',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('datascience'),
  },
  'track-java': {
    id: 'track-java',
    name: 'Java Master',
    description: 'Complete the structured Java track',
    icon: '☕',
    category: 'tracks',
    rarity: 'Standard',
    xpBonus: 200,
    target: 1,
    check: (stats) => !!stats.completedTracksList?.includes('java'),
  },

  // --- Quiz Achievements ---
  'quiz-perfect': {
    id: 'quiz-perfect',
    name: 'Perfect Quiz',
    description: 'Score 5/5 on any lesson quiz',
    icon: '🎯',
    category: 'quizzes',
    rarity: 'Standard',
    xpBonus: 100,
    target: 1,
    check: (stats) => (stats.perfectQuizzesCount || 0) >= 1,
  },
  'quiz-perfect-10': {
    id: 'quiz-perfect-10',
    name: '10 Perfect Quizzes',
    description: 'Score 5/5 on 10 lesson quizzes',
    icon: '🏹',
    category: 'quizzes',
    rarity: 'Standard',
    xpBonus: 250,
    target: 10,
    check: (stats) => (stats.perfectQuizzesCount || 0) >= 10,
  },
  'quiz-perfect-50': {
    id: 'quiz-perfect-50',
    name: '50 Perfect Quizzes',
    description: 'Score 5/5 on 50 lesson quizzes',
    icon: '⚔️',
    category: 'quizzes',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 50,
    check: (stats) => (stats.perfectQuizzesCount || 0) >= 50,
  },
  'quiz-champion': {
    id: 'quiz-champion',
    name: 'Quiz Champion',
    description: 'Score 5/5 on 100 lesson quizzes',
    icon: '🏆',
    category: 'quizzes',
    rarity: 'Standard',
    xpBonus: 2500,
    target: 100,
    check: (stats) => (stats.perfectQuizzesCount || 0) >= 100,
  },

  // --- Practice Achievements ---
  'practice-1': {
    id: 'practice-1',
    name: 'First Practice',
    description: 'Complete your first practice session or challenge',
    icon: '🛠️',
    category: 'practice',
    rarity: 'Standard',
    xpBonus: 50,
    target: 1,
    check: (stats) => (stats.completedChallengesCount || 0) >= 1,
  },
  'practice-50': {
    id: 'practice-50',
    name: '50 Challenges Solved',
    description: 'Solve 50 coding or multiple-choice challenges',
    icon: '🔧',
    category: 'practice',
    rarity: 'Standard',
    xpBonus: 200,
    target: 50,
    check: (stats) => (stats.completedChallengesCount || 0) >= 50,
  },
  'practice-100': {
    id: 'practice-100',
    name: '100 Challenges Solved',
    description: 'Solve 100 coding or multiple-choice challenges',
    icon: '⚙️',
    category: 'practice',
    rarity: 'Standard',
    xpBonus: 50,
    target: 100,
    check: (stats) => (stats.completedChallengesCount || 0) >= 100,
  },
  'practice-500': {
    id: 'practice-500',
    name: '500 Challenges Solved',
    description: 'Solve 500 coding or multiple-choice challenges',
    icon: '🔨',
    category: 'practice',
    rarity: 'Standard',
    xpBonus: 2000,
    target: 500,
    check: (stats) => (stats.completedChallengesCount || 0) >= 500,
  },

  // --- AI Learning Achievements ---
  'ai-roadmap-1': {
    id: 'ai-roadmap-1',
    name: 'First AI Roadmap',
    description: 'Generate your first personalized learning roadmap',
    icon: '🚀',
    category: 'ai',
    rarity: 'Standard',
    xpBonus: 100,
    target: 1,
    check: (stats) => (stats.aiPathsGenerated || 0) >= 1,
  },
  'ai-roadmap-5': {
    id: 'ai-roadmap-5',
    name: '5 AI Paths Generated',
    description: 'Generate 5 personalized learning roadmaps',
    icon: '🛸',
    category: 'ai',
    rarity: 'Standard',
    xpBonus: 250,
    target: 5,
    check: (stats) => (stats.aiPathsGenerated || 0) >= 5,
  },
  'ai-roadmap-10': {
    id: 'ai-roadmap-10',
    name: '10 AI Paths Generated',
    description: 'Generate 10 personalized learning roadmaps',
    icon: '🛰️',
    category: 'ai',
    rarity: 'Standard',
    xpBonus: 500,
    target: 10,
    check: (stats) => (stats.aiPathsGenerated || 0) >= 10,
  },
  'ai-roadmap-architect': {
    id: 'ai-roadmap-architect',
    name: 'AI Learning Architect',
    description: 'Generate 20 personalized learning roadmaps',
    icon: '🌌',
    category: 'ai',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 20,
    check: (stats) => (stats.aiPathsGenerated || 0) >= 20,
  },

  // --- Project Achievements ---
  'project-1': {
    id: 'project-1',
    name: 'First Project',
    description: 'Submit your first capstone project',
    icon: '🧱',
    category: 'projects',
    rarity: 'Standard',
    xpBonus: 150,
    target: 1,
    check: (stats) => (stats.completedProjectsCount || 0) >= 1,
  },
  'project-5': {
    id: 'project-5',
    name: '5 Projects',
    description: 'Submit 5 capstone projects',
    icon: '🏗️',
    category: 'projects',
    rarity: 'Standard',
    xpBonus: 500,
    target: 5,
    check: (stats) => (stats.completedProjectsCount || 0) >= 5,
  },
  'project-10': {
    id: 'project-10',
    name: '10 Projects',
    description: 'Submit 10 capstone projects',
    icon: '🏢',
    category: 'projects',
    rarity: 'Standard',
    xpBonus: 1000,
    target: 10,
    check: (stats) => (stats.completedProjectsCount || 0) >= 10,
  },
  'project-portfolio': {
    id: 'project-portfolio',
    name: 'Portfolio Builder',
    description: 'Submit 15 capstone projects to build your portfolio',
    icon: '🏰',
    category: 'projects',
    rarity: 'Standard',
    xpBonus: 2500,
    target: 15,
    check: (stats) => (stats.completedProjectsCount || 0) >= 15,
  },

  // --- Special Rare Badges ---
  'rare-night-owl': {
    id: 'rare-night-owl',
    name: 'Night Owl',
    description: 'Complete a lesson or quiz between 12 AM and 4 AM',
    icon: '🦉',
    category: 'special',
    rarity: 'Rare',
    xpBonus: 150,
    target: 1,
    check: (stats) => !!stats.isNightLearning,
  },
  'rare-early-bird': {
    id: 'rare-early-bird',
    name: 'Early Bird',
    description: 'Complete a lesson or quiz between 5 AM and 8 AM',
    icon: '🐦',
    category: 'special',
    rarity: 'Rare',
    xpBonus: 150,
    target: 1,
    check: (stats) => !!stats.isEarlyLearning,
  },
  'rare-weekend-warrior': {
    id: 'rare-weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Complete a lesson or quiz on a Saturday or Sunday',
    icon: '🛡️',
    category: 'special',
    rarity: 'Rare',
    xpBonus: 150,
    target: 1,
    check: (stats) => !!stats.isWeekendLearning,
  },
  'rare-consistency-king': {
    id: 'rare-consistency-king',
    name: 'Consistency King',
    description: 'Maintain a learning streak of 30 days or more',
    icon: '👑',
    category: 'special',
    rarity: 'Rare',
    xpBonus: 500,
    target: 30,
    check: (stats) => (stats.streak || 0) >= 30 || (stats.longestStreak || 0) >= 30,
  },
  'rare-learning-machine': {
    id: 'rare-learning-machine',
    name: 'Learning Machine',
    description: 'Complete 100 lessons across all tracks',
    icon: '🦾',
    category: 'special',
    rarity: 'Legendary',
    xpBonus: 1000,
    target: 100,
    check: (stats) => (stats.completedLessonsCount || 0) >= 100,
  },
  'rare-master-learner': {
    id: 'rare-master-learner',
    name: 'Master Learner',
    description: 'Reach Level 10 or higher',
    icon: '🦚',
    category: 'special',
    rarity: 'Legendary',
    xpBonus: 1000,
    target: 10,
    check: (stats) => (stats.level || 1) >= 10,
  },
};

export const checkAchievements = (userData: UserDataStats): AchievementDef[] => {
  const newAchievements: AchievementDef[] = [];
  const existing = new Set(userData.achievements || []);

  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!existing.has(id) && achievement.check(userData)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

export const getAllAchievements = () => {
  return Object.values(ACHIEVEMENTS).map(({ check, ...rest }) => rest);
};

// Daily Missions Generation and Update
export const generateDailyMissions = (dateStr: string): DailyMissions => {
  return {
    date: dateStr,
    missions: [
      { id: 'lesson', text: 'Complete 1 Lesson', target: 1, current: 0, xp_reward: 25, completed: false },
      { id: 'xp', text: 'Earn 50 XP', target: 50, current: 0, xp_reward: 25, completed: false },
      { id: 'quiz', text: 'Pass 1 Quiz', target: 1, current: 0, xp_reward: 25, completed: false },
      { id: 'challenge', text: 'Complete 1 Challenge', target: 1, current: 0, xp_reward: 25, completed: false }
    ],
    bonusClaimed: false,
    stats: {
      perfectQuizzes: 0,
      challengesSolved: 0,
      projectsSubmitted: 0,
      aiRoadmaps: 0
    }
  };
};

export const updateDailyMissions = (missionsObj: DailyMissions | null, type: string, value: number): DailyMissions | null => {
  if (!missionsObj || !missionsObj.missions) return null;
  
  let updated = false;
  const newMissions = missionsObj.missions.map(mission => {
    if (mission.id === type && !mission.completed) {
      mission.current = Math.min(mission.current + value, mission.target);
      if (mission.current >= mission.target) {
        mission.completed = true;
      }
      updated = true;
    }
    return mission;
  });
  
  return {
    ...missionsObj,
    missions: newMissions
  };
};
