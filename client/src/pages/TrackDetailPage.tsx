import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackService } from '../services/trackService';
import { progressService } from '../services/userService';
import ProgressBar from '../components/common/ProgressBar';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';

const TRACK_ICONS = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function TrackDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [showCertModal, setShowCertModal] = useState(false);

  // Assessment states
  const [passedAssessments, setPassedAssessments] = useState<string[]>([]);
  const [trackAssessmentStatus, setTrackAssessmentStatus] = useState<{ hasPassed: boolean; bestAttempt: number } | null>(null);
  const [assessmentModal, setAssessmentModal] = useState<{
    open: boolean;
    type: 'module' | 'track';
    moduleId?: string;
    moduleName?: string;
  } | null>(null);

  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [assessmentUserText, setAssessmentUserText] = useState('');
  const [assessmentMatches, setAssessmentMatches] = useState<Record<string, string>>({});
  const [assessmentSelectedMatchKey, setAssessmentSelectedMatchKey] = useState<string | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    passed: boolean;
    incorrectQuestions: any[];
  } | null>(null);

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
        
        if (data.track) {
          try {
            const modStatus = await progressService.getAssessmentStatus(data.track.id || data.track._id, 'module');
            if (modStatus && modStatus.attempts) {
              const passed = modStatus.attempts.filter((a: any) => a.passed).map((a: any) => a.module_id);
              setPassedAssessments(passed);
            }
            const trStatus = await progressService.getAssessmentStatus(data.track.id || data.track._id, 'track');
            if (trStatus) {
              setTrackAssessmentStatus({ hasPassed: trStatus.hasPassed, bestAttempt: trStatus.bestAttempt });
            }
          } catch (err) {
            console.error('Failed to load assessment status:', err);
          }
        }
        
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
    moduleUnlocked[track.modules[0].id] = true;
    
    for (let i = 1; i < track.modules.length; i++) {
      const prevMod = track.modules[i - 1];
      const prevModuleLessonsCompleted = prevMod.lessons && prevMod.lessons.length > 0 && prevMod.lessons.every(l => completedSet.has(l.id.toString()));
      const prevModuleAssessmentPassed = passedAssessments.includes(prevMod.id.toString());
      moduleUnlocked[track.modules[i].id] = prevModuleLessonsCompleted && prevModuleAssessmentPassed;
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

  // Start assessment helper
  const handleStartAssessment = async (type: 'module' | 'track', moduleId?: string, moduleName?: string) => {
    try {
      setLoading(true);
      const res = await progressService.getAssessmentQuestions(track.id || track._id, type, moduleId);
      if (res && res.questions) {
        setAssessmentQuestions(res.questions);
        setCurrentQuestionIdx(0);
        setAssessmentAnswers({});
        setSelectedOpt(null);
        setAssessmentUserText('');
        setAssessmentMatches({});
        setAssessmentSelectedMatchKey(null);
        setAssessmentResult(null);
        setAssessmentModal({
          open: true,
          type,
          moduleId,
          moduleName
        });
      } else {
        showToast('No questions returned for this assessment.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClickModal = (side: 'left' | 'right', value: string) => {
    if (side === 'left') {
      setAssessmentSelectedMatchKey(value);
    } else {
      if (assessmentSelectedMatchKey) {
        setAssessmentMatches(prev => ({
          ...prev,
          [assessmentSelectedMatchKey]: value
        }));
        setAssessmentSelectedMatchKey(null);
      }
    }
  };

  const handleNextAssessmentQuestion = async () => {
    const q = assessmentQuestions[currentQuestionIdx];
    if (!q) return;

    let val = '';
    if (q.type === 'multiple-choice') {
      val = selectedOpt !== null ? selectedOpt.toString() : '';
    } else if (q.type === 'fill-blank' || q.type === 'output-prediction' || q.type === 'debugging') {
      val = assessmentUserText;
    } else if (q.type === 'match-following') {
      val = JSON.stringify(assessmentMatches);
    }

    const updatedAnswers = {
      ...assessmentAnswers,
      [q.id]: val
    };
    setAssessmentAnswers(updatedAnswers);

    setSelectedOpt(null);
    setAssessmentUserText('');
    setAssessmentMatches({});
    setAssessmentSelectedMatchKey(null);

    if (currentQuestionIdx < assessmentQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setSubmittingAssessment(true);
      try {
        const finalAnswers = Object.entries(updatedAnswers).map(([challengeId, answer]) => ({ challengeId, answer: answer as string }));
        const res = await progressService.submitAssessment({
          trackId: track.id || track._id,
          moduleId: assessmentModal?.moduleId,
          type: assessmentModal!.type,
          answers: finalAnswers
        });

        if (res) {
          setAssessmentResult({
            score: res.score,
            passed: res.passed,
            incorrectQuestions: res.incorrectQuestions || []
          });

          if (res.passed) {
            if (assessmentModal?.type === 'module') {
              setPassedAssessments(prev => [...prev, assessmentModal.moduleId!]);
            } else {
              setTrackAssessmentStatus({ hasPassed: true, bestAttempt: res.score });
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.message || 'Failed to submit assessment.');
      } finally {
        setSubmittingAssessment(false);
      }
    }
  };

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

        <PageHeader 
          title={track.name}
          description={track.description}
          crumbs={[
            { label: 'Learning', path: '/tracks' },
            { label: 'Tracks', path: '/tracks' },
            { label: track.name }
          ]}
        />

        <div className="container">
          {/* Track Stats & Progress */}
          <div className="track-detail__stats card" style={{ marginBottom: '32px', padding: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="track-detail__meta" style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '13px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>{TRACK_ICONS[track.slug] || '📚'}</span>
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
              className="mt-3"
            />
          </div>

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
                      
                      {mod.lessons && mod.lessons.length > 0 && mod.lessons.every(l => completedSet.has(l.id.toString())) && (
                        <div style={{ padding: 'var(--space-4)', margin: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', marginTop: '16px' }}>
                          {passedAssessments.includes(mod.id.toString()) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '13px', fontWeight: 600 }}>
                              <span>🏆</span>
                              <span>Module Assessment Passed! Next module unlocked.</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Module Quiz Assessment Required</h4>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                  Test your understanding with 10 questions. Passing score: 80% (8/10).
                                </p>
                              </div>
                              <button
                                onClick={() => handleStartAssessment('module', mod.id, mod.name)}
                                className="btn btn--primary btn--sm"
                                style={{
                                  background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                                  color: 'white'
                                }}
                              >
                                Take Module Assessment
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="btn btn--primary btn--md"
                      id="view-cert-modal-btn"
                    >
                      View Certificate →
                    </button>
                  )}
                </motion.div>
              ) : (
                <>
                  {!trackAssessmentStatus?.hasPassed ? (
                    <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', marginTop: '16px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Final Track Assessment Required</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 16px' }}>
                        To unlock Capstone Project submission and earn your certificate, you must pass the final track-level comprehensive assessment with an 80% score or higher (16/20 questions).
                      </p>
                      <button
                        onClick={() => handleStartAssessment('track')}
                        className="btn btn--primary btn--md"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                          color: 'white'
                        }}
                      >
                        Take Final Track Assessment
                      </button>
                    </div>
                  ) : (
                    <>
                      {!showCapstone ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--md capstone-section__cta"
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
                          className="btn btn--ghost btn--md"
                          onClick={() => setShowCapstone(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary btn--md"
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
            </>
          )}
            </motion.section>
          )}
        </div>

        {/* Certificate Modal Overlay */}
        {showCertModal && capstoneResult?.certificate && (
          <div className="cert-modal-backdrop" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(9, 11, 18, 0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }} onClick={() => setShowCertModal(false)}>
            <div className="cert-modal-content" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '840px',
              padding: '30px',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              color: 'var(--text-primary)',
              animation: 'scaleIn 0.3s var(--ease-spring)'
            }} onClick={(e) => e.stopPropagation()}>
              
              {/* Close Button */}
              <button 
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowCertModal(false)}
                id="close-cert-modal"
              >
                ✕
              </button>

              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Your Completed Certificate! 🎓</h3>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '24px'
              }}>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn--secondary btn--sm"
                  id="modal-cert-download"
                >
                  📥 Download PDF
                </button>
                <button 
                  onClick={async () => {
                    const url = `${window.location.origin}/certificate/${capstoneResult.certificate.certificate_id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `Learn Station Certificate — ${track.name}`,
                          text: `I completed the ${track.name} track on Learn Station! 🎓`,
                          url
                        });
                      } catch {}
                    } else {
                      await navigator.clipboard.writeText(url);
                      alert('Certificate link copied to clipboard!');
                    }
                  }} 
                  className="btn btn--primary btn--sm"
                  id="modal-cert-share"
                >
                  ✨ Share Achievement
                </button>
                <Link to="/tracks" className="btn btn--secondary btn--sm" onClick={() => setShowCertModal(false)} id="modal-cert-explore">
                  🚀 Explore More Tracks
                </Link>
                <button className="btn btn--secondary btn--sm" onClick={() => setShowCertModal(false)} id="modal-cert-close">
                  ✕ Close
                </button>
              </div>

              {/* Certificate Document Render (copying style from CertificatePage) */}
              <div className="certificate-document" style={{
                border: '2px solid #f59e0b40',
                boxShadow: 'none',
                margin: '0 auto'
              }}>
                {/* Header */}
                <div className="cert-doc__header">
                  <div className="cert-doc__logo">⚡ Learn Station</div>
                  <div className="cert-doc__divider" />
                  <h1 className="cert-doc__title">Certificate of Completion</h1>
                </div>

                {/* Body */}
                <div className="cert-doc__body">
                  <p className="cert-doc__awarded-text">This certifies that</p>
                  <h2 className="cert-doc__recipient">{user?.name || 'Learner'}</h2>
                  <p className="cert-doc__completion-text">has successfully completed the</p>
                  <div className="cert-doc__track-badge" style={{ color: track.color || 'var(--accent-blue)' }}>
                    <span>{track.icon || '📚'}</span>
                    <h3 className="cert-doc__track-name">{track.name}</h3>
                  </div>
                  <p className="cert-doc__desc">
                    demonstrating dedication, persistence, and mastery of core concepts through lessons, quizzes, challenges, and a capstone project.
                  </p>
                </div>

                {/* Footer */}
                <div className="cert-doc__footer">
                  <div className="cert-doc__footer-left">
                    <div className="cert-doc__signature">Learn Station</div>
                    <div className="cert-doc__sig-label">Platform Authority</div>
                  </div>
                  <div className="cert-doc__footer-center">
                    <div className="cert-doc__seal">🎖️</div>
                    <div className="cert-doc__xp">+{capstoneResult.certificate.xp_earned || 500} XP Earned</div>
                  </div>
                  <div className="cert-doc__footer-right">
                    <div className="cert-doc__date">{new Date(capstoneResult.certificate.completion_date || capstoneResult.certificate.created_at).toLocaleDateString()}</div>
                    <div className="cert-doc__id">ID: {capstoneResult.certificate.certificate_id}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {assessmentModal?.open && (
          <div className="cert-modal-backdrop" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(9, 11, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div className="cert-modal-content" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '600px',
              padding: '30px',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              color: 'var(--text-primary)',
              animation: 'scaleIn 0.3s var(--ease-spring)'
            }} onClick={(e) => e.stopPropagation()}>
              
              <button 
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => setAssessmentModal(null)}
              >
                ✕
              </button>

              <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
                {assessmentModal.type === 'module' ? `Module Assessment: ${assessmentModal.moduleName}` : 'Final Track Assessment'}
              </h3>

              {assessmentResult ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
                    {assessmentResult.passed ? '🏆' : '⚠️'}
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                    {assessmentResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    You scored <strong>{assessmentResult.score}%</strong>. Minimum score to pass: 80%.
                  </p>

                  {!assessmentResult.passed && (
                    <div style={{ marginTop: '16px', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--accent-rose)', display: 'block', marginBottom: '6px' }}>Recommended Revision Topics:</strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                        Review the lessons in this module to solidify your understanding of syntax and application rules, then try again.
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {!assessmentResult.passed && (
                      <button 
                        onClick={() => handleStartAssessment(assessmentModal.type, assessmentModal.moduleId, assessmentModal.moduleName)} 
                        className="btn btn--primary btn--sm"
                      >
                        Retry Assessment
                      </button>
                    )}
                    <button onClick={() => setAssessmentModal(null)} className="btn btn--secondary btn--sm">
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                assessmentQuestions[currentQuestionIdx] && (
                  <div className="lesson-challenge">
                    <span className="lesson-challenge__counter">
                      Question {currentQuestionIdx + 1} of {assessmentQuestions.length}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                      {assessmentQuestions[currentQuestionIdx].question}
                    </h4>

                    {/* MCQ */}
                    {assessmentQuestions[currentQuestionIdx].type === 'multiple-choice' && (
                      <div className="lesson-challenge__options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {assessmentQuestions[currentQuestionIdx].options?.map((opt: string, i: number) => {
                          const isSelected = selectedOpt === i;
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedOpt(i)}
                              className={`challenge-option ${isSelected ? 'challenge-option--selected' : ''}`}
                            >
                              <span className="challenge-option__letter">{String.fromCharCode(65 + i)}</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill Blanks */}
                    {assessmentQuestions[currentQuestionIdx].type === 'fill-blank' && (
                      <div className="lesson-challenge__template">
                        {assessmentQuestions[currentQuestionIdx].template?.split('___').map((part: string, i: number, arr: any[]) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <input
                                type="text"
                                className="challenge-fill-input"
                                value={assessmentUserText}
                                onChange={e => setAssessmentUserText(e.target.value)}
                                style={{ width: '100px', display: 'inline-block' }}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Output Prediction */}
                    {assessmentQuestions[currentQuestionIdx].type === 'output-prediction' && (
                      <div>
                        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '11px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                          {assessmentQuestions[currentQuestionIdx].starter_code}
                        </pre>
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Predict expected console output or return value:</label>
                          <input
                            type="text"
                            className="challenge-fill-input"
                            placeholder="Type output..."
                            value={assessmentUserText}
                            onChange={e => setAssessmentUserText(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Match Following */}
                    {assessmentQuestions[currentQuestionIdx].type === 'match-following' && (
                      <div>
                        <div className="match-grid-layout">
                          <div className="match-column">
                            {Object.keys(assessmentQuestions[currentQuestionIdx].pairs || {}).map(k => {
                              const isSelected = assessmentSelectedMatchKey === k;
                              const isMatched = !!assessmentMatches[k];
                              return (
                                <div 
                                  key={k} 
                                  onClick={() => !isMatched && handleMatchClickModal('left', k)}
                                  className={`match-card ${isSelected ? 'match-card--selected' : ''} ${isMatched ? 'match-card--disabled' : ''}`}
                                >
                                  {k} {isMatched && `➔ ${assessmentMatches[k]}`}
                                </div>
                              );
                            })}
                          </div>
                          <div className="match-column">
                            {Object.values(assessmentQuestions[currentQuestionIdx].pairs || {}).sort(() => 0.5 - Math.random()).map((v: any) => {
                              const isMatched = Object.values(assessmentMatches).includes(v);
                              return (
                                <div 
                                  key={v} 
                                  onClick={() => !isMatched && handleMatchClickModal('right', v)}
                                  className={`match-card ${isMatched ? 'match-card--disabled' : ''}`}
                                >
                                  {v}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Debugging */}
                    {assessmentQuestions[currentQuestionIdx].type === 'debugging' && (
                      <div>
                        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderLeft: '3px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '11px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                          {assessmentQuestions[currentQuestionIdx].starter_code}
                        </pre>
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Provide the corrected code line or statement:</label>
                          <input
                            type="text"
                            className="challenge-fill-input"
                            placeholder="Type fixed line..."
                            value={assessmentUserText}
                            onChange={e => setAssessmentUserText(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button
                        onClick={handleNextAssessmentQuestion}
                        className="btn btn--primary btn--md"
                        disabled={submittingAssessment}
                      >
                        {submittingAssessment ? 'Submitting...' : (currentQuestionIdx < assessmentQuestions.length - 1 ? 'Next Question →' : 'Submit Assessment')}
                      </button>
                    </div>

                  </div>
                )
              )}

            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
