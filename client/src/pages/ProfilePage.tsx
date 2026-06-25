import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ProgressBar from '../components/common/ProgressBar';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import { Sun, Moon, Edit3, Camera, X, Save } from 'lucide-react';

// Helper to calculate progress for achievements
const getAchievementProgress = (id, stats) => {
  const lessons = stats.lessonsCompleted || 0;
  const xp = stats.totalXp || 0;
  const streak = stats.streak || 0;
  const longestStreak = stats.longestStreak || 0;
  const completedTracksList = stats.completedTracksList || [];
  const aiPathsGenerated = stats.aiPathsGenerated || 0;
  const perfectQuizzes = stats.perfectQuizzesCount || 0;
  const challenges = stats.completedChallengesCount || 0;
  const projects = stats.completedProjectsCount || 0;
  const level = stats.level || 1;

  switch (id) {
    // Milestones
    case 'lesson-1': return { current: lessons, target: 1 };
    case 'lesson-10': return { current: lessons, target: 10 };
    case 'lesson-25': return { current: lessons, target: 25 };
    case 'lesson-50': return { current: lessons, target: 50 };
    case 'lesson-100': return { current: lessons, target: 100 };
    case 'lesson-250': return { current: lessons, target: 250 };
    case 'lesson-500': return { current: lessons, target: 500 };
    
    // XP
    case 'xp-100': return { current: xp, target: 100 };
    case 'xp-500': return { current: xp, target: 500 };
    case 'xp-1000': return { current: xp, target: 1000 };
    case 'xp-5000': return { current: xp, target: 5000 };
    case 'xp-10000': return { current: xp, target: 10000 };
    case 'xp-25000': return { current: xp, target: 25000 };

    // Streaks
    case 'streak-3': return { current: streak, target: 3 };
    case 'streak-7': return { current: streak, target: 7 };
    case 'streak-14': return { current: streak, target: 14 };
    case 'streak-30': return { current: streak, target: 30 };
    case 'streak-60': return { current: streak, target: 60 };
    case 'streak-100': return { current: streak, target: 100 };
    case 'streak-365': return { current: streak, target: 365 };

    // Track completed
    case 'track-sql': return { current: completedTracksList.includes('sql') ? 1 : 0, target: 1 };
    case 'track-python': return { current: completedTracksList.includes('python') ? 1 : 0, target: 1 };
    case 'track-webdev': return { current: completedTracksList.includes('webdev') ? 1 : 0, target: 1 };
    case 'track-ai': return { current: completedTracksList.includes('ai') ? 1 : 0, target: 1 };
    case 'track-datascience': return { current: completedTracksList.includes('datascience') ? 1 : 0, target: 1 };
    case 'track-java': return { current: completedTracksList.includes('java') ? 1 : 0, target: 1 };

    // Quizzes
    case 'quiz-perfect': return { current: perfectQuizzes, target: 1 };
    case 'quiz-perfect-10': return { current: perfectQuizzes, target: 10 };
    case 'quiz-perfect-50': return { current: perfectQuizzes, target: 50 };
    case 'quiz-champion': return { current: perfectQuizzes, target: 100 };

    // Practice
    case 'practice-1': return { current: challenges, target: 1 };
    case 'practice-50': return { current: challenges, target: 50 };
    case 'practice-100': return { current: challenges, target: 100 };
    case 'practice-500': return { current: challenges, target: 500 };

    // AI
    case 'ai-roadmap-1': return { current: aiPathsGenerated, target: 1 };
    case 'ai-roadmap-5': return { current: aiPathsGenerated, target: 5 };
    case 'ai-roadmap-10': return { current: aiPathsGenerated, target: 10 };
    case 'ai-roadmap-architect': return { current: aiPathsGenerated, target: 20 };

    // Projects
    case 'project-1': return { current: projects, target: 1 };
    case 'project-5': return { current: projects, target: 5 };
    case 'project-10': return { current: projects, target: 10 };
    case 'project-portfolio': return { current: projects, target: 15 };

    // Special Rare Badges
    case 'rare-night-owl': return { current: stats.isNightLearning ? 1 : 0, target: 1 };
    case 'rare-early-bird': return { current: stats.isEarlyLearning ? 1 : 0, target: 1 };
    case 'rare-weekend-warrior': return { current: stats.isWeekendLearning ? 1 : 0, target: 1 };
    case 'rare-consistency-king': return { current: longestStreak, target: 30 };
    case 'rare-learning-machine': return { current: lessons, target: 100 };
    case 'rare-master-learner': return { current: level, target: 10 };

    default: return { current: 0, target: 1 };
  }
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', bio: '', avatarUrl: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Please select an image under 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = () => {
    setEditForm({
      name: profile?.user?.name || user?.name || '',
      username: profile?.user?.username || user?.username || '',
      bio: profile?.user?.bio || user?.bio || '',
      avatarUrl: profile?.user?.avatarUrl || user?.avatarUrl || '',
    });
    setErrorMessage('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMessage('');
    try {
      const updatedData = await userService.updateProfile(editForm);
      setProfile((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedData.user
        }
      }));
      updateUser(updatedData.user);
      setShowEditModal(false);
      setToast('🎉 Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Dark mode toggle states
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark-theme');
  });

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, achData, actData] = await Promise.all([
          userService.getProfile(),
          userService.getAchievements(),
          userService.getActivity(),
        ]);
        setProfile(profileData);
        setAchievements(achData.achievements || []);
        setActivity(actData.activity || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGoalChange = async (e) => {
    const newGoal = parseInt(e.target.value, 10);
    try {
      await userService.updateProfile({ dailyXpGoal: newGoal });
      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          dailyXpGoal: newGoal
        }
      }));
      updateUser({ dailyXpGoal: newGoal });
    } catch (err) {
      console.error('Failed to update daily goal:', err);
    }
  };

  if (loading) return <Loader fullPage />;

  const stats = profile?.stats || {};
  const levelInfo = profile?.levelInfo || { progress: 0, xpInLevel: 0, xpNeeded: 100 };
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // --- Process Activity Heatmap ---
  const columns = [];
  let currentWeek = [];

  // Align days of the week starting 364 days ago
  if (activity.length > 0) {
    const firstDate = new Date(activity[0].date + 'T00:00:00');
    const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Pad first week with empty cells for days preceding our activity window
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
  }

  activity.forEach((day) => {
    if (currentWeek.length === 7) {
      columns.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    columns.push(currentWeek);
  }

  // Find month labels and their week column indices
  const monthLabels = [];
  columns.forEach((week, weekIdx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date + 'T00:00:00');
      // If first day is in the first 7 days of the month, place a label
      if (date.getDate() <= 7) {
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== monthName) {
          monthLabels.push({ weekIdx, label: monthName });
        }
      }
    }
  });

  // Calculate Streak metrics from enriched activity
  const activeDaysCount = activity.filter(d => d.xp > 0).length;
  const totalStudyMinutes = activity.reduce((sum, d) => sum + (d.minutesLearned || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Group achievements by categories
  const achievementCategories = {
    milestones: 'Learning Milestones',
    xp: 'XP Achievements',
    streaks: 'Streak Achievements',
    tracks: 'Track Completion',
    quizzes: 'Quiz Achievements',
    practice: 'Practice Achievements',
    ai: 'AI Learning Achievements',
    projects: 'Project Achievements',
    special: 'Special Rare Badges',
  };

  const originalName = profile?.user?.name || user?.name || '';
  const originalUsername = profile?.user?.username || user?.username || '';
  const originalBio = profile?.user?.bio || user?.bio || '';
  const originalAvatarUrl = profile?.user?.avatarUrl || user?.avatarUrl || '';

  const isFormUnchanged =
    editForm.name === originalName &&
    editForm.username === originalUsername &&
    editForm.bio === originalBio &&
    editForm.avatarUrl === originalAvatarUrl;

  return (
    <PageTransition>
      <div className="profile-page">
        <div className="container container--narrow">
          {/* Profile Header */}
          <motion.div className="profile-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div 
              className="profile-avatar-container" 
              onClick={openEditModal}
              title="Click to edit profile picture"
            >
              {profile?.user?.avatarUrl || user?.avatarUrl ? (
                <img 
                  src={profile?.user?.avatarUrl || user?.avatarUrl} 
                  alt={profile?.user?.name || user?.name || 'User'} 
                  className="profile-avatar-img" 
                />
              ) : (
                <div className="profile-avatar-placeholder">{initials}</div>
              )}
              <div className="profile-avatar-overlay">
                <Camera size={20} />
              </div>
            </div>
            
            <div className="profile-info" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 0 }}>
                  {profile?.user?.name || user?.name}
                  {user?.role === 'owner' && (
                    <span className="owner-badge">
                      <span className="owner-badge__crown">👑</span>
                      <span className="owner-badge__text">★ OWNER</span>
                      <span className="owner-badge__shine" />
                    </span>
                  )}
                </h1>
                
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={openEditModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={12} />
                  Edit Profile
                </button>
              </div>

              <div className="profile-username" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-blue)', fontWeight: 500, marginTop: '2px' }}>
                @{profile?.user?.username || user?.username || 'learner'}
              </div>

              <p className="profile-bio" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '12px', fontStyle: profile?.user?.bio ? 'normal' : 'italic' }}>
                {profile?.user?.bio || "No bio added yet. Add a short bio to describe your learning journey!"}
              </p>

              <span className="profile-level">Level {stats.level || 1}</span>
              <div className="profile-level-bar">
                <ProgressBar value={levelInfo.progress * 100} max={100} color="var(--accent-violet)" size="md" />
                <span className="profile-level-text">{levelInfo.xpInLevel} / {levelInfo.xpNeeded} XP to next level</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                <div className="profile-goal-setter" style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Daily Goal:</span>
                  <select
                    value={profile?.user?.dailyXpGoal || 50}
                    onChange={handleGoalChange}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-xs)',
                      padding: '2px 8px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="20">20 XP (Casual)</option>
                    <option value="50">50 XP (Regular)</option>
                    <option value="100">100 XP (Serious)</option>
                    <option value="200">200 XP (Insane)</option>
                  </select>
                </div>

                <div className="profile-theme-toggle" style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    title="Switch Theme"
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: darkMode 
                        ? '0 0 10px rgba(99, 102, 241, 0.2)' 
                        : '0 0 10px rgba(245, 158, 11, 0.2)',
                      outline: 'none',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = darkMode ? '#6366F1' : '#F59E0B';
                      e.currentTarget.style.boxShadow = darkMode 
                        ? '0 0 14px rgba(99, 102, 241, 0.4)' 
                        : '0 0 14px rgba(245, 158, 11, 0.4)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = darkMode 
                        ? '0 0 10px rgba(99, 102, 241, 0.2)' 
                        : '0 0 10px rgba(245, 158, 11, 0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={darkMode ? 'dark' : 'light'}
                        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {darkMode ? (
                          <Moon size={16} color="#6366F1" style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))' }} />
                        ) : (
                          <Sun size={16} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' }} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div className="profile-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {[
              { label: 'Total XP', value: stats.totalXp || 0, icon: '✦', color: 'var(--accent-amber)' },
              { label: 'Level', value: stats.level || 1, icon: '⭐', color: 'var(--accent-violet)' },
              { label: 'Day Streak', value: stats.streak || 0, icon: '🔥', color: 'var(--accent-rose)' },
              { label: 'Lessons Done', value: stats.lessonsCompleted || 0, icon: '📚', color: 'var(--accent-blue)' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="profile-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <span className="profile-stat-card__icon">{stat.icon}</span>
                <span className="profile-stat-card__value" style={{ color: stat.color }}>
                  <AnimatedCounter value={stat.value} duration={1500} />
                </span>
                <span className="profile-stat-card__label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Heatmap Section */}
          <motion.div className="profile-activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2>Activity Heatmap</h2>

            {/* Streak & Study Summary Cards */}
            <div className="heatmap-summary-panel">
              <div className="heatmap-summary-card">
                <span className="heatmap-summary-card__icon">🔥</span>
                <div className="heatmap-summary-card__content">
                  <span className="heatmap-summary-card__value">{stats.streak || 0} Days</span>
                  <span className="heatmap-summary-card__label">Current Streak</span>
                </div>
              </div>
              <div className="heatmap-summary-card">
                <span className="heatmap-summary-card__icon">🏆</span>
                <div className="heatmap-summary-card__content">
                  <span className="heatmap-summary-card__value">{stats.longestStreak || 0} Days</span>
                  <span className="heatmap-summary-card__label">Longest Streak</span>
                </div>
              </div>
              <div className="heatmap-summary-card">
                <span className="heatmap-summary-card__icon">📅</span>
                <div className="heatmap-summary-card__content">
                  <span className="heatmap-summary-card__value">{activeDaysCount} Days</span>
                  <span className="heatmap-summary-card__label">Active Days</span>
                </div>
              </div>
              <div className="heatmap-summary-card">
                <span className="heatmap-summary-card__icon">⏱️</span>
                <div className="heatmap-summary-card__content">
                  <span className="heatmap-summary-card__value">{totalStudyHours} Hours</span>
                  <span className="heatmap-summary-card__label">Total Study Hours</span>
                </div>
              </div>
            </div>

            {/* GitHub-style Heatmap Grid */}
            <div className="heatmap-section-wrapper">
              <div className="heatmap-months-row">
                {monthLabels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="heatmap-month-label"
                    style={{
                      left: `${(lbl.weekIdx * 13) + 32}px`,
                    }}
                  >
                    {lbl.label}
                  </span>
                ))}
              </div>
              <div className="heatmap-grid-container">
                <div className="heatmap-day-labels">
                  <span style={{ height: '10px' }}></span>
                  <span style={{ height: '10px', lineHeight: '10px' }}>Mon</span>
                  <span style={{ height: '10px' }}></span>
                  <span style={{ height: '10px', lineHeight: '10px' }}>Wed</span>
                  <span style={{ height: '10px' }}></span>
                  <span style={{ height: '10px', lineHeight: '10px' }}>Fri</span>
                  <span style={{ height: '10px' }}></span>
                </div>
                <div className="heatmap-weeks-columns">
                  {columns.map((week, wIdx) => (
                    <div key={wIdx} className="heatmap-week-column">
                      {week.map((day, dIdx) => {
                        if (day === null) {
                          return <div key={dIdx} className="heatmap-cell heatmap-cell--empty" />;
                        }
                        
                        let level = 0;
                        if (day.xp > 0 && day.xp < 30) level = 1;
                        else if (day.xp >= 30 && day.xp < 60) level = 2;
                        else if (day.xp >= 60 && day.xp < 120) level = 3;
                        else if (day.xp >= 120) level = 4;

                        return (
                          <div
                            key={dIdx}
                            className={`heatmap-cell heatmap-cell--level-${level}`}
                            onMouseEnter={(e) => {
                              const cellRect = e.currentTarget.getBoundingClientRect();
                              const parentRect = e.currentTarget.closest('.heatmap-section-wrapper').getBoundingClientRect();
                              setHoveredCell({
                                data: day,
                                x: cellRect.left - parentRect.left + cellRect.width / 2,
                                y: cellRect.top - parentRect.top - 6,
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="heatmap-footer">
                <div className="heatmap-legend">
                  <span>Less</span>
                  <div className="heatmap-cell heatmap-cell--level-0" />
                  <div className="heatmap-cell heatmap-cell--level-1" />
                  <div className="heatmap-cell heatmap-cell--level-2" />
                  <div className="heatmap-cell heatmap-cell--level-3" />
                  <div className="heatmap-cell heatmap-cell--level-4" />
                  <span>More</span>
                </div>
              </div>

              {/* Floating Tooltip inside parent coordinate space */}
              {hoveredCell && (
                <div
                  className="heatmap-tooltip"
                  style={{
                    position: 'absolute',
                    left: hoveredCell.x,
                    top: hoveredCell.y,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="tooltip-date">
                    {new Date(hoveredCell.data.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="tooltip-xp">+{hoveredCell.data.xp} XP</div>
                  <div className="tooltip-detail">{hoveredCell.data.lessonsCompleted} {hoveredCell.data.lessonsCompleted === 1 ? 'Lesson' : 'Lessons'} Completed</div>
                  <div className="tooltip-detail">{hoveredCell.data.minutesLearned} Minutes Learning</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div className="profile-achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2>Achievements & Badges</h2>
            
            {Object.entries(achievementCategories).map(([catKey, catName]) => {
              const catAchievements = achievements.filter(a => a.category === catKey);
              if (catAchievements.length === 0) return null;

              return (
                <div key={catKey} className="achievement-category-section">
                  <h3 className="achievement-category-title">{catName}</h3>
                  <div className="achievements-grid">
                    {catAchievements.map((a) => {
                      const progress = getAchievementProgress(a.id, stats);
                      const isUnlocked = a.earned || profile?.user?.achievements?.includes(a.id);
                      const isInProgress = !isUnlocked && progress.current > 0;
                      const isLocked = !isUnlocked && progress.current === 0;

                      let cardStateClass = 'achievement-card--locked';
                      if (isUnlocked) cardStateClass = 'achievement-card--unlocked';
                      else if (isInProgress) cardStateClass = 'achievement-card--in-progress';

                      let rarityClass = 'rarity-standard';
                      if (a.rarity === 'Rare') rarityClass = 'rarity-rare';
                      else if (a.rarity === 'Legendary') rarityClass = 'rarity-legendary';

                      return (
                        <motion.div
                          key={a.id}
                          className={`achievement-card ${cardStateClass} ${rarityClass}`}
                          whileHover={{ y: -4, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="achievement-card__rarity-tag">{a.rarity}</div>
                          <span className="achievement-card__icon">{a.icon}</span>
                          <strong>{a.name}</strong>
                          <p>{a.description}</p>
                          
                          <div className="achievement-card__progress">
                            <div className="achievement-card__progress-label">
                              {isUnlocked ? 'Unlocked' : `${Math.min(progress.current, progress.target)} / ${progress.target}`}
                            </div>
                            <div className="achievement-card__progress-bar-container">
                              <div
                                className="achievement-card__progress-bar"
                                style={{ width: `${isUnlocked ? 100 : Math.min(100, (progress.current / progress.target) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {isLocked && <div className="achievement-card__lock">🔒</div>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="profile-edit-modal-backdrop" onClick={() => setShowEditModal(false)}>
            <motion.div
              className="profile-edit-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <form onSubmit={handleSaveProfile} className="profile-edit-modal-form">
                <div className="profile-edit-modal__header">
                  <span className="profile-edit-modal__title">Edit Learning Profile</span>
                  <button type="button" className="profile-edit-modal__close" onClick={() => setShowEditModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="profile-edit-modal__body">
                  {errorMessage && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      marginBottom: '16px'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Alex Mercer"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label>Username</label>
                    <input
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="e.g. alex_mercer"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label>Bio</label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Describe your learning goals, interests, or career path..."
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label>Profile Picture</label>
                    <div className="profile-edit-image-card">
                      <div className="profile-edit-avatar-preview">
                        <img 
                          src={editForm.avatarUrl || 'https://via.placeholder.com/64'} 
                          alt="Avatar Preview" 
                        />
                      </div>
                      <div className="profile-edit-image-actions">
                        <button
                          type="button"
                          className="btn btn--upload"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          📁 Upload from Device
                        </button>
                        {editForm.avatarUrl && (
                          <button
                            type="button"
                            className="btn btn--remove"
                            onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label>Or Paste Image URL</label>
                    <input
                      type="url"
                      value={editForm.avatarUrl.startsWith('data:') ? '' : editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>

                <div className="profile-edit-modal__footer">
                  <button
                    type="button"
                    className="btn btn--secondary btn--md"
                    onClick={() => setShowEditModal(false)}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary btn--md"
                    disabled={saveLoading || isFormUnchanged}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {saveLoading ? (
                      <>
                        <span className="btn__spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}
