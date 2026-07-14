import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePathSelection } from '../context/PathSelectionContext';
import { trackService } from '../services/trackService';
import { userService } from '../services/userService';
import { notificationService, NotificationItem } from '../services/notificationService';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/common/ProgressRing';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ActivityHeatmap from '../components/common/ActivityHeatmap';
import PageTransition from '../components/layout/PageTransition';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Trophy, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Flame
} from 'lucide-react';

const TRACK_ICONS: Record<string, string> = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function HomePage() {
  const { user, settings } = useAuth();
  const { openOverlay } = usePathSelection();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackDetails, setActiveTrackDetails] = useState<any>(null);

  // Quick Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 1. Determine Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || 'Learner';
    if (hour < 12) return `Good morning, ${name} 👋`;
    if (hour < 18) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  const getActiveTrack = (allTracks: any[]) => {
    const savedActiveId = localStorage.getItem('activeTrackId');
    if (savedActiveId) {
      const match = allTracks.find(t => t.id === savedActiveId || t._id === savedActiveId);
      if (match && (match.progress?.progressPercent > 0 || match.progress?.completedLessons > 0)) {
        return match;
      }
    }

    const studied = allTracks.filter(t => 
      t.progress && (t.progress.progressPercent > 0 || t.progress.completedLessons > 0 || t.progress.lastAccessedAt)
    );

    if (studied.length === 0) return null;

    studied.sort((a, b) => {
      const dateA = a.progress?.lastAccessedAt ? new Date(a.progress.lastAccessedAt).getTime() : 0;
      const dateB = b.progress?.lastAccessedAt ? new Date(b.progress.lastAccessedAt).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (b.progress?.progressPercent || 0) - (a.progress?.progressPercent || 0);
    });

    return studied[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksData, achData, actData, notifData] = await Promise.all([
          trackService.getAll(),
          userService.getAchievements(),
          userService.getActivity(),
          notificationService.getAll('All', '', 10, 0)
        ]);

        const allTracks = tracksData.tracks || [];
        setTracks(allTracks);
        setAchievements(achData.achievements || []);
        setActivity(actData.activity || []);
        setTimelineEvents(notifData.notifications || []);

        const detectedActive = getActiveTrack(allTracks);
        if (detectedActive) {
          const detailData = await trackService.getBySlug(detectedActive.slug);
          if (detailData && detailData.track) {
            setActiveTrackDetails({
              ...detailData.track,
              progress: detailData.progress || detectedActive.progress
            });
            localStorage.setItem('activeTrackId', detailData.track.id);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Quick Search Logic
  useEffect(() => {
    if (!searchQuery.trim() || tracks.length === 0) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: any[] = [];

    tracks.forEach(track => {
      // Search Track Name/Description
      if (track.name.toLowerCase().includes(query) || track.description.toLowerCase().includes(query)) {
        results.push({
          type: 'track',
          title: track.name,
          subtitle: track.description,
          url: `/track/${track.slug}`,
          icon: TRACK_ICONS[track.slug] || '📚'
        });
      }
    });

    setSearchResults(results.slice(0, 5));
  }, [searchQuery, tracks]);

  // Compute active track progress variables
  let currentLessonName = '';
  let currentModuleName = '';
  let currentLessonSlug = '';
  let progressPercent = 0;
  let completedLessonsCount = 0;
  let totalLessonsCount = 0;
  let nextLessonName = '';
  let nextModuleUnlock = '';

  if (activeTrackDetails) {
    const track = activeTrackDetails;
    const progress = activeTrackDetails.progress;

    const allLessons: any[] = [];
    track.modules.forEach((mod: any) => {
      mod.lessons.forEach((les: any) => {
        allLessons.push({
          ...les,
          moduleName: mod.name,
          moduleId: mod.id
        });
      });
    });

    totalLessonsCount = track.total_lessons || track.totalLessons || allLessons.length;
    completedLessonsCount = Array.isArray(progress.completedLessons || progress.completed_lessons)
      ? (progress.completedLessons || progress.completed_lessons).length
      : 0;
    progressPercent = progress.progressPercent ?? progress.progress_percent ?? Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100);

    const currentLessonId = typeof progress.currentLesson === 'object' && progress.currentLesson !== null
      ? progress.currentLesson.id || progress.currentLesson._id
      : (progress.current_lesson || progress.currentLesson);

    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId || l._id === currentLessonId);
    
    const currentLesson = currentIndex !== -1 ? allLessons[currentIndex] : allLessons[0];
    if (currentLesson) {
      currentLessonName = currentLesson.title;
      currentLessonSlug = currentLesson.slug;
      currentModuleName = currentLesson.moduleName;
    }

    const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
    
    if (nextLesson) {
      nextLessonName = nextLesson.title;
      if (nextLesson.moduleName !== currentModuleName) {
        nextModuleUnlock = nextLesson.moduleName;
      }
    } else if (progressPercent >= 100) {
      nextLessonName = '🎉 Track Completed!';
    } else {
      nextLessonName = 'Capstone Project';
    }
  }

  const continueUrl = currentLessonSlug
    ? `/lesson/${currentLessonSlug}`
    : activeTrackDetails ? `/track/${activeTrackDetails.slug}` : '/tracks';

  const dailyGoalXP = settings?.daily_goal || user?.dailyXpGoal || 50;
  const dailyXPEarned = user?.dailyXpEarned || 0;
  const dailyPercent = Math.min((dailyXPEarned / dailyGoalXP) * 100, 100);

  // Weekly Stats Calculation
  const totalWeeklyGoal = settings?.weekly_goal || 250;
  const weeklyActivity = activity.slice(-7);
  const weeklyXPEarned = weeklyActivity.reduce((sum, day) => sum + (day.xp || 0), 0);
  const weeklyLessonsCompleted = weeklyActivity.reduce((sum, day) => sum + (day.lessonsCompleted || 0), 0);
  const weeklyMinutesLearned = weeklyActivity.reduce((sum, day) => sum + (day.minutesLearned || 0), 0);

  // Recommendations: Tracks that haven't been completed yet
  const recommendedTracks = tracks.filter(t => !t.progress || t.progress.progressPercent < 100).slice(0, 2);

  return (
    <PageTransition>
      <div className="home-page" style={{ padding: 'var(--space-8) 0' }}>
        <div className="container">
          
          {/* Dynamic Greeting */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>
              {getGreeting()}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
              Welcome back. Let's make today another great day of coding.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-8)', alignItems: 'start' }} className="dashboard-grid">
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              {/* Hero: Continue Learning */}
              <section className="home-hero">
                <motion.div
                  className="home-hero__card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--space-6)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {activeTrackDetails ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <span className="home-hero__label" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.05em' }}>
                          Continue Learning
                        </span>
                        
                        <div className="hero-track-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', marginBottom: '8px' }}>
                          <span className="hero-track-icon" style={{ fontSize: '28px' }}>
                            {TRACK_ICONS[activeTrackDetails.slug] || activeTrackDetails.icon || '📚'}
                          </span>
                          <h2 className="home-hero__title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                            {activeTrackDetails.name}
                          </h2>
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                          Progress: {completedLessonsCount} / {totalLessonsCount} Lessons ({progressPercent}%)
                        </p>

                        <div className="hero-active-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Module</span>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {currentModuleName || 'N/A'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Lesson</span>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {currentLessonName || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <Link
                            to={continueUrl}
                            className="btn btn--primary btn--md"
                            style={{
                              background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          >
                            Continue Learning →
                          </Link>
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, padding: '10px' }}>
                        <ProgressRing
                          percent={progressPercent}
                          size={130}
                          strokeWidth={10}
                          color={activeTrackDetails?.color || 'var(--accent-blue)'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px 10px', textAlign: 'center', width: '100%' }}>
                      <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🎯</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Choose Your First Learning Track</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '380px', margin: '8px auto 16px' }}>
                        You haven't started any structured learning track yet. Choose one of our comprehensive programming roadmaps to begin!
                      </p>
                      <button onClick={openOverlay} className="btn btn--primary btn--md">
                        Browse Tracks →
                      </button>
                    </div>
                  )}
                </motion.div>
              </section>

              {/* Heatmap Contribution Calendar */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} className="text-emerald-500" /> Learning Heatmap
                </h3>
                <ActivityHeatmap 
                  activity={activity} 
                  streak={user?.streak || 0} 
                  longestStreak={user?.longestStreak || 0} 
                  showSummary={false} 
                />
              </div>

              {/* Quick Search */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={16} className="text-blue-500" /> Quick Search
                </h3>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} size={16} />
                  <input
                    type="text"
                    placeholder="Search tracks, modules, lessons, concepts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}
                    >
                      {searchResults.map((res, i) => (
                        <Link
                          key={i}
                          to={res.url}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span style={{ fontSize: '18px' }}>{res.icon}</span>
                          <div>
                            <strong style={{ display: 'block' }}>{res.title}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                              {res.subtitle}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recent Activity Timeline */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <TrendingUp size={16} className="text-violet-500" /> Recent Activity
                  </h3>
                  <Link to="/notifications" style={{ fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none' }}>View history</Link>
                </div>
                
                {timelineEvents.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>No recent milestones logged.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                    {/* Vertical timeline line */}
                    <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }} />

                    {timelineEvents.slice(0, 5).map(event => (
                      <div key={event.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
                        {/* Bullet */}
                        <div style={{
                          position: 'absolute',
                          left: '-20px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '2px solid var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}>
                          {event.icon || '•'}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{event.title}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{event.message}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {new Date(event.created_at).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              {/* Daily Goal Ring */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} className="text-amber-500" /> Daily Target
                </h3>
                
                <ProgressRing
                  percent={dailyPercent}
                  size={120}
                  strokeWidth={9}
                  color="var(--accent-amber)"
                />
                
                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                    {dailyXPEarned} / {dailyGoalXP} XP
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {dailyPercent >= 100 ? '🎉 Daily Goal Achieved!' : `${dailyGoalXP - dailyXPEarned} XP remaining to hit your target`}
                  </span>
                </div>
              </div>

              {/* Weekly Overview */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} className="text-emerald-500" /> Weekly Overview
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={14} className="text-yellow-500" />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>XP Accumulated</span>
                    </div>
                    <strong style={{ fontSize: '13px' }}>{weeklyXPEarned} XP</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={14} className="text-blue-500" />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lessons Completed</span>
                    </div>
                    <strong style={{ fontSize: '13px' }}>{weeklyLessonsCompleted}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} className="text-violet-500" />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Study Hours</span>
                    </div>
                    <strong style={{ fontSize: '13px' }}>{(weeklyMinutesLearned / 60).toFixed(1)} hrs</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={14} className="text-teal-500" />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Weekly Target</span>
                    </div>
                    <strong style={{ fontSize: '13px' }}>{weeklyXPEarned} / {totalWeeklyGoal} XP</strong>
                  </div>
                </div>
              </div>

              {/* Upcoming Unlocks */}
              {activeTrackDetails && (
                <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} className="text-blue-500" /> Upcoming Unlocks
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {nextLessonName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Next Lesson</span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{nextLessonName}</span>
                        </div>
                      </div>
                    )}

                    {nextModuleUnlock && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-violet)' }} />
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Next Module</span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{nextModuleUnlock}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }} />
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Next Level</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Level {(user?.level || 1) + 1}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>Next Badge Reward</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {achievements.find(a => !a.earned)?.name || 'Consistency King'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Recommended Learning */}
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} className="text-purple-500" /> Recommendations
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recommendedTracks.map(recTrack => (
                    <Link
                      key={recTrack.id}
                      to={`/track/${recTrack.slug}`}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{TRACK_ICONS[recTrack.slug] || '📚'}</span>
                        <div>
                          <strong style={{ fontSize: '12px', display: 'block' }}>{recTrack.name}</strong>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{recTrack.totalLessons || recTrack.total_lessons} lessons</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-blue-500" />
                    </Link>
                  ))}

                  <button
                    onClick={() => navigate('/generate')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px dashed var(--accent-blue)',
                      backgroundColor: 'rgba(59, 130, 246, 0.02)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--accent-blue)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.02)'}
                  >
                    <PlusCircle size={14} /> Custom AI learning path
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
