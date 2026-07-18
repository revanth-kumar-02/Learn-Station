import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { communityService, UserProfile } from '../services/communityService';
import Loader from '../components/common/Loader';
import {
  Trophy, Zap, Calendar, CalendarDays, Flame, Medal, BookOpenCheck, Users,
  Search, ArrowUpRight, ChevronRight, Home, ChevronDown, Sparkles, MapPin, Activity
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

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'xp' | 'level' | 'streak' | 'lessons' | 'tracks'>('rank');

  const currentUserRowRef = useRef<HTMLDivElement>(null);

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
        setError('Failed to load leaderboard. Make sure the database is connected.');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboardData();
  }, [user]);

  const currentCategory = CATEGORIES.find((c) => c.key === activeTab)!;
  
  let rawEntries: any[] = [];
  if (activeTab === 'friends') {
    rawEntries = friendsList;
  } else if (data) {
    rawEntries = data[activeTab] || [];
  }

  // Populate rawEntries with consistent mock metrics so they align with full dashboard view
  const entriesWithMetrics = rawEntries.map((entry, index) => {
    const defaultXp = entry.xp || 0;
    const computedStreak = entry.streak || entry.longest_streak || Math.floor((defaultXp || 300) / 250) + 1;
    const computedLessons = entry.completedLessonsCount || Math.floor((defaultXp || 400) / 80) + 4;
    const computedTracks = entry.completedTracksCount || (defaultXp > 3000 ? 3 : defaultXp > 1200 ? 2 : defaultXp > 500 ? 1 : 0);
    const learningTrack = defaultXp % 3 === 0 ? 'Python Basics' : defaultXp % 3 === 1 ? 'SQL Querying' : 'Web Dev Layouts';
    const countries = ['USA', 'IND', 'DEU', 'GBR', 'CAN', 'FRA', 'AUS'];
    const country = countries[Math.floor((defaultXp || 1) % countries.length)];
    const isOnline = (defaultXp % 5 === 0 || entry.username === user?.username);

    return {
      ...entry,
      rank: index + 1,
      computedStreak,
      computedLessons,
      computedTracks,
      learningTrack,
      country,
      isOnline
    };
  });

  // Apply search query filter
  const filteredEntries = entriesWithMetrics.filter(entry => {
    const matchQuery = searchQuery.trim().toLowerCase();
    if (!matchQuery) return true;
    return (
      (entry.name || '').toLowerCase().includes(matchQuery) ||
      (entry.username || '').toLowerCase().includes(matchQuery)
    );
  });

  // Apply secondary sort selection
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
    if (sortBy === 'level') return (b.level || 1) - (a.level || 1);
    if (sortBy === 'streak') return b.computedStreak - a.computedStreak;
    if (sortBy === 'lessons') return b.computedLessons - a.computedLessons;
    if (sortBy === 'tracks') return b.computedTracks - a.computedTracks;
    return 0;
  });

  // Statistics summaries
  const topXP = data?.globalXP?.[0]?.xp ?? 0;
  const bestStreak = data?.streaks?.[0]?.longest_streak ?? 0;
  const totalPlayers = data?.globalXP?.length ?? 0;
  const tracksDone = data?.tracksCompleted?.reduce((acc: number, item: any) => acc + (item.completedTracksCount || 0), 0) ?? 0;

  // Find current user's rank
  const currentUserRank = entriesWithMetrics.find(entry => entry.username === user?.username)?.rank || null;

  const scrollToUserRow = () => {
    currentUserRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'ld-card-rank-badge--1';
    if (rank === 2) return 'ld-card-rank-badge--2';
    if (rank === 3) return 'ld-card-rank-badge--3';
    return 'ld-card-rank-badge--other';
  };

  return (
    <div className="page-std animate-fade-in" style={{ paddingBottom: currentUserRank ? '100px' : '40px' }}>
      
      {/* ── BREADCRUMBS ── */}
      <nav className="ld-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="ld-breadcrumb-item">
          <Home size={13} />
          <span>Home</span>
        </Link>
        <span className="ld-breadcrumb-sep">
          <ChevronRight size={10} />
        </span>
        <span className="ld-breadcrumb-item">Community</span>
        <span className="ld-breadcrumb-sep">
          <ChevronRight size={10} />
        </span>
        <span className="ld-breadcrumb-item ld-breadcrumb-item--current">Leaderboard</span>
      </nav>

      {/* ── HERO SECTION ── */}
      <div className="ld-header">
        <h1 className="ld-title">
          <Trophy className="text-accent-amber" size={32} />
          Leaderboard
        </h1>
        <p className="ld-description">
          Compete with learners worldwide. Climb the rankings by completing lessons, maintaining streaks, earning XP, and completing tracks.
        </p>
      </div>

      <div className="container">
        
        {/* ── STATISTICS CARDS ── */}
        <div className="ld-stats-grid">
          <div className="ld-stat-card">
            <div className="ld-stat-icon ld-stat-icon--amber">
              <Zap size={20} />
            </div>
            <div className="ld-stat-content">
              <span className="ld-stat-value">{topXP.toLocaleString()}</span>
              <span className="ld-stat-label">Top XP</span>
            </div>
          </div>

          <div className="ld-stat-card">
            <div className="ld-stat-icon ld-stat-icon--rose">
              <Flame size={20} />
            </div>
            <div className="ld-stat-content">
              <span className="ld-stat-value">{bestStreak} Days</span>
              <span className="ld-stat-label">Best Streak</span>
            </div>
          </div>

          <div className="ld-stat-card">
            <div className="ld-stat-icon ld-stat-icon--blue">
              <Users size={20} />
            </div>
            <div className="ld-stat-content">
              <span className="ld-stat-value">{totalPlayers}</span>
              <span className="ld-stat-label">Active Players</span>
            </div>
          </div>

          <div className="ld-stat-card">
            <div className="ld-stat-icon ld-stat-icon--green">
              <BookOpenCheck size={20} />
            </div>
            <div className="ld-stat-content">
              <span className="ld-stat-value">{tracksDone}</span>
              <span className="ld-stat-label">Tracks Completed</span>
            </div>
          </div>
        </div>

        {/* ── STICKY FILTER & SEARCH TOOLBAR ── */}
        <div className="ld-filter-bar">
          <div className="ld-pill-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveTab(cat.key); setSearchQuery(''); }}
                className={`ld-pill-tab ${activeTab === cat.key ? 'ld-pill-tab--active' : ''}`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="ld-toolbar">
            <div style={{ position: 'relative' }}>
              <Search size={14} className="text-secondary" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search learner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ld-search-input"
                style={{ paddingLeft: '34px' }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="ld-sort-select"
            >
              <option value="rank">Sort: Rank</option>
              <option value="xp">Sort: XP</option>
              <option value="level">Sort: Level</option>
              <option value="streak">Sort: Streak</option>
              <option value="lessons">Sort: Lessons</option>
              <option value="tracks">Sort: Tracks</option>
            </select>
          </div>
        </div>

        {/* ── RENDERING PODIUM & RANK LISTS ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <Loader />
          </div>
        ) : error ? (
          <div className="std-empty">
            <div className="std-empty__icon"><Trophy size={32} /></div>
            <p className="std-empty__title">Error loading rankings</p>
            <p className="std-empty__desc">{error}</p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="std-empty" style={{ padding: '60px 20px' }}>
            <svg className="empty-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" style={{ width: '64px', height: '64px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p className="std-empty__title">No players found</p>
            <p className="std-empty__desc">Try checking another tab or refining your query.</p>
            <button onClick={() => { setSearchQuery(''); setSortBy('rank'); }} className="btn btn--primary btn--sm" style={{ marginTop: '16px' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            
            {/* ── TOP 3 PODIUM SECTION ── */}
            {sortedEntries.length >= 3 && !searchQuery && sortBy === 'rank' && (
              <div className="ld-podium-container">
                
                {/* 2nd Place */}
                <motion.div 
                  className="ld-podium-card ld-podium-card--2nd"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="ld-podium-rank ld-podium-rank--2">2</div>
                  <div style={{ position: 'relative' }}>
                    <div className="ld-podium-avatar ld-podium-avatar--2" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                      {sortedEntries[1].name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {sortedEntries[1].isOnline && <span className="online-indicator" style={{ position: 'absolute', bottom: '12px', right: '4px', border: '3px solid var(--bg-primary)' }} />}
                  </div>
                  <span className="text-primary" style={{ fontWeight: 700, fontSize: '14.5px' }}>{sortedEntries[1].name}</span>
                  <span className="text-secondary" style={{ fontSize: '11px', marginBottom: '8px' }}>@{sortedEntries[1].username}</span>
                  <span className="std-badge std-badge--violet" style={{ fontSize: '9px', padding: '1px 5px', marginBottom: '8px' }}>Lv.{sortedEntries[1].level}</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(sortedEntries[1].xp || 0).toLocaleString()} XP
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div 
                  className="ld-podium-card ld-podium-card--1st"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <div className="podium-crown" style={{ fontSize: '24px', position: 'absolute', top: '-24px' }}>👑</div>
                  <div className="ld-podium-rank ld-podium-rank--1">1</div>
                  <div style={{ position: 'relative' }}>
                    <div className="ld-podium-avatar ld-podium-avatar--1" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
                      {sortedEntries[0].name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {sortedEntries[0].isOnline && <span className="online-indicator" style={{ position: 'absolute', bottom: '12px', right: '4px', border: '3px solid var(--bg-primary)' }} />}
                  </div>
                  <span className="text-primary" style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {sortedEntries[0].name}
                    <Sparkles size={14} className="text-accent-amber" />
                  </span>
                  <span className="text-secondary" style={{ fontSize: '11.5px', marginBottom: '8px' }}>@{sortedEntries[0].username}</span>
                  <span className="std-badge std-badge--violet" style={{ fontSize: '9.5px', padding: '2px 6px', marginBottom: '8px' }}>Lv.{sortedEntries[0].level}</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {(sortedEntries[0].xp || 0).toLocaleString()} XP
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div 
                  className="ld-podium-card ld-podium-card--3rd"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="ld-podium-rank ld-podium-rank--3">3</div>
                  <div style={{ position: 'relative' }}>
                    <div className="ld-podium-avatar ld-podium-avatar--3" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                      {sortedEntries[2].name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {sortedEntries[2].isOnline && <span className="online-indicator" style={{ position: 'absolute', bottom: '12px', right: '4px', border: '3px solid var(--bg-primary)' }} />}
                  </div>
                  <span className="text-primary" style={{ fontWeight: 700, fontSize: '14.5px' }}>{sortedEntries[2].name}</span>
                  <span className="text-secondary" style={{ fontSize: '11px', marginBottom: '8px' }}>@{sortedEntries[2].username}</span>
                  <span className="std-badge std-badge--violet" style={{ fontSize: '9px', padding: '1px 5px', marginBottom: '8px' }}>Lv.{sortedEntries[2].level}</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(sortedEntries[2].xp || 0).toLocaleString()} XP
                  </div>
                </motion.div>
                
              </div>
            )}

            {/* ── ROWS CONTAINER ── */}
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              <AnimatePresence>
                {sortedEntries.map((entry) => {
                  const isCurrentUser = entry.username === user?.username || entry.name === user?.name;
                  return (
                    <motion.div
                      key={entry.username || entry.name}
                      ref={isCurrentUser ? currentUserRowRef : null}
                      id={isCurrentUser ? 'leaderboard-row-you' : undefined}
                      className={`ld-card ${isCurrentUser ? 'ld-card--you' : ''}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                    >
                      
                      {/* Rank badge */}
                      <div className={`ld-card-rank-badge ${getRankBadgeClass(entry.rank)}`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </div>

                      {/* User Info */}
                      <div className="ld-card-user-info">
                        <div style={{ position: 'relative' }}>
                          <div className="ld-card-avatar" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 800, justifyContent: 'center' }}>
                            {entry.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          {entry.isOnline && (
                            <span className="online-indicator" style={{ position: 'absolute', bottom: '0', right: '0', border: '2px solid var(--bg-secondary)' }} />
                          )}
                        </div>

                        <div className="ld-card-name-sec">
                          <span className="ld-card-name">
                            {entry.name || 'Anonymous'}
                            {isCurrentUser && <span className="std-badge std-badge--blue" style={{ fontSize: '9px', padding: '1px 5px' }}>You</span>}
                          </span>
                          <span className="ld-card-username">@{entry.username}</span>
                        </div>
                      </div>

                      {/* User dynamic stats */}
                      <div className="ld-card-stats-sec">
                        <div className="ld-card-stat">
                          <span className="ld-card-stat-val">🔥 {entry.computedStreak}</span>
                          <span className="ld-card-stat-lbl">Streak</span>
                        </div>

                        <div className="ld-card-stat">
                          <span className="ld-card-stat-val">📚 {entry.computedLessons}</span>
                          <span className="ld-card-stat-lbl">Lessons</span>
                        </div>

                        <div className="ld-card-stat">
                          <span className="ld-card-stat-val">🏆 {entry.computedTracks}</span>
                          <span className="ld-card-stat-lbl">Tracks</span>
                        </div>

                        <div className="ld-card-stat" style={{ minWidth: '110px' }}>
                          <span className="ld-card-stat-val" style={{ color: 'var(--accent-violet)', fontSize: '11.5px' }}>
                            ⚡ {entry.learningTrack}
                          </span>
                          <span className="ld-card-stat-lbl">Active Track</span>
                        </div>
                      </div>

                      {/* Rank XP & level */}
                      <div className="ld-card-xp-sec">
                        <span className="ld-card-xp">
                          {(entry.xp || 0).toLocaleString()} <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>XP</span>
                        </span>
                        <span className="std-badge std-badge--violet" style={{ fontSize: '9px', marginTop: '4px', fontWeight: 700 }}>
                          Lv.{entry.level}
                        </span>
                      </div>

                      {/* Profile Button */}
                      <Link 
                        to={isCurrentUser ? "/profile" : `/profile/${entry.username}`}
                        className="btn btn--secondary btn--sm"
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}
                      >
                        Profile <ArrowUpRight size={12} />
                      </Link>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        )}

      </div>{/* /container */}

      {/* ── STICKY FLOATING CURRENT USER HIGHLIGHT FOOTER ── */}
      {currentUserRank && (
        <div className="ld-sticky-footer">
          <div className="ld-sticky-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="ld-card-rank-badge ld-card-rank-badge--1" style={{ background: 'var(--accent-blue)' }}>
                #{currentUserRank}
              </div>
              <div>
                <span className="text-primary" style={{ fontWeight: 800, fontSize: '14px', display: 'block' }}>
                  Your Rank Position
                </span>
                <span className="text-secondary" style={{ fontSize: '11px' }}>
                  Climb higher to claim rank 1!
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="text-primary" style={{ fontWeight: 800, fontSize: '14px', display: 'block' }}>
                  {(user?.xp || 0).toLocaleString()}
                </span>
                <span className="text-secondary" style={{ fontSize: '10.5px' }}>XP Balance</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span className="text-primary" style={{ fontWeight: 800, fontSize: '14px', display: 'block' }}>
                  Lv.{user?.level || 1}
                </span>
                <span className="text-secondary" style={{ fontSize: '10.5px' }}>Current Level</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span className="text-primary" style={{ fontWeight: 800, fontSize: '14px', display: 'block' }}>
                  🔥 {user?.streak || 0}
                </span>
                <span className="text-secondary" style={{ fontSize: '10.5px' }}>Day Streak</span>
              </div>

              <button 
                onClick={scrollToUserRow}
                className="btn btn--primary btn--sm"
                style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '11.5px', padding: '8px 16px' }}
              >
                Jump to Position
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
