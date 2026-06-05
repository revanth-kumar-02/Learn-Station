/**
 * XP & Level Calculation Utilities
 */

// Level thresholds: Level N requires 100*N cumulative XP
// Level 1: 0, Level 2: 100, Level 3: 300, Level 4: 600, etc.
const calculateLevel = (totalXP) => {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + 100 * level <= totalXP) {
    xpNeeded += 100 * level;
    level++;
  }
  return level;
};

const xpForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 100 * i;
  }
  return total;
};

const xpForNextLevel = (level) => {
  return xpForLevel(level + 1);
};

const xpProgressInLevel = (totalXP) => {
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
const ACHIEVEMENTS = {
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌱',
    check: (user) => user.completedLessonsCount >= 1,
  },
  'on-fire': {
    id: 'on-fire',
    name: 'On Fire',
    description: '3-day learning streak',
    icon: '🔥',
    check: (user) => user.streak >= 3,
  },
  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7-day learning streak',
    icon: '⚡',
    check: (user) => user.streak >= 7,
  },
  'track-master': {
    id: 'track-master',
    name: 'Track Master',
    description: 'Complete an entire track',
    icon: '🏆',
    check: (user) => user.completedTracks >= 1,
  },
  'xp-hunter': {
    id: 'xp-hunter',
    name: 'XP Hunter',
    description: 'Earn 1,000 XP',
    icon: '💎',
    check: (user) => user.xp >= 1000,
  },
  'perfect-score': {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'All challenges correct in one lesson',
    icon: '⭐',
    check: (user) => user.perfectLessons >= 1,
  },
  'polyglot': {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Start 3 different tracks',
    icon: '🌍',
    check: (user) => user.tracksStarted >= 3,
  },
  'dedicated': {
    id: 'dedicated',
    name: 'Dedicated',
    description: '14-day learning streak',
    icon: '🎯',
    check: (user) => user.streak >= 14,
  },
  'scholar': {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 25 lessons',
    icon: '📚',
    check: (user) => user.completedLessonsCount >= 25,
  },
  'centurion': {
    id: 'centurion',
    name: 'Centurion',
    description: 'Earn 5,000 XP',
    icon: '👑',
    check: (user) => user.xp >= 5000,
  },
};

const checkAchievements = (userData) => {
  const newAchievements = [];
  const existing = new Set(userData.achievements || []);

  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!existing.has(id) && achievement.check(userData)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

const getAllAchievements = () => {
  return Object.values(ACHIEVEMENTS).map(({ check, ...rest }) => rest);
};

module.exports = {
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  xpProgressInLevel,
  checkAchievements,
  getAllAchievements,
  ACHIEVEMENTS,
};
