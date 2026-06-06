import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePathSelection } from '../context/PathSelectionContext';
import { trackService } from '../services/trackService';
import { userService } from '../services/userService';
import { progressService } from '../services/progressService';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/common/ProgressRing';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { SkeletonCard } from '../components/common/Skeleton';
import Skeleton from '../components/common/Skeleton';
import PageTransition from '../components/layout/PageTransition';

const TRACK_ICONS = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function HomePage() {
  const { user } = useAuth();
  const { openOverlay } = usePathSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const [tracks, setTracks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 [Route Debug] Route loaded:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksData, achData] = await Promise.all([
          trackService.getAll(),
          userService.getAchievements()
        ]);
        setTracks(tracksData.tracks || []);
        setAchievements(achData.achievements || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find current track
  const currentTrack = tracks.find((t) => t._id === user?.currentTrack);
  const dailyPercent = user ? Math.min((user.dailyXpEarned / user.dailyXpGoal) * 100, 100) : 0;
  const isTracksPath = location.pathname === '/tracks';

  return (
    <PageTransition>
      <div className="home-page">
        <div className="container">
          {/* Hero — Continue Learning */}
          {!isTracksPath && (
            <section className="home-hero">
              <motion.div
                className="home-hero__card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="home-hero__left">
                  <span className="home-hero__label">Continue Learning</span>
                  <h1 className="home-hero__title">
                    {currentTrack ? currentTrack.name : 'Start a track'}
                  </h1>
                  <p className="home-hero__subtitle">
                    {currentTrack
                      ? `${currentTrack.progress?.completedLessons || 0} of ${currentTrack.totalLessons} lessons completed`
                      : 'Choose a learning track below to begin your journey'}
                  </p>
                  <div className="home-hero__meta">
                    <span>🎯 +25 XP</span>
                    <span>⏱ ~10 min</span>
                  </div>
                  {currentTrack ? (
                    <Link
                      to={
                        currentTrack.isAiGenerated
                          ? `/ai-workspace/${currentTrack.slug}`
                          : currentTrack.progress?.currentLessonSlug
                          ? `/lesson/${currentTrack.progress.currentLessonSlug}`
                          : `/track/${currentTrack.slug}`
                      }
                      className="btn btn--primary btn--lg home-hero__cta"
                    >
                      Continue Learning →
                    </Link>
                  ) : (
                    <button onClick={openOverlay} className="btn btn--primary btn--lg home-hero__cta">
                      Browse Tracks →
                    </button>
                  )}
                </div>
                <div className="home-hero__right">
                  <ProgressRing
                    percent={currentTrack?.progress?.progressPercent || 0}
                    size={120}
                    strokeWidth={8}
                    color={currentTrack?.color || 'var(--accent-blue)'}
                  />
                </div>
              </motion.div>
            </section>
          )}

          {/* Daily Goal */}
          {!isTracksPath && (
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
          )}

          {/* Recent Achievements */}
          {!isTracksPath && !loading && achievements.length > 0 && (
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
                : tracks.map((track, i) => (
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
