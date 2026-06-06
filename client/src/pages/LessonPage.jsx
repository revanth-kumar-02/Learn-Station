import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import InteractivePlayground from '../components/common/InteractivePlayground';
import ProgressBar from '../components/common/ProgressBar';
import { getEnhancedLessonData, parseMarkdown } from '../utils/lessonHelper';

const TABS = [
  { label: 'Concept', icon: '📖' },
  { label: 'Example', icon: '💻' },
  { label: 'Practice', icon: '✍️' },
  { label: 'Check', icon: '❓' },
  { label: 'Summary', icon: '🏆' }
];

// Replicate level math from backend
const calculateLevel = (totalXP) => {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + 100 * level <= totalXP) {
    xpNeeded += 100 * level;
    level++;
  }
  return level;
};

const xpForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 100 * i;
  }
  return total;
};

const xpProgressInLevel = (totalXP) => {
  const level = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return {
    level,
    xpInLevel,
    xpNeeded,
    progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 1,
  };
};

export default function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [practiceDone, setPracticeDone] = useState(false);
  const [allCorrect, setAllCorrect] = useState(true);
  const [reward, setReward] = useState(null);
  
  const popoverRefs = useRef({});

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activePopover && popoverRefs.current[activePopover] && !popoverRefs.current[activePopover].contains(e.target)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activePopover]);

  // Fetch lesson data and related track/progress
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const data = await lessonService.getBySlug(slug);
        setLesson(data.lesson);
        setTrack(data.track);
        setProgress(data.progress);
        setIsLocked(false);
        
        // Reset states for new lesson
        setChallengeIndex(0);
        setUserAnswer('');
        setSelectedOption(null);
        setFeedback(null);
        setPracticeDone(false);
        setAllCorrect(true);
        setReward(null);
        
        // If already completed, unlock all tabs
        if (data.isCompleted) {
          setMaxStepReached(4);
          setCurrentStep(0);
        } else {
          setMaxStepReached(0);
          setCurrentStep(0);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          setIsLocked(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  if (loading) return <Loader fullPage />;
  
  if (isLocked) {
    return (
      <PageTransition>
        <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-8)', textAlign: 'center', border: '1px solid hsla(346, 77%, 50%, 0.3)', boxShadow: '0 0 20px hsla(346, 77%, 50%, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🔒</div>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--accent-rose)', marginBottom: 'var(--space-2)' }}>Lesson Locked</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
              This lesson is locked. Complete the previous lesson and its challenges in sequence to unlock this content.
            </p>
            <Button onClick={() => navigate(-1)} variant="primary" size="lg" className="w-full">
              Back to Track
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  if (!lesson || !track || !progress) {
    return <div className="container" style={{ paddingTop: '120px' }}><h2>Lesson or track not found</h2></div>;
  }

  // Calculate enhanced fields (Learning Objective, Scenarios, Key Terms definitions)
  const enhanced = getEnhancedLessonData(lesson);

  // Roadmap unlocking computations
  const completedLessonsSet = new Set((progress.completedLessons || []).map(l => l.toString()));
  const completedChallengesSet = new Set((progress.completedChallenges || []).map(c => c.toString()));

  const areLessonChallengesCompleted = (les) => {
    if (!les.challengeIds || les.challengeIds.length === 0) return true;
    return les.challengeIds.every(cid => completedChallengesSet.has(cid.toString()));
  };

  // Find the first incomplete lesson in the track (active lesson)
  let currentTrackLessonId = null;
  for (const m of track.modules) {
    for (const l of m.lessons || []) {
      if (!completedLessonsSet.has(l.id.toString())) {
        currentTrackLessonId = l.id.toString();
        break;
      }
    }
    if (currentTrackLessonId) break;
  }

  // Module lock map
  const moduleUnlocked = {};
  track.modules.forEach((mod, idx) => {
    if (idx === 0) {
      moduleUnlocked[mod.id] = true;
    } else {
      const prevMod = track.modules[idx - 1];
      const allCompleted = prevMod.lessons && prevMod.lessons.length > 0 && prevMod.lessons.every(l => completedLessonsSet.has(l.id.toString()));
      moduleUnlocked[mod.id] = allCompleted;
    }
  });

  const checkIsLessonUnlocked = (mod, les, li) => {
    if (completedLessonsSet.has(les.id.toString())) return true;
    if (!moduleUnlocked[mod.id]) return false;
    if (li === 0) return true;
    
    const prevLes = mod.lessons[li - 1];
    const prevCompleted = completedLessonsSet.has(prevLes.id.toString());
    const prevChallengesCompleted = areLessonChallengesCompleted(prevLes);
    
    return prevCompleted && prevChallengesCompleted;
  };

  // User Profile Progress computations
  const levelProgress = xpProgressInLevel(user?.xp || 0);

  // Next lesson calculation
  const getNextLesson = () => {
    let foundCurrent = false;
    for (const m of track.modules) {
      for (const l of m.lessons) {
        if (foundCurrent) return l;
        if (l.id.toString() === lesson.id.toString()) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };
  const nextLesson = getNextLesson();

  // Navigation handlers
  const handleTabClick = (tabIndex) => {
    if (tabIndex <= maxStepReached || completedLessonsSet.has(lesson.id.toString())) {
      setCurrentStep(tabIndex);
      setFeedback(null);
      setSelectedOption(null);
      setUserAnswer('');
    }
  };

  const handleNextStepButton = () => {
    setFeedback(null);
    setSelectedOption(null);
    setUserAnswer('');
    
    const nextStep = currentStep + 1;
    if (nextStep <= 4) {
      setMaxStepReached(prev => Math.max(prev, nextStep));
      setCurrentStep(nextStep);
    }
  };

  const handlePracticeSubmit = () => {
    setPracticeDone(true);
  };

  const handleChallengeSubmit = () => {
    const challenge = lesson.challenges[challengeIndex];
    let isCorrect = false;

    if (challenge.type === 'multiple-choice') {
      isCorrect = selectedOption === challenge.correctIndex;
    } else if (challenge.type === 'fill-blank') {
      isCorrect = userAnswer.trim().toLowerCase() === challenge.answer.toLowerCase();
    }

    if (!isCorrect) setAllCorrect(false);

    setFeedback({
      correct: isCorrect,
      explanation: challenge.explanation,
    });

    setTimeout(() => {
      if (challengeIndex < lesson.challenges.length - 1) {
        setChallengeIndex(challengeIndex + 1);
        setFeedback(null);
        setSelectedOption(null);
        setUserAnswer('');
      } else {
        // Complete the lesson
        completeLesson();
      }
    }, 2500);
  };

  const completeLesson = async () => {
    try {
      const result = await lessonService.complete(slug, allCorrect);
      setReward(result);
      updateUser({
        xp: result.totalXp,
        level: result.level,
        streak: result.streak,
        dailyXpEarned: result.dailyXpEarned,
      });
      // Collect the IDs of all challenges in the completed lesson
      const completedLessonChallengeIds = (lesson.challenges || []).map(c => c.id);
      // Refresh local progress state – including challenges so next lesson unlocks immediately
      setProgress(prev => ({
        ...prev,
        completedLessons: [...(prev.completedLessons || []), lesson.id],
        completedChallenges: [...(prev.completedChallenges || []), ...completedLessonChallengeIds],
      }));
      setMaxStepReached(4);
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      setMaxStepReached(4);
      setCurrentStep(4);
    }
  };

  const handleLessonClick = (clickedLesson, isUnlocked) => {
    if (!isUnlocked) return;
    setIsSidebarOpen(false);
    navigate(`/lesson/${clickedLesson.slug}`);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 150 : -150, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -150 : 150, opacity: 0 }),
  };

  return (
    <PageTransition>
      <div className="lesson-workspace">
        
        {/* Backdrop for Mobile Sidebar drawer */}
        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className="lesson-workspace-container">
          
          {/* Left Sidebar: Roadmap Navigation */}
          <aside className={`lesson-workspace-sidebar ${isSidebarOpen ? 'lesson-workspace-sidebar--open' : 'lesson-workspace-sidebar--collapsed'}`}>
            <div className="lesson-sidebar-header">
              <h3>
                <span>🗺️</span> {track.name} Roadmap
              </h3>
            </div>
            <div className="lesson-sidebar-modules">
              {track.modules?.map((mod, mi) => (
                <div key={mod.id} className="lesson-sidebar-module">
                  <div className="lesson-sidebar-module-title" title={mod.name}>
                    {mod.name}
                  </div>
                  <div className="lesson-sidebar-lessons">
                    {mod.lessons?.map((les, li) => {
                      const isCompleted = completedLessonsSet.has(les.id.toString());
                      const isUnlocked = checkIsLessonUnlocked(mod, les, li);
                      const isCurrent = les.id.toString() === lesson.id.toString();
                      
                      return (
                        <div
                          key={les.id}
                          className={`lesson-sidebar-lesson ${isCompleted ? 'lesson-sidebar-lesson--completed' : ''} ${isCurrent ? 'lesson-sidebar-lesson--current' : ''} ${!isUnlocked ? 'lesson-sidebar-lesson--locked' : ''}`}
                          onClick={() => handleLessonClick(les, isUnlocked)}
                          style={isCurrent ? { color: track.color } : {}}
                        >
                          <div className="lesson-sidebar-lesson-icon">
                            {isCompleted ? (
                              <span style={{ color: 'var(--accent-green)' }}>✓</span>
                            ) : !isUnlocked ? (
                              <span>🔒</span>
                            ) : isCurrent ? (
                              <span className="lesson-row__dot--active" style={{ background: track.color, width: '8px', height: '8px', borderRadius: '50%' }} />
                            ) : (
                              <span>○</span>
                            )}
                          </div>
                          <span className="lesson-sidebar-lesson-title" title={les.title}>
                            {les.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Central Workspace Content Area */}
          <div className="lesson-workspace-content">
            
            {/* Top Dashboard: Track Progress & XP stats */}
            <div className="lesson-workspace-progress">
              <div className="workspace-progress-stat">
                <div className="workspace-progress-stat__icon">🔥</div>
                <div className="workspace-progress-stat__info">
                  <span className="workspace-progress-stat__label">Streak</span>
                  <span className="workspace-progress-stat__value">{user?.streak || 0} Days</span>
                </div>
              </div>

              <div className="workspace-progress-stat">
                <div className="workspace-progress-stat__icon" style={{ color: 'var(--accent-violet)' }}>⭐</div>
                <div className="workspace-progress-stat__info">
                  <span className="workspace-progress-stat__label">Level {levelProgress.level}</span>
                  <span className="workspace-progress-stat__value">{user?.xp || 0} XP</span>
                </div>
              </div>

              <div className="workspace-progress-track-bar">
                <div className="workspace-progress-track-bar__label">
                  <span>Track Progress</span>
                  <span style={{ color: track.color }}>{progress.progressPercent || 0}%</span>
                </div>
                <ProgressBar
                  value={progress.progressPercent || 0}
                  max={100}
                  color={track.color}
                  size="sm"
                />
              </div>
            </div>

            {/* Mobile Roadmap Sidebar toggle button */}
            <button
              className="mobile-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              🗺️ {isSidebarOpen ? 'Hide Track Roadmap' : 'Show Track Roadmap'}
            </button>

            {/* Premium Segmented Tabs */}
            <nav className="premium-tabs">
              {TABS.map((tab, idx) => {
                const isTabUnlocked = idx <= maxStepReached || completedLessonsSet.has(lesson.id.toString());
                const isActive = currentStep === idx;
                
                return (
                  <button
                    key={idx}
                    className={`tab-button ${isActive ? 'tab-button--active' : ''}`}
                    onClick={() => handleTabClick(idx)}
                    disabled={!isTabUnlocked}
                    style={isActive ? { borderColor: track.color } : {}}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Step Contents */}
            <div className="workspace-main-card-layout">
              <AnimatePresence mode="wait">
                
                {/* 1. CONCEPT STEP */}
                {currentStep === 0 && (
                  <motion.div
                    key="concept-tab"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    {/* Learning Objective Card */}
                    <div className="lesson-card learning-objective-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">🎯</span>
                        <h3>Learning Objective</h3>
                      </div>
                      <ul className="learning-objective-list">
                        {enhanced.learningObjective.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Concept Content Card */}
                    <div className="lesson-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">📖</span>
                        <h3>{lesson.concept?.title || 'Core Concept'}</h3>
                      </div>
                      <div
                        className="lesson-concept"
                        style={{ padding: 'var(--space-2) 0' }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(lesson.concept?.content) }}
                      />
                    </div>

                    {/* Real World Scenario Card */}
                    <div className="lesson-card real-world-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">💼</span>
                        <h3>Real World Application</h3>
                      </div>
                      <div className="real-world-sections">
                        <div className="real-world-section">
                          <span className="real-world-section__label">Why does this matter?</span>
                          <p className="real-world-section__text">{enhanced.realWorldScenario.whyItMatters}</p>
                        </div>
                        <div className="real-world-section">
                          <span className="real-world-section__label">How is it used in industry?</span>
                          <p className="real-world-section__text">{enhanced.realWorldScenario.industryUsage}</p>
                        </div>
                        <div className="real-world-section">
                          <span className="real-world-section__label">Realistic Scenario</span>
                          <p className="real-world-section__text" style={{ fontStyle: 'italic' }}>
                            {enhanced.realWorldScenario.realisticExample}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Terms Card */}
                    {enhanced.keyTerms && enhanced.keyTerms.length > 0 && (
                      <div className="lesson-card key-terms-card">
                        <div className="lesson-card__header">
                          <span className="lesson-card__icon">💡</span>
                          <h3>Key Terms Glossary</h3>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                          Click a term to read its definition:
                        </p>
                        <div className="key-terms-chips">
                          {enhanced.keyTerms.map(({ term, definition }, i) => (
                            <div
                              key={i}
                              className="key-term-chip-container"
                              ref={(el) => (popoverRefs.current[term] = el)}
                            >
                              <button
                                className="key-term-chip"
                                onClick={() => setActivePopover(activePopover === term ? null : term)}
                              >
                                {term}
                              </button>
                              {activePopover === term && (
                                <div className="key-term-popover">
                                  <p>{definition}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={handleNextStepButton} variant="primary" size="lg" className="lesson-next" style={{ background: track.color }}>
                      See Example →
                    </Button>
                  </motion.div>
                )}

                {/* 2. EXAMPLE STEP */}
                {currentStep === 1 && (
                  <motion.div
                    key="example-tab"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <div className="lesson-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">💻</span>
                        <h3>Interactive Example</h3>
                      </div>
                      <div className="lesson-example">
                        <pre className="lesson-example__code">
                          <code>{lesson.example?.code}</code>
                        </pre>
                        {lesson.example?.explanation && (
                          <div className="lesson-example__explanation" style={{ borderColor: track.color, background: 'var(--bg-primary)' }}>
                            {lesson.example.explanation}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button onClick={handleNextStepButton} variant="primary" size="lg" className="lesson-next" style={{ background: track.color }}>
                      Try Practice →
                    </Button>
                  </motion.div>
                )}

                {/* 3. PRACTICE STEP */}
                {currentStep === 2 && (
                  <motion.div
                    key="practice-tab"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <div className="lesson-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">✍️</span>
                        <h3>Active Practice</h3>
                      </div>
                      <div className="lesson-practice">
                        <p style={{ marginBottom: 'var(--space-4)' }}>{lesson.practice?.instruction}</p>
                        
                        <InteractivePlayground
                          language={lesson.example?.language || 'javascript'}
                          template={lesson.practice?.template}
                          instruction={lesson.practice?.instruction}
                          answer={lesson.practice?.answer}
                          onCorrect={handlePracticeSubmit}
                        />
                      </div>
                    </div>

                    {practiceDone && (
                      <Button onClick={handleNextStepButton} variant="primary" size="lg" className="lesson-next" style={{ background: track.color }}>
                        Take Challenge →
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* 4. CHECK STEP */}
                {currentStep === 3 && (
                  <motion.div
                    key="check-tab"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    {lesson.challenges?.[challengeIndex] && (
                      <div className="lesson-card">
                        <div className="lesson-challenge">
                          <div className="lesson-challenge__counter">
                            Challenge {challengeIndex + 1} of {lesson.challenges.length}
                          </div>
                          <h3 style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-2) 0 var(--space-6)' }}>
                            {lesson.challenges[challengeIndex].question}
                          </h3>

                          {lesson.challenges[challengeIndex].type === 'multiple-choice' && (
                            <div className="lesson-challenge__options">
                              {lesson.challenges[challengeIndex].options?.map((opt, i) => (
                                <button
                                  key={i}
                                  className={`challenge-option ${selectedOption === i ? 'challenge-option--selected' : ''} ${
                                    feedback
                                      ? i === lesson.challenges[challengeIndex].correctIndex
                                        ? 'challenge-option--correct'
                                        : selectedOption === i
                                        ? 'challenge-option--wrong'
                                        : ''
                                      : ''
                                  }`}
                                  onClick={() => !feedback && setSelectedOption(i)}
                                  disabled={!!feedback}
                                  style={selectedOption === i ? { borderColor: track.color } : {}}
                                >
                                  <span className="challenge-option__letter">{String.fromCharCode(65 + i)}</span>
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {lesson.challenges[challengeIndex].type === 'fill-blank' && (
                            <div className="lesson-challenge__fill">
                              <div className="lesson-challenge__template" style={{ background: 'var(--bg-primary)' }}>
                                <code>
                                  {lesson.challenges[challengeIndex].template?.split('___').map((part, i, arr) => (
                                    <span key={i}>
                                      {part}
                                      {i < arr.length - 1 && (
                                        <input
                                          className={`challenge-fill-input ${feedback ? (feedback.correct ? 'challenge-fill-input--correct' : 'challenge-fill-input--wrong') : ''}`}
                                          value={userAnswer}
                                          onChange={(e) => setUserAnswer(e.target.value)}
                                          placeholder="..."
                                          disabled={!!feedback}
                                          onKeyDown={(e) => e.key === 'Enter' && handleChallengeSubmit()}
                                          style={{ borderColor: track.color }}
                                        />
                                      )}
                                    </span>
                                  ))}
                                </code>
                              </div>
                            </div>
                          )}

                          {feedback && (
                            <motion.div
                              className={`challenge-feedback ${feedback.correct ? 'challenge-feedback--correct' : 'challenge-feedback--wrong'}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <span className="challenge-feedback__icon">{feedback.correct ? '✓' : '✗'}</span>
                              <div>
                                <strong>{feedback.correct ? 'Correct!' : 'Not quite'}</strong>
                                <p>{feedback.explanation}</p>
                              </div>
                            </motion.div>
                          )}

                          {!feedback && (
                            <Button
                              onClick={handleChallengeSubmit}
                              variant="primary"
                              size="lg"
                              className="lesson-next"
                              disabled={selectedOption === null && !userAnswer.trim()}
                              style={{ background: track.color }}
                            >
                              Submit Answer
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. SUMMARY STEP */}
                {currentStep === 4 && (
                  <motion.div
                    key="summary-tab"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Summary Cards */}
                    <div className="lesson-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                      <div className="lesson-reward__icon" style={{ fontSize: '72px', margin: '0 0 var(--space-4)' }}>🎉</div>
                      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Lesson Complete!</h2>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                        You've completed <strong>{lesson.title}</strong> and acquired the core skills of this unit.
                      </p>
                      
                      <div className="lesson-reward__xp" style={{ background: 'hsla(38, 92%, 50%, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                        <span className="lesson-reward__xp-label">XP Earned</span>
                        <span className="lesson-reward__xp-value">+{reward?.xpEarned || lesson.xpReward} XP</span>
                      </div>

                      {reward?.newAchievements?.length > 0 && (
                        <div className="lesson-reward__achievements" style={{ marginTop: 'var(--space-4)' }}>
                          {reward.newAchievements.map((a) => (
                            <div key={a.id} className="lesson-reward__achievement" style={{ background: 'hsla(262, 83%, 58%, 0.08)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                              <span className="lesson-reward__achievement-icon">{a.icon}</span>
                              <div>
                                <strong>{a.name}</strong>
                                <p>{a.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lesson-card">
                      <div className="lesson-card__header">
                        <span className="lesson-card__icon">📝</span>
                        <h3>Key Takeaways Summary</h3>
                      </div>
                      <ul className="learning-objective-list">
                        {enhanced.summaryPoints.map((pt, i) => (
                          <li key={i} style={{ listStyleType: 'checkmark' }}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Lesson Card */}
                    {nextLesson ? (
                      <div className="next-lesson-card" style={{ borderColor: `${track.color}40` }}>
                        <div className="next-lesson-card__info">
                          <span className="next-lesson-card__badge" style={{ color: track.color }}>Next Lesson</span>
                          <h4 className="next-lesson-card__title">{nextLesson.title}</h4>
                          <div className="next-lesson-card__meta">
                            <span className="next-lesson-card__meta-item">
                              ⏱ {nextLesson.estimatedMinutes || 5} Min
                            </span>
                            <span className="next-lesson-card__meta-item" style={{ color: 'var(--accent-amber)' }}>
                              ✦ {nextLesson.xpReward || 50} XP
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn--continue-next"
                          onClick={() => navigate(`/lesson/${nextLesson.slug}`)}
                          style={{ background: track.color }}
                        >
                          Continue Learning →
                        </button>
                      </div>
                    ) : (
                      <div className="next-lesson-card" style={{ borderColor: 'var(--accent-green-glow)' }}>
                        <div className="next-lesson-card__info">
                          <span className="next-lesson-card__badge" style={{ color: 'var(--accent-green)' }}>Module Complete</span>
                          <h4 className="next-lesson-card__title">Track Milestone Reached!</h4>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                            You have completed all lessons in this track. Time to start the capstone project or another course.
                          </p>
                        </div>
                        <button
                          className="btn--continue-next"
                          onClick={() => navigate(`/track/${track.slug}`)}
                          style={{ background: 'var(--accent-green)' }}
                        >
                          Back to Track →
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
