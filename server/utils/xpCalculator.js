/**
 * XP & Level Calculation Utilities
 * Phase 2 — Learn Station Evolution
 */

// Level thresholds: Level N requires increasing XP cumulative steps
// Level 1: 0 XP
// Level 2: 250 XP
// Level 3: 750 XP (requires +500 XP)
// Level 4: 1750 XP (requires +1000 XP)
// Level 5: 3250 XP (requires +1500 XP)
// Level 6: 5250 XP (requires +2000 XP)
const xpForLevel = (level) => {
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

const calculateLevel = (totalXP) => {
  let level = 1;
  while (totalXP >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
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
  'first-lesson': {
    id: 'first-lesson',
    name: 'First Lesson Completed',
    description: 'Complete your first lesson in Learn Station',
    icon: '📚',
    xpBonus: 50,
    check: (stats) => stats.lessonsCompleted >= 1,
  },
  'streak-3': {
    id: 'streak-3',
    name: '3 Day Streak',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    xpBonus: 100,
    check: (stats) => stats.streak >= 3,
  },
  'xp-100': {
    id: 'xp-100',
    name: 'First 100 XP',
    description: 'Earn your first 100 XP points',
    icon: '⚡',
    xpBonus: 50,
    check: (stats) => stats.xp >= 100,
  },
  'track-sql': {
    id: 'track-sql',
    name: 'SQL Explorer',
    description: 'Complete the structured SQL track',
    icon: '🗄️',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('sql'),
  },
  'track-python': {
    id: 'track-python',
    name: 'Python Explorer',
    description: 'Complete the structured Python track',
    icon: '🐍',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('python'),
  },
  'track-webdev': {
    id: 'track-webdev',
    name: 'Web Developer',
    description: 'Complete the structured Web Development track',
    icon: '🌐',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('webdev'),
  },
  'track-ai': {
    id: 'track-ai',
    name: 'AI Explorer',
    description: 'Complete the structured AI Fundamentals track',
    icon: '🤖',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('ai'),
  },
  'track-datascience': {
    id: 'track-datascience',
    name: 'Data Scientist',
    description: 'Complete the structured Data Science track',
    icon: '📊',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('datascience'),
  },
  'track-java': {
    id: 'track-java',
    name: 'Java Apprentice',
    description: 'Complete the structured Java track',
    icon: '☕',
    xpBonus: 200,
    check: (stats) => stats.completedTracksList?.includes('java'),
  },
  'track-completed': {
    id: 'track-completed',
    name: 'Track Completed',
    description: 'Successfully complete any learning track',
    icon: '🏆',
    xpBonus: 300,
    check: (stats) => stats.tracksCompleted >= 1,
  },
  'ai-pathfinder': {
    id: 'ai-pathfinder',
    name: 'First AI Generated Path',
    description: 'Generate your first personalized learning roadmap',
    icon: '🚀',
    xpBonus: 100,
    check: (stats) => stats.aiPathsGenerated >= 1,
  },
  'perfect-quiz': {
    id: 'perfect-quiz',
    name: 'Perfect Quiz Score',
    description: 'Score 5/5 on any lesson quiz',
    icon: '🎯',
    xpBonus: 100,
    check: (stats) => stats.perfectQuizzes >= 1,
  }
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

// Daily Missions Generation and Update
const generateDailyMissions = (dateStr) => {
  return {
    date: dateStr,
    missions: [
      { id: 'lesson', text: 'Complete 1 Lesson', target: 1, current: 0, xp_reward: 25, completed: false },
      { id: 'xp', text: 'Earn 50 XP', target: 50, current: 0, xp_reward: 25, completed: false },
      { id: 'quiz', text: 'Pass 1 Quiz', target: 1, current: 0, xp_reward: 25, completed: false },
      { id: 'challenge', text: 'Complete 1 Challenge', target: 1, current: 0, xp_reward: 25, completed: false }
    ],
    bonusClaimed: false
  };
};

const updateDailyMissions = (missionsObj, type, value) => {
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

module.exports = {
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  xpProgressInLevel,
  checkAchievements,
  getAllAchievements,
  ACHIEVEMENTS,
  generateDailyMissions,
  updateDailyMissions
};
