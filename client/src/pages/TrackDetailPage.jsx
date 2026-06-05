import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackService } from '../services/trackService';
import ProgressBar from '../components/common/ProgressBar';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';

const TRACK_ICONS = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function TrackDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const data = await trackService.getBySlug(slug);
        setTrack(data.track);
        setProgress(data.progress);
        if (data.track?.modules?.length) setOpenModule(data.track.modules[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [slug]);

  if (loading) return <Loader fullPage />;
  if (!track) return <div className="container" style={{ paddingTop: '120px' }}><h2>Track not found</h2></div>;

  const completedSet = new Set((progress?.completedLessons || []).map((l) => l.toString()));

  return (
    <PageTransition>
      <div className="track-detail-page">
        <div className="container">
          {/* Track Header */}
          <motion.div
            className="track-detail__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="track-detail__icon" style={{ background: `${track.color}15`, color: track.color }}>
              {TRACK_ICONS[track.slug] || '📚'}
            </div>
            <div className="track-detail__info">
              <h1 style={{ color: track.color }}>{track.name}</h1>
              <p>{track.description}</p>
              <div className="track-detail__meta">
                <span>{track.totalLessons} lessons</span>
                <span>·</span>
                <span>{progress?.xpEarned || 0} XP earned</span>
                <span>·</span>
                <span>{progress?.progressPercent || 0}% complete</span>
              </div>
              <ProgressBar
                value={progress?.progressPercent || 0}
                max={100}
                color={track.color}
                size="md"
                className="mt-4"
              />
            </div>
          </motion.div>

          {/* Modules & Lessons */}
          <div className="track-detail__modules">
            {track.modules?.map((mod, mi) => (
              <motion.div
                key={mod.id}
                className="module"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + mi * 0.1 }}
              >
                <button
                  className={`module__header ${openModule === mod.id ? 'module__header--open' : ''}`}
                  onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                >
                  <div className="module__title">
                    <span className="module__chevron">▶</span>
                    <h3>{mod.name}</h3>
                  </div>
                  <span className="module__count">{mod.lessons?.length || 0} lessons</span>
                </button>

                {openModule === mod.id && (
                  <motion.div
                    className="module__lessons"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="module__lesson-path">
                      {mod.lessons?.map((lesson, li) => {
                        const isCompleted = completedSet.has(lesson._id?.toString());
                        const isNext = !isCompleted && li === 0 || (li > 0 && completedSet.has(mod.lessons[li - 1]?._id?.toString()) && !isCompleted);

                        return (
                          <motion.div
                            key={lesson._id}
                            className={`lesson-row ${isCompleted ? 'lesson-row--completed' : ''} ${isNext ? 'lesson-row--next' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: li * 0.08 }}
                            onClick={() => navigate(`/lesson/${lesson.slug}`)}
                          >
                            <div className="lesson-row__indicator">
                              {isCompleted ? (
                                <svg className="lesson-row__check" width="20" height="20" viewBox="0 0 20 20">
                                  <circle cx="10" cy="10" r="9" fill={track.color} />
                                  <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </svg>
                              ) : isNext ? (
                                <div className="lesson-row__dot lesson-row__dot--active" style={{ borderColor: track.color }} />
                              ) : (
                                <div className="lesson-row__dot" />
                              )}
                              {li < mod.lessons.length - 1 && <div className="lesson-row__line" />}
                            </div>

                            <div className="lesson-row__content">
                              <h4>{lesson.title}</h4>
                              <div className="lesson-row__meta">
                                <span>⏱ {lesson.estimatedMinutes} min</span>
                                <span>✦ {lesson.xpReward} XP</span>
                              </div>
                            </div>

                            <div className="lesson-row__arrow">→</div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
