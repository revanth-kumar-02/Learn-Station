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
  const [toast, setToast] = useState(null);
  const [celebrationModule, setCelebrationModule] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const data = await trackService.getBySlug(slug);
        setTrack(data.track);
        setProgress(data.progress);
        
        // Default open the active module from progress, or first module
        const activeModId = data.progress?.currentModule || (data.track?.modules?.length ? data.track.modules[0].id : null);
        setOpenModule(activeModId);

        // Check for newly completed module celebration
        if (data.track && data.progress) {
          const completedSet = new Set((data.progress.completedLessons || []).map((l) => l.toString()));
          const completedModulesList = data.track.modules.filter(mod => 
            mod.lessons && mod.lessons.length > 0 && mod.lessons.every(l => completedSet.has(l.id.toString()))
          );

          // Get celebrated modules from localStorage
          const celebratedJson = localStorage.getItem(`celebrated_modules_${data.track._id}`);
          const celebratedSet = new Set(celebratedJson ? JSON.parse(celebratedJson) : []);

          // Find any completed module that hasn't been celebrated yet
          const newlyCompletedModule = completedModulesList.find(mod => !celebratedSet.has(mod.id));

          if (newlyCompletedModule) {
            setCelebrationModule(newlyCompletedModule);
            celebratedSet.add(newlyCompletedModule.id);
            localStorage.setItem(`celebrated_modules_${data.track._id}`, JSON.stringify([...celebratedSet]));
          }
        }
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
  const completedChallengesSet = new Set((progress?.completedChallenges || []).map((c) => c.toString()));

  const areLessonChallengesCompleted = (lesson) => {
    if (!lesson.challengeIds || lesson.challengeIds.length === 0) return true;
    return lesson.challengeIds.every(cid => completedChallengesSet.has(cid.toString()));
  };

  // Calculate unlocked state for each module
  const moduleUnlocked = {};
  if (track.modules && track.modules.length > 0) {
    // Module 0 is always unlocked
    moduleUnlocked[track.modules[0].id] = true;
    
    for (let i = 1; i < track.modules.length; i++) {
      const prevMod = track.modules[i - 1];
      const prevModuleLessonsCompleted = prevMod.lessons && prevMod.lessons.length > 0 && prevMod.lessons.every(l => completedSet.has(l.id.toString()));
      moduleUnlocked[track.modules[i].id] = prevModuleLessonsCompleted;
    }
  }

  // Find the first incomplete lesson in the track (this is the active "Current Lesson" to highlight)
  let currentLessonId = null;
  if (track.modules) {
    for (const m of track.modules) {
      for (const l of m.lessons || []) {
        if (!completedSet.has(l.id.toString())) {
          currentLessonId = l.id.toString();
          break;
        }
      }
      if (currentLessonId) break;
    }
  }

  const handleModuleHeaderClick = (modId, isUnlocked) => {
    if (!isUnlocked) {
      showToast("This module is locked. Complete the previous module to continue.");
      return;
    }
    setOpenModule(openModule === modId ? null : modId);
  };

  return (
    <PageTransition>
      <div className="track-detail-page">
        {toast && (
          <div className="toast-notification">
            <span>🔒</span>
            {toast}
          </div>
        )}

        {celebrationModule && (
          <div className="celebration-overlay">
            <div className="celebration-card">
              <div className="celebration-card__confetti">🎉🏆✨</div>
              <h2>Module Completed!</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', margin: 'var(--space-2) 0 var(--space-4)' }}>
                <strong>{celebrationModule.name}</strong>
              </p>
              <p>
                Outstanding work! You have successfully completed all lessons in this module. 
                The next module is now unlocked and ready for your learning journey!
              </p>
              <button 
                className="btn btn--primary btn--lg w-full"
                onClick={() => setCelebrationModule(null)}
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}

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
            {track.modules?.map((mod, mi) => {
              const isModUnlocked = moduleUnlocked[mod.id];

              return (
                <motion.div
                  key={mod.id}
                  className={`module ${!isModUnlocked ? 'module--locked' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + mi * 0.1 }}
                  style={!isModUnlocked ? { opacity: 0.55 } : {}}
                >
                  <button
                    className={`module__header ${openModule === mod.id ? 'module__header--open' : ''}`}
                    onClick={() => handleModuleHeaderClick(mod.id, isModUnlocked)}
                  >
                    <div className="module__title">
                      <span className="module__chevron" style={!isModUnlocked ? { color: 'var(--text-muted)' } : {}}>
                        {!isModUnlocked ? '🔒' : '▶'}
                      </span>
                      <h3 style={!isModUnlocked ? { color: 'var(--text-muted)' } : {}}>{mod.name}</h3>
                    </div>
                    <span className="module__count">{mod.lessons?.length || 0} lessons</span>
                  </button>

                  {openModule === mod.id && isModUnlocked && (
                    <motion.div
                      className="module__lessons"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="module__lesson-path">
                        {mod.lessons?.map((lesson, li) => {
                          const isCompleted = completedSet.has(lesson.id.toString());
                          
                          // First lesson of unlocked module is unlocked, subsequent require completion of previous lesson and challenges
                          const isUnlocked = isCompleted || (isModUnlocked && (li === 0 || (completedSet.has(mod.lessons[li - 1]?.id?.toString()) && areLessonChallengesCompleted(mod.lessons[li - 1]))));
                          const isCurrent = lesson.id.toString() === currentLessonId;

                          return (
                            <motion.div
                              key={lesson._id}
                              className={`lesson-row ${isCompleted ? 'lesson-row--completed' : ''} ${isCurrent ? 'lesson-row--current' : ''} ${!isUnlocked ? 'lesson-row--locked' : ''}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: li * 0.08 }}
                              onClick={() => {
                                if (!isUnlocked) {
                                  showToast("This lesson is locked. Complete the previous lesson to continue.");
                                } else {
                                  navigate(`/lesson/${lesson.slug}`);
                                }
                              }}
                            >
                              <div className="lesson-row__indicator">
                                {isCompleted ? (
                                  <svg className="lesson-row__check" width="20" height="20" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="9" fill={track.color} />
                                    <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                                  </svg>
                                ) : !isUnlocked ? (
                                  <div className="lesson-row__dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', fontSize: '13px' }}>🔒</div>
                                ) : isCurrent ? (
                                  <div className="lesson-row__dot lesson-row__dot--active" style={{ borderColor: track.color }} />
                                ) : (
                                  <div className="lesson-row__dot" />
                                )}
                                {li < mod.lessons.length - 1 && <div className="lesson-row__line" />}
                              </div>

                              <div className="lesson-row__content">
                                <h4 style={isCurrent ? { color: 'var(--text-primary)', fontWeight: 'bold' } : {}}>{lesson.title}</h4>
                                <div className="lesson-row__meta">
                                  <span>⏱ {lesson.estimatedMinutes} min</span>
                                  <span>✦ {lesson.xpReward} XP</span>
                                </div>
                              </div>

                              {isCurrent ? (
                                <button className="lesson-row__btn-continue">
                                  Continue
                                </button>
                              ) : (
                                <div className="lesson-row__arrow" style={!isUnlocked ? { opacity: 0.3 } : {}}>→</div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
