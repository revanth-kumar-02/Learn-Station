import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

function MiniBarChart({ data, color }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.xp), 1);

  return (
    <div className="analytics-bar-chart">
      {data.map((day, i) => (
        <div key={day.date} className="analytics-bar-chart__col">
          <div
            className="analytics-bar-chart__bar"
            style={{
              height: `${Math.max((day.xp / maxVal) * 100, day.xp > 0 ? 4 : 0)}%`,
              background: day.xp > 0 ? color : 'rgba(255,255,255,0.06)',
            }}
            title={`${day.date}: ${day.xp} XP`}
          />
          {i % 7 === 0 && (
            <span className="analytics-bar-chart__label">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      className="analytics-stat-card"
      style={{ '--stat-color': color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="analytics-stat-card__icon">{icon}</div>
      <div className="analytics-stat-card__value">{value}</div>
      <div className="analytics-stat-card__label">{label}</div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const actData = await userService.getActivity();
        setActivity(actData.activity || []);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalXpLast30 = activity.reduce((sum, d) => sum + d.xp, 0);
  const activeDays = activity.filter((d) => d.xp > 0).length;
  const bestDay = activity.reduce((best, d) => (d.xp > best.xp ? d : best), { xp: 0, date: '' });
  const avgXpPerActiveDay = activeDays > 0 ? Math.round(totalXpLast30 / activeDays) : 0;

  // Weekly breakdown
  const weeklyData = [];
  for (let w = 0; w < 4; w++) {
    const week = activity.slice(w * 7, w * 7 + 7);
    const xp = week.reduce((s, d) => s + d.xp, 0);
    const startDate = week[0]?.date ? new Date(week[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    weeklyData.push({ label: `Week ${w + 1}`, startDate, xp });
  }

  const maxWeeklyXp = Math.max(...weeklyData.map((w) => w.xp), 1);

  return (
    <PageTransition>
      <div className="analytics-page">
        <div className="container">
          {/* Header */}
          <motion.div
            className="analytics-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="analytics-header__title">📊 Learning Analytics</h1>
            <p className="analytics-header__subtitle">
              Track your learning patterns, consistency, and XP growth over time.
            </p>
          </motion.div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="analytics-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="analytics-stats">
                <StatCard icon="⚡" label="XP (Last 30 Days)" value={totalXpLast30.toLocaleString()} color="#6366f1" delay={0} />
                <StatCard icon="📅" label="Active Days" value={`${activeDays}/30`} color="#10b981" delay={0.05} />
                <StatCard icon="🔥" label="Current Streak" value={`${user?.streak || 0} days`} color="#f59e0b" delay={0.1} />
                <StatCard icon="🏆" label="Best Day XP" value={`${bestDay.xp} XP`} color="#8b5cf6" delay={0.15} />
                <StatCard icon="📈" label="Avg XP / Active Day" value={avgXpPerActiveDay} color="#06b6d4" delay={0.2} />
                <StatCard icon="💎" label="Total XP" value={(user?.xp || 0).toLocaleString()} color="#ec4899" delay={0.25} />
              </div>

              {/* Daily XP Activity Chart */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="analytics-section__title">Daily XP Activity (Last 30 Days)</h2>
                <div className="analytics-chart-container">
                  <MiniBarChart data={activity} color="#6366f1" />
                </div>
                <div className="analytics-chart-legend">
                  <span className="analytics-chart-legend__dot" style={{ background: '#6366f1' }} />
                  <span>XP Earned</span>
                </div>
              </motion.section>

              {/* Weekly Breakdown */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="analytics-section__title">Weekly Breakdown</h2>
                <div className="analytics-weekly">
                  {weeklyData.map((week, i) => (
                    <div key={i} className="analytics-weekly__item">
                      <div className="analytics-weekly__bar-wrap">
                        <div
                          className="analytics-weekly__bar"
                          style={{
                            height: `${Math.max((week.xp / maxWeeklyXp) * 180, week.xp > 0 ? 8 : 0)}px`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                      <div className="analytics-weekly__label">{week.label}</div>
                      <div className="analytics-weekly__xp">{week.xp} XP</div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Heatmap Calendar */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="analytics-section__title">Activity Heatmap</h2>
                <div className="analytics-heatmap">
                  {activity.map((day) => {
                    const intensity = day.xp === 0 ? 0 : day.xp < 25 ? 1 : day.xp < 75 ? 2 : day.xp < 150 ? 3 : 4;
                    return (
                      <div
                        key={day.date}
                        className={`analytics-heatmap__cell analytics-heatmap__cell--${intensity}`}
                        title={`${day.date}: ${day.xp} XP`}
                      />
                    );
                  })}
                </div>
                <div className="analytics-heatmap-legend">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`analytics-heatmap__cell analytics-heatmap__cell--${level}`} />
                  ))}
                  <span>More</span>
                </div>
              </motion.section>

              {/* Level Progress */}
              {user && (
                <motion.section
                  className="analytics-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <h2 className="analytics-section__title">Level Progress</h2>
                  <div className="analytics-level-card">
                    <div className="analytics-level-badge">Lv.{user.level || 1}</div>
                    <div className="analytics-level-info">
                      <div className="analytics-level-info__header">
                        <span>Level {user.level || 1}</span>
                        <span>{(user.xp || 0).toLocaleString()} XP Total</span>
                      </div>
                      <div className="analytics-level-bar">
                        <div
                          className="analytics-level-bar__fill"
                          style={{ width: `${Math.min(((user.xp || 0) % 500) / 5, 100)}%` }}
                        />
                      </div>
                      <p className="analytics-level-info__next">
                        Keep earning XP to reach Level {(user.level || 1) + 1}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
