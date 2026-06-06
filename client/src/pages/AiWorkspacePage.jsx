import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import InteractivePlayground from '../components/common/InteractivePlayground';

export default function AiWorkspacePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('concept'); // concept, example, practice, check, summary

  // Interactive practice states
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceCorrect, setPracticeCorrect] = useState(null); // null, true, false

  // Challenge states
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [challengeCorrect, setChallengeCorrect] = useState(null);

  // Capstone Submission states (Loaded/Persisted to localStorage)
  const [repoUrl, setRepoUrl] = useState(() => {
    try {
      const saved = localStorage.getItem(`learnstation_capstone_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.repoUrl || '';
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  const [demoUrl, setDemoUrl] = useState(() => {
    try {
      const saved = localStorage.getItem(`learnstation_capstone_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.demoUrl || '';
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  const [capstoneSubmitted, setCapstoneSubmitted] = useState(() => {
    try {
      const saved = localStorage.getItem(`learnstation_capstone_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.submitted;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const { data } = await api.get(`/tracks/${slug}`);
        setTrack(data.track);
        setProgress(data.progress);
      } catch (err) {
        console.error('Error loading AI Workspace:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [slug]);

  const loadLessonDetails = async (lessonSlug) => {
    setLoading(true);
    setActiveTab('concept');
    setPracticeInput('');
    setPracticeCorrect(null);
    setCurrentChallengeIndex(0);
    setSelectedOption(null);
    setChallengeInput('');
    setChallengeSubmitted(false);
    setChallengeCorrect(null);

    try {
      const { data } = await api.get(`/lessons/${lessonSlug}`);
      setActiveLesson(data.lesson);
    } catch (err) {
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !track) return <Loader fullPage />;
  if (!track) return <div className="container mt-20"><h2>Workspace not found</h2></div>;

  const trackColor = track.color || 'var(--accent-blue)';
  const completedLessonsSet = new Set((progress?.completedLessons || []).map(l => l.toString()));
  const completedChallengesSet = new Set((progress?.completedChallenges || []).map(c => c.toString()));

  const areLessonChallengesCompleted = (lesson) => {
    if (!lesson.challengeIds || lesson.challengeIds.length === 0) return true;
    return lesson.challengeIds.every(cid => completedChallengesSet.has(cid.toString()));
  };

  // Calculate unlocked modules for AI track
  const moduleUnlocked = {};
  if (track && track.modules && track.modules.length > 0) {
    moduleUnlocked[track.modules[0].id] = true;
    for (let i = 1; i < track.modules.length; i++) {
      const prevMod = track.modules[i - 1];
      const prevModuleLessonsCompleted = prevMod.lessons && prevMod.lessons.length > 0 && prevMod.lessons.every(l => completedLessonsSet.has(l.id.toString()));
      moduleUnlocked[track.modules[i].id] = prevModuleLessonsCompleted;
    }
  }

  // Handle Practice check
  const handleCheckPractice = () => {
    if (!activeLesson) return;
    const isCorrect = practiceInput.trim().toLowerCase() === activeLesson.practice.answer.trim().toLowerCase();
    setPracticeCorrect(isCorrect);
  };

  // Handle Challenge answer
  const handleCheckChallenge = () => {
    if (!activeLesson) return;
    const challenge = activeLesson.challenges[currentChallengeIndex];
    let isCorrect = false;

    if (challenge.type === 'multiple-choice') {
      isCorrect = selectedOption === challenge.correctIndex;
    } else {
      isCorrect = challengeInput.trim().toLowerCase() === challenge.answer.trim().toLowerCase();
    }

    setChallengeCorrect(isCorrect);
    setChallengeSubmitted(true);
  };

  const handleNextChallenge = () => {
    setSelectedOption(null);
    setChallengeInput('');
    setChallengeSubmitted(false);
    setChallengeCorrect(null);
    
    if (currentChallengeIndex < activeLesson.challenges.length - 1) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      setActiveTab('summary');
    }
  };

  // Complete full lesson
  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    
    try {
      const { data } = await api.post(`/lessons/${activeLesson.slug}/complete`, {
        perfectScore: true // simulated for AI generator progress
      });

      // Update local states
      setProgress((prev) => ({
        ...prev,
        completedLessons: [...(prev?.completedLessons || []), activeLesson.id],
        progressPercent: data.progressPercent,
        xpEarned: (prev?.xpEarned || 0) + (data.xpEarned || activeLesson.xpReward || 25),
      }));

      updateUser({
        xp: data.totalXp,
        level: data.level,
        streak: data.streak,
        dailyXpEarned: data.dailyXpEarned,
      });

      // Load next lesson or return to dashboard overview
      if (data.nextLesson) {
        let nextSlug = '';
        for (const mod of track.modules || []) {
          const matching = mod.lessons.find((l) => l.id === data.nextLesson);
          if (matching) {
            nextSlug = matching.slug;
            break;
          }
        }
        if (nextSlug) {
          loadLessonDetails(nextSlug);
        } else {
          setActiveLesson(null);
        }
      } else {
        // All lessons done! Force Overview dashboard
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleContinueLearning = () => {
    const completedSet = new Set((progress?.completedLessons || []).map(l => l.toString()));
    let nextLesson = null;
    
    for (const mod of track.modules || []) {
      const isModUnlocked = moduleUnlocked[mod.id];
      if (!isModUnlocked) continue;
      
      for (let li = 0; li < (mod.lessons || []).length; li++) {
        const les = mod.lessons[li];
        const isCompleted = completedSet.has(les.id.toString());
        const isUnlocked = isCompleted || (li === 0 || (completedSet.has(mod.lessons[li - 1]?.id?.toString()) && areLessonChallengesCompleted(mod.lessons[li - 1])));
        
        if (isUnlocked && !isCompleted) {
          nextLesson = les;
          break;
        }
      }
      if (nextLesson) break;
    }
    
    // Fallback: If no incomplete unlocked lesson found, find first lesson of first module
    if (!nextLesson && track.modules?.length && track.modules[0].lessons?.length) {
      nextLesson = track.modules[0].lessons[0];
    }
    
    if (nextLesson) {
      loadLessonDetails(nextLesson.slug);
    }
  };

  const handleSubmitCapstone = (e) => {
    e.preventDefault();
    if (!repoUrl.trim() || !demoUrl.trim()) return;
    
    const submissionData = {
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim(),
      submitted: true,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`learnstation_capstone_${slug}`, JSON.stringify(submissionData));
    setCapstoneSubmitted(true);
    showToast("🎉 Congratulations! Your Capstone Project has been submitted successfully.");
  };

  const capstone = track.capstone_project || {};
  const totalLessonsCount = track.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <PageTransition>
      <div className="workspace-page">
        {toast && (
          <div className="toast-notification">
            <span>🔒</span>
            {toast}
          </div>
        )}

        {/* Global Workspace Header */}
        <div className="workspace-header" style={{ borderBottomColor: trackColor }}>
          <div className="workspace-header__left">
            <Link to="/" className="workspace-header__back">← Home</Link>
            <div className="workspace-header__title">
              <span className="workspace-header__badge" style={{ color: trackColor, background: `${trackColor}15` }}>AI Blueprint</span>
              <h1>{track.name}</h1>
            </div>
          </div>
          <div className="workspace-header__right">
            <div className="workspace-header__stats">
              <span>🔥 {user?.streak || 0} Streak</span>
              <span>✦ {user?.xp?.toLocaleString()} XP</span>
            </div>
            <div className="workspace-header__progress">
              <span>{progress?.progressPercent || 0}% Complete</span>
              <div className="progress-mini-bar">
                <div className="progress-mini-bar__fill" style={{ width: `${progress?.progressPercent || 0}%`, background: trackColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Columns Container */}
        <div className="workspace-container">
          
          {/* LEFT SIDEBAR: Navigation Tree */}
          <aside className="workspace-sidebar">
            <div className="workspace-sidebar__section">
              <span className="workspace-header__badge" style={{ color: trackColor, background: `${trackColor}15` }}>
                {track.difficulty || 'AI Workspace'}
              </span>
              <h2 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 'var(--space-2) 0 var(--space-3)', fontWeight: 'var(--font-bold)', textTransform: 'none', letterSpacing: 'normal' }}>
                {track.name}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>{progress?.progressPercent || 0}% Complete</span>
                  <span>✦ {progress?.xpEarned || 0} XP</span>
                </div>
                <div className="progress-mini-bar">
                  <div className="progress-mini-bar__fill" style={{ width: `${progress?.progressPercent || 0}%`, background: trackColor }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', fontSize: '10px', fontWeight: 'var(--font-semibold)' }}>
                <span style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>🔥 {user?.streak || 0} Streak</span>
                <span style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>✦ {user?.xp?.toLocaleString()} Total XP</span>
              </div>
            </div>

            <button 
              className={`sidebar-overview-btn ${activeLesson === null ? 'sidebar-overview-btn--active' : ''}`}
              onClick={() => setActiveLesson(null)}
            >
              📋 Track Overview Dashboard
            </button>

            <div className="roadmap-tree">
              {track.modules?.map((mod, mi) => (
                <div key={mod.id} className="roadmap-module">
                  <div className="roadmap-module__header">
                    <div className={`roadmap-module__circle ${moduleUnlocked[mod.id] ? 'roadmap-module__circle--active' : ''}`}>
                      {mi + 1}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3>{mod.name}</h3>
                      <p className="roadmap-module__objective">{mod.learning_objective}</p>
                    </div>
                  </div>

                  <div className="roadmap-lessons">
                    {mod.lessons?.map((les, li) => {
                      const isCompleted = completedLessonsSet.has(les.id.toString());
                      const isActive = activeLesson?.id === les.id;
                      const isUnlocked = isCompleted || (moduleUnlocked[mod.id] && (li === 0 || (completedLessonsSet.has(mod.lessons[li - 1]?.id?.toString()) && areLessonChallengesCompleted(mod.lessons[li - 1]))));

                      return (
                        <button
                          key={les.id}
                          className={`roadmap-lesson-btn ${isActive ? 'roadmap-lesson-btn--active' : ''} ${isCompleted ? 'roadmap-lesson-btn--completed' : ''} ${!isUnlocked ? 'roadmap-lesson-btn--locked' : ''}`}
                          style={!isUnlocked ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                          onClick={() => {
                            if (!isUnlocked) {
                              showToast("This lesson is locked. Complete the previous lesson to continue.");
                            } else {
                              loadLessonDetails(les.slug);
                            }
                          }}
                        >
                          <span className="roadmap-lesson-btn__icon">
                            {isCompleted ? '✓' : !isUnlocked ? '🔒' : '○'}
                          </span>
                          <span className="roadmap-lesson-btn__text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {les.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Capstone Sidebar Button */}
              {capstone.title && (
                <button
                  className={`roadmap-capstone-btn ${activeLesson === null ? 'roadmap-capstone-btn--active' : ''}`}
                  onClick={() => {
                    setActiveLesson(null);
                    setTimeout(() => {
                      const el = document.getElementById('capstone-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  🏆 Final Capstone Project
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="workspace-main">
            {activeLesson ? (
              
              /* STATE B: ACTIVE LESSON COCKPIT */
              <div className="lesson-workspace">
                <div className="lesson-cockpit-header">
                  <div className="lesson-cockpit-header__left">
                    <button 
                      className="btn--back-to-overview"
                      onClick={() => setActiveLesson(null)}
                    >
                      ← Back to Overview
                    </button>
                    <div className="lesson-cockpit-header__title">
                      <span>{track.name}</span>
                      <h3>{activeLesson.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Cockpit Tabs */}
                <div className="workspace-tabs">
                  {['concept', 'example', 'practice', 'check', 'summary'].map((tab) => (
                    <button
                      key={tab}
                      className={`workspace-tab ${activeTab === tab ? 'workspace-tab--active' : ''}`}
                      style={activeTab === tab ? { borderBottomColor: trackColor, color: trackColor } : {}}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="workspace-content">
                  {/* TAB 1: Concept */}
                  {activeTab === 'concept' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="workspace-tab-panel">
                      <h2>{activeLesson.concept?.title}</h2>
                      <div className="workspace-text">
                        {activeLesson.concept?.content?.split('\n\n').map((para, pi) => (
                          <p key={pi}>{para}</p>
                        ))}
                      </div>
                      <div className="workspace-highlights mt-6">
                        <h3>Key Terms:</h3>
                        <div className="flex gap-2 flex-wrap">
                          {activeLesson.concept?.highlights?.map((hl, hi) => (
                            <span key={hi} className="highlight-tag">{hl}</span>
                          ))}
                        </div>
                      </div>
                      <button className="btn btn--primary mt-8" onClick={() => setActiveTab('example')}>
                        Next: Code Example →
                      </button>
                    </motion.div>
                  )}

                  {/* TAB 2: Code Example */}
                  {activeTab === 'example' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="workspace-tab-panel">
                      <h2>Real-World Example</h2>
                      <p className="mb-4">Study the code snippet below and its execution context:</p>
                      
                      <div className="code-editor-viewer">
                        <div className="code-editor-header">
                          <span className="code-editor-lang">{activeLesson.example?.language}</span>
                        </div>
                        <pre className="code-editor-content">
                          <code>{activeLesson.example?.code}</code>
                        </pre>
                      </div>

                      <div className="workspace-explanation mt-6">
                        <h3>Code Explanation:</h3>
                        <p>{activeLesson.example?.explanation}</p>
                      </div>
                      
                      <button className="btn btn--primary mt-8" onClick={() => setActiveTab('practice')}>
                        Next: Interactive Practice →
                      </button>
                    </motion.div>
                  )}

                  {/* TAB 3: Interactive Practice */}
                  {activeTab === 'practice' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="workspace-tab-panel">
                      <h2>Interactive Practice</h2>
                      <p className="mb-2">{activeLesson.practice?.instruction}</p>
                      
                      <InteractivePlayground
                        language={activeLesson.example?.language || 'javascript'}
                        template={activeLesson.practice?.template}
                        instruction={activeLesson.practice?.instruction}
                        answer={activeLesson.practice?.answer}
                        onCorrect={() => setPracticeCorrect(true)}
                      />
                      
                      {practiceCorrect === true && (
                        <button className="btn btn--success mt-4" onClick={() => {
                          setPracticeCorrect(null);
                          setActiveTab('check');
                        }}>
                          Correct! Go to Knowledge Check →
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: Knowledge Check */}
                  {activeTab === 'check' && activeLesson.challenges?.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="workspace-tab-panel">
                      <div className="flex justify-between items-center mb-6">
                        <h2>Knowledge Check</h2>
                        <span className="text-muted">Question {currentChallengeIndex + 1} of {activeLesson.challenges.length}</span>
                      </div>

                      {(() => {
                        const challenge = activeLesson.challenges[currentChallengeIndex];
                        return (
                          <div className="challenge-block">
                            <h3 className="challenge-question mb-6">{challenge.question}</h3>

                            {challenge.type === 'multiple-choice' ? (
                              <div className="challenge-options flex flex-col gap-3">
                                {challenge.options?.map((opt, oi) => {
                                  const isSelected = selectedOption === oi;
                                  const isCorrect = oi === challenge.correctIndex;
                                  let optionClass = '';

                                  if (challengeSubmitted) {
                                    if (isCorrect) optionClass = 'option-btn--correct';
                                    else if (isSelected) optionClass = 'option-btn--wrong';
                                  } else if (isSelected) {
                                    optionClass = 'option-btn--selected';
                                  }

                                  return (
                                    <button
                                      key={oi}
                                      className={`option-btn ${optionClass}`}
                                      onClick={() => !challengeSubmitted && setSelectedOption(oi)}
                                      disabled={challengeSubmitted}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="challenge-fill-blank">
                                <div className="practice-template">
                                  {challenge.template?.split('___').map((part, i, arr) => (
                                    <span key={i}>
                                      {part}
                                      {i < arr.length - 1 && (
                                        <input
                                          type="text"
                                          className={`practice-input ${challengeCorrect === true ? 'practice-input--correct' : challengeCorrect === false ? 'practice-input--wrong' : ''}`}
                                          value={challengeInput}
                                          onChange={(e) => {
                                            setChallengeInput(e.target.value);
                                            setChallengeCorrect(null);
                                          }}
                                          placeholder="..."
                                          disabled={challengeSubmitted}
                                        />
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {challengeSubmitted && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="challenge-feedback-box mt-6">
                                <h4>{challengeCorrect ? '🎉 Correct!' : '❌ Incorrect'}</h4>
                                <p>{challenge.explanation}</p>
                              </motion.div>
                            )}

                            <div className="mt-8">
                              {!challengeSubmitted ? (
                                <button
                                  className="btn btn--primary"
                                  onClick={handleCheckChallenge}
                                  disabled={challenge.type === 'multiple-choice' ? selectedOption === null : !challengeInput.trim()}
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <button className="btn btn--primary" onClick={handleNextChallenge}>
                                  {currentChallengeIndex < activeLesson.challenges.length - 1 ? 'Next Question →' : 'Review Summary →'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* TAB 5: Lesson Summary */}
                  {activeTab === 'summary' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="workspace-tab-panel">
                      <h2>Lesson Summary</h2>
                      <div className="summary-box p-6 mb-8">
                        <p>{activeLesson.summary || 'Congratulations on completing this lesson. Expand your mastery by completing the rest of the modules.'}</p>
                      </div>

                      <div className="claimed-xp-box">
                        <div className="xp-award-circle" style={{ borderColor: trackColor, color: trackColor }}>
                          <span>+25</span>
                          <span>XP</span>
                        </div>
                        <h3>You have mastered this lesson!</h3>
                        <p className="text-muted mb-6">Complete this lesson to earn your reward points and update your streak.</p>
                      </div>

                      <button className="btn btn--primary btn--xl w-full" onClick={handleCompleteLesson}>
                        Claim XP & Complete Lesson ✦
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              
              /* STATE A: OVERVIEW DASHBOARD */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                
                {/* Banner CTA */}
                <div className="workspace-welcome" style={{ borderLeft: `4px solid ${trackColor}` }}>
                  <div className="workspace-welcome__content">
                    <span className="workspace-welcome__subtitle">Welcome Back</span>
                    <h2 className="workspace-welcome__title">Your Learning Path for {track.name}</h2>
                    <p className="workspace-welcome__desc">
                      {progress?.progressPercent >= 100 
                        ? "You have completed all curriculum lessons! Proceed to submit the final Capstone Project."
                        : `You are making great progress! Continue where you left off.`}
                    </p>
                  </div>
                  <div className="workspace-welcome__cta">
                    {progress?.progressPercent >= 100 ? (
                      <button 
                        className="btn--continue-learning"
                        onClick={() => {
                          const el = document.getElementById('capstone-card');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{ background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)' }}
                      >
                        🚀 Start Capstone Project
                      </button>
                    ) : (
                      <button 
                        className="btn--continue-learning"
                        onClick={handleContinueLearning}
                      >
                        Continue Learning →
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Indicators / Statistics Cards */}
                <div className="workspace-stats">
                  <div className="workspace-stat-card">
                    <span className="workspace-stat-card__label">Progress</span>
                    <span className="workspace-stat-card__value">{progress?.progressPercent || 0}%</span>
                    <div className="workspace-stat-card__meter">
                      <div className="workspace-stat-card__meter-fill" style={{ width: `${progress?.progressPercent || 0}%`, background: trackColor }} />
                    </div>
                    <span className="workspace-stat-card__footer">To Graduation</span>
                  </div>
                  
                  <div className="workspace-stat-card">
                    <span className="workspace-stat-card__label">Lessons Completed</span>
                    <span className="workspace-stat-card__value">
                      {progress?.completedLessons?.length || 0} / {totalLessonsCount}
                    </span>
                    <div className="workspace-stat-card__meter">
                      <div 
                        className="workspace-stat-card__meter-fill" 
                        style={{ 
                          width: `${totalLessonsCount ? ((progress?.completedLessons?.length || 0) / totalLessonsCount) * 100 : 0}%`, 
                          background: 'var(--accent-green)' 
                        }} 
                      />
                    </div>
                    <span className="workspace-stat-card__footer">Units completed</span>
                  </div>

                  <div className="workspace-stat-card">
                    <span className="workspace-stat-card__label">XP Earned</span>
                    <span className="workspace-stat-card__value">✦ {progress?.xpEarned || 0}</span>
                    <div style={{ height: '4px' }} />
                    <span className="workspace-stat-card__footer">Points earned in track</span>
                  </div>

                  <div className="workspace-stat-card">
                    <span className="workspace-stat-card__label">Current Streak</span>
                    <span className="workspace-stat-card__value">🔥 {user?.streak || 0} Days</span>
                    <div style={{ height: '4px' }} />
                    <span className="workspace-stat-card__footer">Keep it going!</span>
                  </div>
                </div>

                {/* Curriculum Modules */}
                <div className="workspace-roadmap-header">
                  <h2>Modules & Learning Curriculum</h2>
                </div>

                {track.modules?.map((mod, mi) => {
                  const isModUnlocked = moduleUnlocked[mod.id];
                  const modXpReward = mod.lessons?.reduce((acc, l) => acc + (l.xpReward || 0), 0) || 0;
                  const modChallengesCount = mod.lessons?.reduce((acc, l) => acc + (l.challengeIds?.length || 0), 0) || 0;

                  return (
                    <div 
                      key={mod.id} 
                      className={`premium-module-card ${isModUnlocked ? 'premium-module-card--active' : ''}`}
                    >
                      <div className="premium-module-card__header">
                        <div className="premium-module-card__info">
                          <span className="premium-module-card__num">Module {mi + 1}</span>
                          <h3 className="premium-module-card__title">{mod.name}</h3>
                          <p className="premium-module-card__desc">{mod.learning_objective}</p>
                        </div>
                        <div className="premium-module-card__meta">
                          <span className="module-xp-badge">+{modXpReward} XP</span>
                          <div className="module-counts-row">
                            <span>📚 {mod.lessons?.length || 0} Lessons</span>
                            <span>⚡ {modChallengesCount} Challenges</span>
                          </div>
                        </div>
                      </div>

                      {/* Lessons Grid for Module */}
                      <div className="premium-lesson-grid">
                        {mod.lessons?.map((les, li) => {
                          const isCompleted = completedLessonsSet.has(les.id.toString());
                          const isUnlocked = isCompleted || (isModUnlocked && (li === 0 || (completedLessonsSet.has(mod.lessons[li - 1]?.id?.toString()) && areLessonChallengesCompleted(mod.lessons[li - 1]))));
                          const isCurrent = !isCompleted && isUnlocked;
                          
                          const statusLabel = isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked';
                          const statusClass = isCompleted ? 'premium-lesson-card--completed' : isCurrent ? 'premium-lesson-card--current' : 'premium-lesson-card--locked';
                          
                          return (
                            <div 
                              key={les.id} 
                              className={`premium-lesson-card ${statusClass}`}
                              onClick={() => {
                                if (!isUnlocked) {
                                  showToast("This lesson is locked. Complete the previous lesson to continue.");
                                } else {
                                  loadLessonDetails(les.slug);
                                }
                              }}
                            >
                              <div className="premium-lesson-card__left">
                                <div className="premium-lesson-card__status">
                                  {isCompleted ? '✓' : isUnlocked ? '○' : '🔒'}
                                </div>
                                <div className="premium-lesson-card__details">
                                  <h4 className="premium-lesson-card__title">{les.title}</h4>
                                  <div className="premium-lesson-card__meta">
                                    <span>⏱ {les.estimatedMinutes || 10} Mins</span>
                                    <span>✦ {les.xpReward || 25} XP</span>
                                  </div>
                                </div>
                              </div>

                              <div className="premium-lesson-card__right">
                                {isCompleted && <span className="premium-lesson-card__xp" style={{ color: 'var(--accent-green)' }}>Completed</span>}
                                {isCurrent && (
                                  <button 
                                    className="btn-start-lesson"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadLessonDetails(les.slug);
                                    }}
                                  >
                                    Start Lesson
                                  </button>
                                )}
                                {!isUnlocked && <span className="premium-lesson-card__xp" style={{ color: 'var(--text-muted)' }}>Locked</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Dedicated Capstone Project Card */}
                {capstone.title && (
                  <div 
                    id="capstone-card" 
                    className={`premium-capstone-card ${progress?.progressPercent < 100 ? 'premium-capstone-card--locked' : ''}`}
                  >
                    <div className="premium-capstone-card__header">
                      <div className="premium-capstone-card__title-area">
                        <span className="premium-capstone-card__badge">🏆 Track Capstone Milestone</span>
                        <h3 className="premium-capstone-card__title">{capstone.title}</h3>
                        <p className="premium-capstone-card__desc">{capstone.description}</p>
                      </div>
                      <div className="premium-capstone-card__status">
                        {capstoneSubmitted ? (
                          <span className="premium-capstone-card__status-badge capstone-status--completed">
                            ✓ Submitted & Approved
                          </span>
                        ) : progress?.progressPercent >= 100 ? (
                          <span className="premium-capstone-card__status-badge capstone-status--ready">
                            Ready to Submit
                          </span>
                        ) : (
                          <span className="premium-capstone-card__status-badge capstone-status--locked">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="premium-capstone-card__reqs">
                      <span className="premium-capstone-card__heading">Project Requirements</span>
                      <ul className="capstone-req-list">
                        {capstone.requirements?.map((req, ri) => (
                          <li key={ri} className="capstone-req-item">
                            <span className="capstone-req-item__bullet">✦</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="premium-capstone-card__submission">
                      <span className="premium-capstone-card__heading">Deliverables Submission</span>
                      
                      {capstoneSubmitted ? (
                        <div className="capstone-success-banner">
                          <h4>🎉 Track Graduation Achieved!</h4>
                          <p>Congratulations! You have successfully designed, built, and submitted the Capstone Project deliverables. You are now officially graduated from this track.</p>
                          <div className="capstone-success-meta">
                            <span><strong>Repository URL:</strong> <a href={repoUrl} target="_blank" rel="noopener noreferrer">{repoUrl}</a></span>
                            <span><strong>Live Demo URL:</strong> <a href={demoUrl} target="_blank" rel="noopener noreferrer">{demoUrl}</a></span>
                          </div>
                          <button 
                            className="btn btn--secondary mt-4" 
                            style={{ alignSelf: 'flex-start' }}
                            onClick={() => {
                              setCapstoneSubmitted(false);
                            }}
                          >
                            Resubmit Deliverables
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitCapstone} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                          <div className="capstone-form-grid">
                            <div className="capstone-input-group">
                              <label htmlFor="repo-url">Repository Submission Link *</label>
                              <input 
                                id="repo-url"
                                type="url" 
                                className="capstone-input" 
                                placeholder="https://github.com/yourusername/project"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                disabled={progress?.progressPercent < 100}
                                required
                              />
                            </div>
                            <div className="capstone-input-group">
                              <label htmlFor="demo-url">Live Demo URL Link *</label>
                              <input 
                                id="demo-url"
                                type="url" 
                                className="capstone-input" 
                                placeholder="https://project-demo.vercel.app"
                                value={demoUrl}
                                onChange={(e) => setDemoUrl(e.target.value)}
                                disabled={progress?.progressPercent < 100}
                                required
                              />
                            </div>
                          </div>
                          <button 
                            type="submit" 
                            className="btn--submit-capstone"
                            disabled={progress?.progressPercent < 100 || !repoUrl.trim() || !demoUrl.trim()}
                          >
                            Submit Capstone & Graduate Track 🎓
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
