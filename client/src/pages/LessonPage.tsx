import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonService, aiService } from '../services/userService';
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

const AiMentorIcon = ({ className = '' }: { className?: string }) => (
  <span className="ai-mentor-icon-container">
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ai-mentor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#ai-mentor-grad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <path d="M12 6v12M6 12h12" stroke="url(#ai-mentor-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8l8 8M8 16l8-8" stroke="url(#ai-mentor-grad)" strokeWidth="1" opacity="0.4" />
      <circle cx="12" cy="12" r="3" fill="url(#ai-mentor-grad)" />
      <path d="M19 5l.5 1L20.5 6.5l-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" fill="#a855f7" />
      <path d="M5 19l.5 1L6.5 20.5l-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" fill="#3b82f6" />
    </svg>
  </span>
);

const SuccessIcon = () => (
  <div className="success-icon-wrapper">
    <svg className="success-icon-svg" viewBox="0 0 52 52">
      <circle className="success-icon-circle" cx="26" cy="26" r="25" fill="none" stroke="var(--accent-green)" strokeWidth="2" />
      <path className="success-icon-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="var(--accent-green)" strokeWidth="3" />
    </svg>
  </div>
);

export default function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [practiceDone, setPracticeDone] = useState(false);
  const [reward, setReward] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const popoverRefs = useRef({});

  // AI Mentor state
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const mentorEndRef = useRef(null);

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
        
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyMissions = user?.daily_missions;
        const completedToday = (dailyMissions && dailyMissions.date === todayStr) ? (dailyMissions.completedLessonsToday || []) : [];
        
        if (!data.isCompleted && completedToday.length >= 4) {
          setIsDailyLimitReached(true);
        } else {
          setIsDailyLimitReached(false);
        }
        
        // Reset states for new lesson
        setChallengeIndex(0);
        setUserAnswer('');
        setSelectedOption(null);
        setFeedback(null);
        setPracticeDone(false);
        setReward(null);
        setQuizScore(0);
        setQuizAnswers([]);
        setQuizSubmitted(false);
        setShowSuccessOverlay(false);
        setIsCompleting(false);
        
        // If already completed, unlock all tabs
        if (data.isCompleted) {
          setMaxStepReached(4);
          setCurrentStep(0);
        } else {
          setMaxStepReached(0);
          setCurrentStep(0);
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          if (err.response.data?.limitReached) {
            setIsDailyLimitReached(true);
          } else {
            setIsLocked(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  if (loading) return <Loader fullPage />;
  
  if (isDailyLimitReached) {
    const dailyMissions = user?.daily_missions;
    const completedToday = (dailyMissions && dailyMissions.date === new Date().toISOString().split('T')[0]) ? (dailyMissions.completedLessonsToday || []) : [];
    return (
      <PageTransition>
        <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: 'var(--space-8)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🎯</div>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontWeight: 800 }}>Daily Learning Goal Reached</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
              You have completed today's roadmap lessons. Return tomorrow to unlock new lessons.
            </p>
            
            {/* Progress Display */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Progress</span>
                <span>{completedToday.length} / 4 Lessons Completed</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (completedToday.length / 4) * 100)}%`, backgroundColor: 'var(--accent-violet)', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button onClick={() => navigate('/practice')} variant="primary" size="lg" className="w-full" style={{ background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)', border: 'none' }}>
                🚀 Go to Practice Hub
              </Button>
              <Button onClick={() => navigate('/tracks')} variant="ghost" size="lg" className="w-full" style={{ border: '1px solid var(--border)' }}>
                Browse Other Tracks
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

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

    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    const updatedAnswers = [...quizAnswers];
    updatedAnswers[challengeIndex] = {
      isCorrect,
      question: challenge.question,
      userAnswer: challenge.type === 'multiple-choice' ? challenge.options[selectedOption] : userAnswer,
      correctAnswer: challenge.type === 'multiple-choice' ? challenge.options[challenge.correctIndex] : challenge.answer,
      explanation: challenge.explanation
    };
    setQuizAnswers(updatedAnswers);

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
        setQuizSubmitted(true);
        const passed = newScore >= 4;
        if (passed) {
          setMaxStepReached(4);
        }
      }
    }, 2500);
  };

  const completeLesson = async (score, passed) => {
    setIsCompleting(true);
    try {
      const result = await lessonService.complete(slug, score, passed);
      setReward(result);
      updateUser({
        xp: result.totalXp,
        level: result.level,
        streak: result.streak,
        dailyXpEarned: result.dailyXpEarned,
      });
      const completedLessonChallengeIds = (lesson.challenges || []).map(c => c.id);
      setProgress(prev => ({
        ...prev,
        completedLessons: [...(prev.completedLessons || []), lesson.id],
        completedChallenges: [...(prev.completedChallenges || []), ...completedLessonChallengeIds],
        progressPercent: result.progressPercent,
      }));
      setShowSuccessOverlay(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRetryQuiz = () => {
    setChallengeIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback(null);
    setQuizScore(0);
    setQuizAnswers([]);
    setQuizSubmitted(false);
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

  const sendMentorMessage = async (text?: string, mode = 'default') => {
    const msg = text || mentorInput.trim();
    if (!msg || mentorLoading) return;
    setMentorInput('');
    setMentorMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setMentorLoading(true);
    try {
      const result = await aiService.mentor(msg, lesson?.slug, track?.slug, mode);
      setMentorMessages((prev) => [...prev, { role: 'assistant', text: result.response }]);
    } catch {
      setMentorMessages((prev) => [...prev, { role: 'assistant', text: '⚠️ Could not reach the AI Mentor. Make sure the backend server is running.' }]);
    } finally {
      setMentorLoading(false);
      setTimeout(() => mentorEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
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
              {track.modules?.map((mod) => (
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
                              ref={(el) => { popoverRefs.current[term] = el; }}
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
                    {quizSubmitted ? (
                      <div className={`quiz-results ${quizScore >= 4 ? 'quiz-results--pass' : 'quiz-results--fail'}`}>
                        {quizScore >= 4 ? (
                          <>
                            <SuccessIcon />
                            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>Quiz Passed!</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', maxWidth: '440px' }}>
                              Excellent work! You have passed the lesson assessment.
                            </p>

                            <div className="quiz-score-display">
                              <span className="quiz-score-number">{quizScore}</span>
                              <span className="quiz-score-total">/ {lesson.challenges.length}</span>
                            </div>

                            <div className="quiz-xp-badge">
                              <span>⚡</span>
                              <span>+{lesson.xpReward + (quizScore === 5 ? 15 : 0)} XP Earned</span>
                            </div>

                            <Button 
                              onClick={() => handleTabClick(4)} 
                              variant="primary" 
                              size="lg" 
                              className="w-full" 
                              style={{ background: 'var(--accent-green)' }}
                            >
                              Continue to Summary →
                            </Button>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '64px', marginBottom: 'var(--space-2)' }}>❌</div>
                            <h2>Quiz Failed</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                              You need at least 4/5 correct answers to pass. Review the explanations below and try again.
                            </p>

                            <div className="quiz-score-display">
                              <span className="quiz-score-number">{quizScore}</span>
                              <span className="quiz-score-total">/ {lesson.challenges.length}</span>
                            </div>
                            <div className="quiz-explanation-list">
                              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Review Your Answers</h3>
                              {lesson.challenges.map((challenge, idx) => {
                                const ans = quizAnswers[idx] || {};
                                return (
                                  <div 
                                    key={idx} 
                                    className={`quiz-explanation-item ${ans.isCorrect ? 'quiz-explanation-item--correct' : 'quiz-explanation-item--wrong'}`}
                                  >
                                    <div className="quiz-explanation-q">
                                      <span>{idx + 1}.</span>
                                      <span>{challenge.question}</span>
                                    </div>
                                    <div className="quiz-explanation-ans-block">
                                      <div className="quiz-explanation-ans">
                                        <strong style={{ color: ans.isCorrect ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                                          Your Answer:
                                        </strong>
                                        <span>{ans.userAnswer || 'No answer'}</span>
                                      </div>
                                      {!ans.isCorrect && (
                                        <div className="quiz-explanation-ans">
                                          <strong style={{ color: 'var(--accent-green)' }}>Correct Answer:</strong>
                                          <span>{ans.correctAnswer}</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="quiz-explanation-text">
                                      <strong>Explanation:</strong> {challenge.explanation}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <Button 
                              onClick={handleRetryQuiz} 
                              variant="primary" 
                              size="lg" 
                              className="retry-btn" 
                              style={{ background: track.color }}
                            >
                              🔄 Retry Quiz
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      lesson.challenges?.[challengeIndex] && (
                        <div className="lesson-card">
                          <div className="lesson-challenge">
                            <div className="quiz-progress-container">
                              <span className="quiz-progress-text">Question {challengeIndex + 1} of {lesson.challenges.length}</span>
                              <div className="quiz-progress-bar-bg">
                                <div className="quiz-progress-bar-fill" style={{ width: `${((challengeIndex) / lesson.challenges.length) * 100}%`, background: track.color }} />
                              </div>
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
                      )
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

                      {reward?.bonusXp > 0 && (
                        <div style={{ display: 'block', marginTop: 'var(--space-2)' }}>
                          <div className="quiz-bonus-badge">
                            <span>🏆</span>
                            <span>Perfect Score Bonus! +{reward.bonusXp} XP Awarded</span>
                          </div>
                        </div>
                      )}

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

                    {/* Complete Lesson Button or Next Lesson Card */}
                    {!completedLessonsSet.has(lesson.id.toString()) ? (
                      <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          onClick={() => completeLesson(quizScore, true)} 
                          variant="primary" 
                          size="lg" 
                          className="w-full"
                          disabled={isCompleting}
                          style={{ background: 'var(--accent-violet)', border: 'none', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                        >
                          {isCompleting ? 'Saving Progress...' : 'Complete Lesson 🚀'}
                        </Button>
                      </div>
                    ) : (
                      nextLesson ? (
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
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* AI Mentor Floating Button */}
        <button
          className={`mentor-fab ${mentorOpen ? 'mentor-fab--active' : ''}`}
          onClick={() => setMentorOpen(!mentorOpen)}
          id="ai-mentor-fab"
          title="AI Mentor"
        >
          {mentorOpen ? '✕' : <AiMentorIcon />}
        </button>

        {/* AI Mentor Drawer */}
        <AnimatePresence>
          {mentorOpen && (
            <motion.aside
              className="mentor-drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="mentor-drawer__header">
                <div className="mentor-drawer__title">
                  <AiMentorIcon />
                  <div>
                    <h3>AI Mentor</h3>
                    <p>{lesson?.title}</p>
                  </div>
                </div>
                <button className="mentor-drawer__close" onClick={() => setMentorOpen(false)}>✕</button>
              </div>

              {/* Quick Mode Shortcuts */}
              <div className="mentor-shortcuts">
                <button type="button" className="mentor-shortcut" onClick={() => sendMentorMessage(`Explain "${lesson?.title}" differently using a fresh analogy`, 'explain')}>
                  💡 Explain Differently
                </button>
                <button type="button" className="mentor-shortcut" onClick={() => sendMentorMessage(`Give me a real-world example of "${lesson?.title}"`, 'example')}>
                  🌍 Real-World Example
                </button>
                <button type="button" className="mentor-shortcut" onClick={() => sendMentorMessage(`Create a practice question for me about "${lesson?.title}"`, 'practice')}>
                  ✍️ Practice Question
                </button>
              </div>

              {/* Messages */}
              <div className="mentor-messages">
                {mentorMessages.length === 0 && (
                  <div className="mentor-messages__empty">
                    <AiMentorIcon />
                    <p>Hi! I'm your AI Mentor for this lesson.</p>
                    <p>Ask me anything about <strong>{lesson?.title}</strong> or use the shortcuts above.</p>
                  </div>
                )}
                {mentorMessages.map((msg, i) => (
                  <div key={i} className={`mentor-message mentor-message--${msg.role}`}>
                    {msg.role === 'assistant' && <span className="mentor-message__avatar"><AiMentorIcon /></span>}
                    <div
                      className="mentor-message__text"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown ? parseMarkdown(msg.text) : msg.text }}
                    />
                  </div>
                ))}
                {mentorLoading && (
                  <div className="mentor-message mentor-message--assistant">
                    <span className="mentor-message__avatar"><AiMentorIcon /></span>
                    <div className="mentor-message__typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={mentorEndRef} />
              </div>

              {/* Input */}
              <div className="mentor-input-area">
                <textarea
                  className="mentor-input"
                  placeholder="Ask the AI Mentor anything about this lesson..."
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMentorMessage();
                    }
                  }}
                  rows={3}
                />
                <button
                  type="button"
                  className="mentor-send-btn"
                  onClick={() => sendMentorMessage()}
                  disabled={!mentorInput.trim() || mentorLoading}
                  id="mentor-send-btn"
                >
                  {mentorLoading ? '⏳' : '↑'}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Fullscreen Success Overlay */}
        <AnimatePresence>
          {showSuccessOverlay && (
            <motion.div
              className="success-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="success-overlay-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <div style={{ fontSize: '72px', marginBottom: 'var(--space-2)' }}>🎉</div>
                <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--accent-violet)', marginBottom: 'var(--space-2)' }}>
                  Lesson Mastered!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', maxWidth: '400px' }}>
                  You have successfully completed <strong>{lesson?.title}</strong>!
                </p>

                <div className="success-overlay-reward-grid">
                  <div className="success-overlay-reward-item">
                    <span className="success-overlay-reward-label">XP Gained</span>
                    <span className="success-overlay-reward-value" style={{ color: 'var(--accent-amber)' }}>
                      +{reward?.xpEarned || lesson?.xpReward} XP
                    </span>
                  </div>
                  <div className="success-overlay-reward-item">
                    <span className="success-overlay-reward-label">Bonus XP</span>
                    <span className="success-overlay-reward-value" style={{ color: 'var(--accent-green)' }}>
                      +{reward?.bonusXp || 0} XP
                    </span>
                  </div>
                  <div className="success-overlay-reward-item">
                    <span className="success-overlay-reward-label">Streak</span>
                    <span className="success-overlay-reward-value" style={{ color: 'var(--accent-rose)' }}>
                      🔥 {reward?.streak || user?.streak || 1} Days
                    </span>
                  </div>
                  <div className="success-overlay-reward-item">
                    <span className="success-overlay-reward-label">Level</span>
                    <span className="success-overlay-reward-value" style={{ color: 'var(--accent-blue)' }}>
                      ⭐ Level {reward?.level || user?.level || 1}
                    </span>
                  </div>
                </div>

                {reward?.newAchievements?.length > 0 && (
                  <div style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Achievements Unlocked!
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {reward.newAchievements.map((a) => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '8px 12px', borderRadius: '8px', textAlign: 'left' }}>
                          <span style={{ fontSize: '20px' }}>{a.icon}</span>
                          <div>
                            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>{a.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="success-overlay-btn-group">
                  {nextLesson ? (
                    <Button
                      onClick={() => {
                        setShowSuccessOverlay(false);
                        navigate(`/lesson/${nextLesson.slug}`);
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full"
                      style={{ background: track.color }}
                    >
                      Start Next Lesson →
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => {
                      setShowSuccessOverlay(false);
                      navigate(`/track/${track.slug}`);
                    }}
                    variant="ghost"
                    size="lg"
                    className="w-full"
                  >
                    Return to Roadmap
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
