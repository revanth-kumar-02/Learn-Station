import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackService } from '../services/trackService';
import { progressService } from '../services/userService';
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
  const [showCapstone, setShowCapstone] = useState(false);
  const [capstoneForm, setCapstoneForm] = useState({ repoUrl: '', demoUrl: '' });
  const [capstoneSubmitting, setCapstoneSubmitting] = useState(false);
  const [capstoneResult, setCapstoneResult] = useState(null);

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

          {/* Capstone Project Section */}
          {track && (
            <motion.section
              className="capstone-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="capstone-section__header">
                <div className="capstone-section__icon">🚀</div>
                <div>
                  <h2 className="capstone-section__title">Capstone Project</h2>
                  <p className="capstone-section__subtitle">
                    Build a complete project to demonstrate your mastery of <strong>{track.name}</strong>.
                    Submit your work to earn a certificate and <strong>+500 XP</strong>.
                  </p>
                </div>
              </div>

              <div className="capstone-section__requirements">
                <h3>Project Requirements</h3>
                <ul>
                  {track.slug === 'sql' && (
                    <>
                      <li>Design and implement a relational database for an Inventory Management System</li>
                      <li>Create tables with proper relationships, constraints, and indexes</li>
                      <li>Write 10+ complex SQL queries including JOINs, aggregations, and subqueries</li>
                      <li>Implement stored procedures or views for common operations</li>
                    </>
                  )}
                  {track.slug === 'python' && (
                    <>
                      <li>Build a Python CLI tool or web scraper with real-world data processing</li>
                      <li>Implement OOP principles with at least 3 classes</li>
                      <li>Handle errors gracefully and write unit tests</li>
                      <li>Include a README with setup instructions</li>
                    </>
                  )}
                  {track.slug === 'webdev' && (
                    <>
                      <li>Create a fully responsive multi-page website</li>
                      <li>Implement JavaScript interactivity (forms, animations, API calls)</li>
                      <li>Ensure accessibility and mobile-first design</li>
                      <li>Deploy to a live hosting platform</li>
                    </>
                  )}
                  {track.slug === 'ai' && (
                    <>
                      <li>Build an AI application using a real ML/AI API or library</li>
                      <li>Demonstrate data preprocessing and model evaluation</li>
                      <li>Present results with visualizations</li>
                      <li>Document your methodology and findings</li>
                    </>
                  )}
                  {track.slug === 'datascience' && (
                    <>
                      <li>Perform EDA on a real-world dataset (Kaggle, UCI, etc.)</li>
                      <li>Apply statistical analysis and ML models</li>
                      <li>Create data visualizations and a final report</li>
                      <li>Achieve at least 80% model accuracy on test data</li>
                    </>
                  )}
                  {track.slug === 'java' && (
                    <>
                      <li>Develop an OOP application (e.g., Library Management System)</li>
                      <li>Use design patterns (Singleton, Factory, Observer)</li>
                      <li>Write JUnit tests with 80%+ coverage</li>
                      <li>Document with Javadoc comments</li>
                    </>
                  )}
                  {!['sql','python','webdev','ai','datascience','java'].includes(track.slug) && (
                    <>
                      <li>Apply core concepts learned throughout the track</li>
                      <li>Build a complete, functional project showcasing your skills</li>
                      <li>Include documentation and a live demo or repository</li>
                    </>
                  )}
                </ul>
              </div>

              {capstoneResult ? (
                <motion.div
                  className="capstone-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="capstone-success__icon">🎉</div>
                  <h3>Capstone Submitted!</h3>
                  <p>You earned <strong>+500 XP</strong> and a certificate has been generated.</p>
                  {capstoneResult.certificate && (
                    <Link
                      to={`/certificate/${capstoneResult.certificate.certificate_id}`}
                      className="btn btn--primary"
                    >
                      View Certificate →
                    </Link>
                  )}
                </motion.div>
              ) : (
                <>
                  {!showCapstone ? (
                    <button
                      type="button"
                      className="btn btn--primary capstone-section__cta"
                      onClick={() => setShowCapstone(true)}
                      id="capstone-submit-btn"
                    >
                      🚀 Submit Capstone Project
                    </button>
                  ) : (
                    <motion.div
                      className="capstone-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="capstone-form__field">
                        <label htmlFor="capstone-repo">Repository URL <span className="required">*</span></label>
                        <input
                          id="capstone-repo"
                          type="url"
                          placeholder="https://github.com/username/project"
                          value={capstoneForm.repoUrl}
                          onChange={(e) => setCapstoneForm((f) => ({ ...f, repoUrl: e.target.value }))}
                          className="capstone-form__input"
                        />
                      </div>
                      <div className="capstone-form__field">
                        <label htmlFor="capstone-demo">Live Demo URL (optional)</label>
                        <input
                          id="capstone-demo"
                          type="url"
                          placeholder="https://your-project.vercel.app"
                          value={capstoneForm.demoUrl}
                          onChange={(e) => setCapstoneForm((f) => ({ ...f, demoUrl: e.target.value }))}
                          className="capstone-form__input"
                        />
                      </div>
                      <div className="capstone-form__actions">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => setShowCapstone(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary"
                          disabled={capstoneSubmitting || !capstoneForm.repoUrl}
                          onClick={async () => {
                            if (!capstoneForm.repoUrl) return;
                            try {
                              setCapstoneSubmitting(true);
                              const result = await progressService.submitCapstone(
                                track._id || track.id,
                                capstoneForm.repoUrl,
                                capstoneForm.demoUrl
                              );
                              setCapstoneResult(result);
                            } catch (err) {
                              const msg = err.response?.data?.message || 'Submission failed. Please try again.';
                              showToast(msg);
                            } finally {
                              setCapstoneSubmitting(false);
                            }
                          }}
                        >
                          {capstoneSubmitting ? 'Submitting...' : 'Submit Project →'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
