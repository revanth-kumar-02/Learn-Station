import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePathSelection } from '../context/PathSelectionContext';
import { trackService } from '../services/trackService';
import { userService } from '../services/userService';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/common/ProgressRing';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { SkeletonCard } from '../components/common/Skeleton';
import PageTransition from '../components/layout/PageTransition';

const TRACK_ICONS = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function HomePage() {
  const { user } = useAuth();
  const { openOverlay } = usePathSelection();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackDetails, setActiveTrackDetails] = useState<any>(null);

  const getActiveTrack = (allTracks: any[]) => {
    // Check if there is an activeTrackId in localStorage
    const savedActiveId = localStorage.getItem('activeTrackId');
    if (savedActiveId) {
      const match = allTracks.find(t => t.id === savedActiveId || t._id === savedActiveId);
      if (match && (match.progress?.progressPercent > 0 || match.progress?.completedLessons > 0)) {
        return match;
      }
    }

    // Filter tracks that have any progress
    const studied = allTracks.filter(t => 
      t.progress && (t.progress.progressPercent > 0 || t.progress.completedLessons > 0 || t.progress.lastAccessedAt)
    );

    if (studied.length === 0) return null;

    // Sort by last accessed, then progress percent
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
        const [tracksData, achData] = await Promise.all([
          trackService.getAll(),
          userService.getAchievements()
        ]);
        const allTracks = tracksData.tracks || [];
        setTracks(allTracks);
        setAchievements(achData.achievements || []);

        const detectedActive = getActiveTrack(allTracks);
        if (detectedActive) {
          // Fetch full track details to get modules and lessons list
          const detailData = await trackService.getBySlug(detectedActive.slug);
          if (detailData && detailData.track) {
            setActiveTrackDetails({
              ...detailData.track,
              progress: detailData.progress || detectedActive.progress
            });
            // Update localStorage
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

  // Compute active track progress variables
  let currentLessonName = '';
  let nextLessonName = '';
  let currentModuleName = '';
  let currentLessonSlug = '';
  let progressPercent = 0;
  let completedLessonsCount = 0;
  let totalLessonsCount = 0;

  if (activeTrackDetails) {
    const track = activeTrackDetails;
    const progress = activeTrackDetails.progress;

    // Flatten all lessons in order
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

    totalLessonsCount = track.totalLessons || allLessons.length;
    completedLessonsCount = Array.isArray(progress.completedLessons)
      ? progress.completedLessons.length
      : (typeof progress.completedLessons === 'number' ? progress.completedLessons : 0);
    progressPercent = progress.progressPercent ?? Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100);

    // Get current lesson ID (handle string vs object representation)
    const currentLessonId = typeof progress.currentLesson === 'object' && progress.currentLesson !== null
      ? progress.currentLesson.id || progress.currentLesson._id
      : progress.currentLesson;

    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId || l._id === currentLessonId);
    
    // Find current lesson
    const currentLesson = currentIndex !== -1 ? allLessons[currentIndex] : allLessons[0];
    if (currentLesson) {
      currentLessonName = currentLesson.title;
      currentLessonSlug = currentLesson.slug;
      currentModuleName = currentLesson.moduleName;
    }

    // Find next lesson
    const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
    
    if (nextLesson) {
      nextLessonName = nextLesson.title;
    } else if (progressPercent >= 100) {
      nextLessonName = '🎉 Track Completed!';
    } else {
      nextLessonName = 'Capstone Project';
    }
  }

  const continueUrl = currentLessonSlug
    ? `/lesson/${currentLessonSlug}`
    : activeTrackDetails ? `/track/${activeTrackDetails.slug}` : '/tracks';

  const dailyPercent = user ? Math.min((user.dailyXpEarned / user.dailyXpGoal) * 100, 100) : 0;

  return (
    <PageTransition>
      <div className="home-page">
        <div className="container">
          {/* Hero — Continue Learning */}
          <section className="home-hero">
            <motion.div
              className="home-hero__card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeTrackDetails ? (
                <div className="home-hero__left" style={{ width: '100%' }}>
                  <span className="home-hero__label">Continue Learning</span>
                  <div className="hero-track-header">
                    <span className="hero-track-icon">
                      {TRACK_ICONS[activeTrackDetails.slug as keyof typeof TRACK_ICONS] || activeTrackDetails.icon || '📚'}
                    </span>
                    <h1 className="home-hero__title" style={{ margin: 0 }}>
                      {activeTrackDetails.name}
                    </h1>
                  </div>
                  
                  <p className="home-hero__subtitle" style={{ marginBottom: '12px' }}>
                    Progress: {completedLessonsCount} / {totalLessonsCount} Lessons ({progressPercent}%)
                  </p>

                  <div className="hero-active-info">
                    <div className="hero-info-item">
                      <span className="hero-info-label">Current Module</span>
                      <span className="hero-info-val">{currentModuleName || 'N/A'}</span>
                    </div>
                    <div className="hero-info-item">
                      <span className="hero-info-label">Current Lesson</span>
                      <span className="hero-info-val">{currentLessonName || 'N/A'}</span>
                    </div>
                    <div className="hero-info-item" style={{ gridColumn: 'span 2' }}>
                      <span className="hero-info-label">Next Lesson</span>
                      <span className="hero-info-val" style={{ color: 'var(--accent-blue)' }}>{nextLessonName}</span>
                    </div>
                  </div>

                  <div className="home-hero__meta" style={{ marginBottom: '16px' }}>
                    <span>🎯 +25 XP / lesson</span>
                    <span>⏱ ~10 min</span>
                  </div>

                  <Link
                    to={continueUrl}
                    className="btn btn--primary btn--lg home-hero__cta"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                      color: 'white'
                    }}
                  >
                    Continue Learning →
                  </Link>
                </div>
              ) : (
                <div className="home-hero__left">
                  <span className="home-hero__label">Continue Learning</span>
                  <h1 className="home-hero__title">Start a track</h1>
                  <p className="home-hero__subtitle">Choose a learning track below to begin your journey</p>
                  <div className="home-hero__meta">
                    <span>🎯 +25 XP</span>
                    <span>⏱ ~10 min</span>
                  </div>
                  <button onClick={openOverlay} className="btn btn--primary btn--lg home-hero__cta">
                    Browse Tracks →
                  </button>
                </div>
              )}
              <div className="home-hero__right">
                <ProgressRing
                  percent={activeTrackDetails ? progressPercent : 0}
                  size={120}
                  strokeWidth={8}
                  color={activeTrackDetails?.color || 'var(--accent-blue)'}
                />
              </div>
            </motion.div>
          </section>

          {/* Daily Goal */}
          <motion.section
            className="home-daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="home-daily__header">
              <div className="home-daily__left">
                <span className="home-daily__fire">🔥</span>
                <div>
                  <span className="home-daily__streak">
                    <strong>{user?.streak || 0}</strong> day streak
                  </span>
                  <span className="home-daily__goal-text">
                    <AnimatedCounter value={user?.dailyXpEarned || 0} duration={1000} /> / {user?.dailyXpGoal || 50} XP today
                  </span>
                </div>
              </div>
              {dailyPercent >= 100 && <span className="home-daily__badge">🎉 Goal met!</span>}
            </div>
            <ProgressBar value={user?.dailyXpEarned || 0} max={user?.dailyXpGoal || 50} color="var(--accent-amber)" size="md" />
          </motion.section>

          {/* Recent Achievements */}
          {!loading && achievements.length > 0 && (
            <section className="home-achievements mt-6" style={{ marginBottom: 'var(--space-10)' }}>
              <div className="home-section-header">
                <h2>Recent Achievements</h2>
                <Link to="/profile" className="home-section-link">View all →</Link>
              </div>
              <div className="achievements-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                {achievements.filter(a => a.earned).slice(0, 3).length > 0 ? (
                  achievements.filter(a => a.earned).slice(0, 3).map((a, i) => (
                    <motion.div
                      key={a.id}
                      className="achievement-card achievement-card--earned"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <span className="achievement-card__icon">{a.icon}</span>
                      <strong>{a.name}</strong>
                      <p>{a.description}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: 'var(--space-2)' }}>🏆</span>
                    No achievements earned yet. Start learning to unlock your first badge!
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tracks Grid */}
          <section className="home-tracks">
            <div className="home-section-header">
              <h2>Learning Tracks</h2>
              <Link to="/tracks" className="home-section-link">View all →</Link>
            </div>

            <div className="home-tracks__grid">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : tracks.slice(0, 6).map((track, i) => (
                    <motion.div
                      key={track._id}
                      className="track-card"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                      onClick={() => navigate(`/track/${track.slug}`)}
                    >
                      <div className="track-card__accent" style={{ background: track.color }} />
                      <div className="track-card__body">
                        <div className="track-card__header">
                          <div className="track-card__icon" style={{ background: `${track.color}15`, color: track.color }}>
                            {TRACK_ICONS[track.slug] || '📚'}
                          </div>
                          {track.progress?.progressPercent > 0 && (
                            <span className="track-card__badge" style={{ color: track.color }}>
                              {track.progress.progressPercent}%
                            </span>
                          )}
                        </div>
                        <h3 className="track-card__title">{track.name}</h3>
                        <p className="track-card__desc">{track.description}</p>
                        <div className="track-card__stats">
                          <span>{track.totalLessons} lessons</span>
                          <span>·</span>
                          <span>{track.progress?.xpEarned || 0} XP earned</span>
                        </div>
                        <div className="track-card__progress">
                          <div className="track-card__progress-label">
                            <span>{track.progress?.completedLessons || 0} / {track.totalLessons}</span>
                          </div>
                          <ProgressBar
                            value={track.progress?.completedLessons || 0}
                            max={track.totalLessons}
                            color={track.color}
                            size="sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
