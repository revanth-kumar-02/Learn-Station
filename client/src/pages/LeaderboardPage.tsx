import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';

const CATEGORIES = [
  { key: 'globalXP', label: 'Global XP', icon: '⚡', valueKey: 'xp', suffix: ' XP' },
  { key: 'weeklyXP', label: 'This Week', icon: '📅', valueKey: 'xp', suffix: ' XP' },
  { key: 'monthlyXP', label: 'This Month', icon: '🗓️', valueKey: 'xp', suffix: ' XP' },
  { key: 'streaks', label: 'Streaks', icon: '🔥', valueKey: 'longest_streak', suffix: ' days' },
  { key: 'tracksCompleted', label: 'Tracks Done', icon: '🏆', valueKey: 'completedTracksCount', suffix: ' tracks' },
];


export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('globalXP');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const result = await userService.getLeaderboard();
        setData(result);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const currentCategory = CATEGORIES.find((c) => c.key === activeTab);
  const entries = data ? (data[activeTab] || []) : [];

  return (
    <PageTransition>
      <div className="leaderboard-page">
        <div className="container">
          {/* Header */}
          <motion.div
            className="leaderboard-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="leaderboard-header__icon">🏆</div>
            <h1 className="leaderboard-header__title">Leaderboard</h1>
            <p className="leaderboard-header__subtitle">
              Compete with learners worldwide. Climb the ranks by completing lessons, maintaining streaks, and earning XP.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            className="leaderboard-tabs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`leaderboard-tab ${activeTab === cat.key ? 'leaderboard-tab--active' : ''}`}
                onClick={() => setActiveTab(cat.key)}
                id={`leaderboard-tab-${cat.key}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Rankings */}
          <motion.div
            className="leaderboard-content"
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {loading ? (
              <Loader />
            ) : error ? (
              <div className="leaderboard-error">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="leaderboard-empty">
                <span className="leaderboard-empty__icon">{currentCategory?.icon}</span>
                <h3>No rankings yet</h3>
                <p>Be the first to earn {currentCategory?.label.toLowerCase()} rankings!</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {/* Top 3 Podium */}
                {entries.length >= 3 && (
                  <div className="leaderboard-podium">
                    {/* 2nd place */}
                    <motion.div
                      className="podium-slot podium-slot--2nd"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="podium-avatar">
                        {entries[1]?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="podium-medal">🥈</div>
                      <div className="podium-name">{entries[1]?.name || 'Anonymous'}</div>
                      <div className="podium-value">
                        {(entries[1]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                      </div>
                      <div className="podium-bar podium-bar--2nd" />
                    </motion.div>

                    {/* 1st place */}
                    <motion.div
                      className="podium-slot podium-slot--1st"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="podium-crown">👑</div>
                      <div className="podium-avatar podium-avatar--gold">
                        {entries[0]?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="podium-medal">🥇</div>
                      <div className="podium-name">{entries[0]?.name || 'Anonymous'}</div>
                      <div className="podium-value">
                        {(entries[0]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                      </div>
                      <div className="podium-bar podium-bar--1st" />
                    </motion.div>

                    {/* 3rd place */}
                    <motion.div
                      className="podium-slot podium-slot--3rd"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="podium-avatar">
                        {entries[2]?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="podium-medal">🥉</div>
                      <div className="podium-name">{entries[2]?.name || 'Anonymous'}</div>
                      <div className="podium-value">
                        {(entries[2]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                      </div>
                      <div className="podium-bar podium-bar--3rd" />
                    </motion.div>
                  </div>
                )}

                {/* Remaining entries */}
                <div className="leaderboard-rows">
                  {entries.slice(3).map((entry, idx) => {
                    const rank = idx + 4;
                    const isCurrentUser = entry.username === user?.username || entry.name === user?.name;
                    return (
                      <motion.div
                        key={`${entry.username || entry.name}-${idx}`}
                        className={`leaderboard-row ${isCurrentUser ? 'leaderboard-row--you' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <span className="leaderboard-row__rank">#{rank}</span>
                        <div className="leaderboard-row__avatar">
                          {entry.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="leaderboard-row__info">
                          <span className="leaderboard-row__name">
                            {entry.name || 'Anonymous'}
                            {isCurrentUser && <span className="leaderboard-row__you-tag">You</span>}
                          </span>
                          <span className="leaderboard-row__username">@{entry.username || 'unknown'}</span>
                        </div>
                        <div className="leaderboard-row__score">
                          <span className="leaderboard-row__value">
                            {(entry[currentCategory.valueKey] || 0).toLocaleString()}
                          </span>
                          <span className="leaderboard-row__suffix">{currentCategory.suffix.trim()}</span>
                        </div>
                        {entry.level && (
                          <div className="leaderboard-row__level">Lv.{entry.level}</div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
