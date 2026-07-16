import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import PageHero from '../components/common/PageHero';
import Loader from '../components/common/Loader';
import {
  Trophy, Zap, Calendar, CalendarDays, Flame, Medal, BookOpenCheck
} from 'lucide-react';

const CATEGORIES = [
  { key: 'globalXP',        label: 'Global XP',    icon: <Zap size={15} />,           valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'weeklyXP',        label: 'This Week',    icon: <Calendar size={15} />,       valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'monthlyXP',       label: 'This Month',   icon: <CalendarDays size={15} />,   valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'streaks',         label: 'Streaks',      icon: <Flame size={15} />,          valueKey: 'longest_streak',      suffix: ' days'   },
  { key: 'tracksCompleted', label: 'Tracks Done',  icon: <BookOpenCheck size={15} />,  valueKey: 'completedTracksCount', suffix: ' tracks' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('globalXP');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const currentCategory = CATEGORIES.find((c) => c.key === activeTab)!;
  const entries: any[] = data ? (data[activeTab] || []) : [];

  // Quick stats derived from data
  const topXP  = data?.globalXP?.[0]?.xp ?? '—';
  const topStreak = data?.streaks?.[0]?.longest_streak ?? '—';
  const totalPlayers = data?.globalXP?.length ?? '—';

  return (
    <PageTransition>
      <div className="page-std">
        <div className="container">
          {/* ── Hero ── */}
          <PageHero
            icon={<Trophy size={22} />}
            color="amber"
            eyebrow="Rankings"
            title="Leaderboard"
            description="Compete with learners worldwide. Climb the ranks by completing lessons, maintaining streaks, and earning XP."
            stats={[
              { label: 'Top XP',     value: typeof topXP === 'number' ? topXP.toLocaleString() : topXP },
              { label: 'Top Streak', value: topStreak !== '—' ? `${topStreak}d` : '—' },
              { label: 'Players',    value: totalPlayers },
            ]}
          />

          {/* ── Category Tabs ── */}
          <div className="std-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                id={`leaderboard-tab-${cat.key}`}
                className={`std-tab ${activeTab === cat.key ? 'std-tab--active' : ''}`}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Rankings Panel ── */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <Loader />
            ) : error ? (
              <div className="std-empty">
                <div className="std-empty__icon"><Medal size={24} /></div>
                <p className="std-empty__title">Failed to load rankings</p>
                <p className="std-empty__desc">{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="std-empty">
                <div className="std-empty__icon">{currentCategory.icon}</div>
                <p className="std-empty__title">No rankings yet</p>
                <p className="std-empty__desc">Be the first to earn {currentCategory.label.toLowerCase()} rankings!</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {/* Top 3 Podium */}
                {entries.length >= 3 && (
                  <div className="leaderboard-podium">
                    {/* 2nd */}
                    <motion.div className="podium-slot podium-slot--2nd"
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="podium-avatar">{entries[1]?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="podium-medal">🥈</div>
                      <div className="podium-name">{entries[1]?.name || 'Anonymous'}</div>
                      <div className="podium-value">{(entries[1]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}</div>
                      <div className="podium-bar podium-bar--2nd" />
                    </motion.div>

                    {/* 1st */}
                    <motion.div className="podium-slot podium-slot--1st"
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <div className="podium-crown">👑</div>
                      <div className="podium-avatar podium-avatar--gold">{entries[0]?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="podium-medal">🥇</div>
                      <div className="podium-name">{entries[0]?.name || 'Anonymous'}</div>
                      <div className="podium-value">{(entries[0]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}</div>
                      <div className="podium-bar podium-bar--1st" />
                    </motion.div>

                    {/* 3rd */}
                    <motion.div className="podium-slot podium-slot--3rd"
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                      <div className="podium-avatar">{entries[2]?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="podium-medal">🥉</div>
                      <div className="podium-name">{entries[2]?.name || 'Anonymous'}</div>
                      <div className="podium-value">{(entries[2]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}</div>
                      <div className="podium-bar podium-bar--3rd" />
                    </motion.div>
                  </div>
                )}

                {/* Remaining rows */}
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
                        <div className="leaderboard-row__avatar">{entry.name?.[0]?.toUpperCase() || '?'}</div>
                        <div className="leaderboard-row__info">
                          <span className="leaderboard-row__name">
                            {entry.name || 'Anonymous'}
                            {isCurrentUser && <span className="leaderboard-row__you-tag">You</span>}
                          </span>
                          <span className="leaderboard-row__username">@{entry.username || 'unknown'}</span>
                        </div>
                        <div className="leaderboard-row__score">
                          <span className="leaderboard-row__value">{(entry[currentCategory.valueKey] || 0).toLocaleString()}</span>
                          <span className="leaderboard-row__suffix">{currentCategory.suffix.trim()}</span>
                        </div>
                        {entry.level && <div className="leaderboard-row__level">Lv.{entry.level}</div>}
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
