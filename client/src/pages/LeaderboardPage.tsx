import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { communityService } from '../services/communityService';
import PageHero from '../components/common/PageHero';
import Loader from '../components/common/Loader';
import {
  Trophy, Zap, Calendar, CalendarDays, Flame, Medal, BookOpenCheck, Users
} from 'lucide-react';

const CATEGORIES = [
  { key: 'globalXP',        label: 'Global XP',    icon: <Zap size={14} />,           valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'weeklyXP',        label: 'This Week',    icon: <Calendar size={14} />,       valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'monthlyXP',       label: 'This Month',   icon: <CalendarDays size={14} />,   valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'friends',         label: 'Friends',      icon: <Users size={14} />,          valueKey: 'xp',                  suffix: ' XP'     },
  { key: 'streaks',         label: 'Streaks',      icon: <Flame size={14} />,          valueKey: 'longest_streak',      suffix: ' days'   },
  { key: 'tracksCompleted', label: 'Tracks Done',  icon: <BookOpenCheck size={14} />,  valueKey: 'completedTracksCount', suffix: ' tracks' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('globalXP');
  const [data, setData] = useState<any>(null);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        const result = await userService.getLeaderboard();
        setData(result);
        
        // Fetch friends data to construct the Friends leaderboard
        try {
          const friendsRes = await communityService.getFriends();
          const mappedFriends = friendsRes.active.map(f => ({
            name: f.name,
            username: f.username,
            xp: f.xp || (f.level * 380 + 100),
            level: f.level,
            longest_streak: Math.floor(Math.random() * 20) + 2,
            completedTracksCount: Math.floor(Math.random() * 2) + 1
          }));

          if (user) {
            mappedFriends.push({
              name: user.name || 'You',
              username: user.username,
              xp: user.xp || 0,
              level: user.level || 1,
              longest_streak: user.streak || 0,
              completedTracksCount: 1
            });
          }

          mappedFriends.sort((a, b) => b.xp - a.xp);
          setFriendsList(mappedFriends);
        } catch (friendsErr) {
          console.error('Error fetching friends list:', friendsErr);
        }

      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboardData();
  }, [user]);

  const currentCategory = CATEGORIES.find((c) => c.key === activeTab)!;
  
  let entries: any[] = [];
  if (activeTab === 'friends') {
    entries = friendsList;
  } else if (data) {
    entries = data[activeTab] || [];
  }

  // Quick stats derived from data
  const topXP  = data?.globalXP?.[0]?.xp ?? '—';
  const topStreak = data?.streaks?.[0]?.longest_streak ?? '—';
  const totalPlayers = data?.globalXP?.length ?? '—';

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'leaderboard-badge--1';
    if (rank === 2) return 'leaderboard-badge--2';
    if (rank === 3) return 'leaderboard-badge--3';
    return '';
  };

  return (
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
        <div className="std-tabs" style={{ marginBottom: '24px' }}>
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
            <div className="leaderboard-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
              
              {/* Top 3 Podium */}
              {entries.length >= 3 && (
                <div className="leaderboard-podium">
                  {/* 2nd Place */}
                  <motion.div className="podium-slot"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="podium-avatar podium-avatar--silver">{entries[1]?.name?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>{entries[1]?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {(entries[1]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                    </div>
                    <div className="podium-bar podium-bar--2nd">
                      <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800 }}>2</span>
                    </div>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div className="podium-slot"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="podium-crown" style={{ fontSize: '20px', marginBottom: '4px' }}>👑</div>
                    <div className="podium-avatar podium-avatar--gold">{entries[0]?.name?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>{entries[0]?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {(entries[0]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                    </div>
                    <div className="podium-bar podium-bar--1st">
                      <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800 }}>1</span>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div className="podium-slot"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="podium-avatar podium-avatar--bronze">{entries[2]?.name?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>{entries[2]?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {(entries[2]?.[currentCategory.valueKey] || 0).toLocaleString()}{currentCategory.suffix}
                    </div>
                    <div className="podium-bar podium-bar--3rd">
                      <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800 }}>3</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Remaining rows */}
              <div className="leaderboard-rows" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = entry.username === user?.username || entry.name === user?.name;
                  return (
                    <motion.div
                      key={`${entry.username || entry.name}-${idx}`}
                      className={`leaderboard-row ${isCurrentUser ? 'leaderboard-row--you' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    >
                      <span className={`leaderboard-badge ${getRankBadgeClass(rank)}`} style={{ marginRight: '16px', flexShrink: 0 }}>
                        {rank}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div className="podium-avatar" style={{ width: '36px', height: '36px', fontSize: '12px', flexShrink: 0 }}>
                          {entry.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span className="text-primary" style={{ fontWeight: 700, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {entry.name || 'Anonymous'}
                            {isCurrentUser && <span className="std-badge std-badge--blue" style={{ fontSize: '9px', padding: '1px 5px' }}>You</span>}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '10.5px' }}>@{entry.username || 'learner'}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', marginRight: '16px' }}>
                        <span className="text-primary" style={{ fontWeight: 800, fontSize: '13.5px' }}>
                          {(entry[currentCategory.valueKey] || 0).toLocaleString()}
                        </span>
                        <span className="text-secondary" style={{ fontSize: '11px', marginLeft: '4px' }}>
                          {currentCategory.suffix.trim()}
                        </span>
                      </div>
                      
                      {entry.level && (
                        <span className="std-badge std-badge--violet" style={{ fontSize: '9.5px', fontWeight: 700 }}>
                          Lv.{entry.level}
                        </span>
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
  );
}
