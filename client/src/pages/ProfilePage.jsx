import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ProgressBar from '../components/common/ProgressBar';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const maxXP = Math.max(...activity.map((d) => d.xp), 1);
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <PageTransition>
      <div className="profile-page">
        <div className="container container--narrow">
          {/* Profile Header */}
          <motion.div className="profile-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h1>{user?.name}</h1>
              <span className="profile-level">Level {stats.level || 1}</span>
              <div className="profile-level-bar">
                <ProgressBar value={levelInfo.progress * 100} max={100} color="var(--accent-violet)" size="md" />
                <span className="profile-level-text">{levelInfo.xpInLevel} / {levelInfo.xpNeeded} XP to next level</span>
              </div>
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

          {/* Activity Chart */}
          <motion.div className="profile-activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2>Activity (Last 14 Days)</h2>
            <div className="activity-chart">
              {activity.map((day, i) => (
                <div key={i} className="activity-bar-wrapper" title={`${day.date}: ${day.xp} XP`}>
                  <motion.div
                    className="activity-bar"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: day.xp > 0 ? day.xp / maxXP : 0.02 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      backgroundColor: day.xp > 0 ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                      transformOrigin: 'bottom',
                    }}
                  />
                  <span className="activity-label">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div className="profile-achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  className={`achievement-card ${a.earned ? 'achievement-card--earned' : 'achievement-card--locked'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                >
                  <span className="achievement-card__icon">{a.icon}</span>
                  <strong>{a.name}</strong>
                  <p>{a.description}</p>
                  {!a.earned && <div className="achievement-card__lock">🔒</div>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
