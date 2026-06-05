import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import ProgressBar from '../components/common/ProgressBar';
import PageTransition from '../components/layout/PageTransition';

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

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const { data } = await api.get(`/tracks/${slug}`);
        setTrack(data.track);
        setProgress(data.progress);
        
        // Find first incomplete lesson or default to first lesson
        const completedSet = new Set(data.progress?.completedLessons || []);
        let initialLesson = null;
        
        for (const mod of data.track.modules || []) {
          for (const les of mod.lessons || []) {
            if (!completedSet.has(les.id)) {
              initialLesson = les;
              break;
            }
          }
          if (initialLesson) break;
        }

        if (!initialLesson && data.track.modules?.length && data.track.modules[0].lessons?.length) {
          initialLesson = data.track.modules[0].lessons[0];
        }
        
        if (initialLesson) {
          loadLessonDetails(initialLesson.slug);
        }
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

  const completedLessonsSet = new Set(progress?.completedLessons || []);
  const activeLessonIndex = activeLesson ? progress?.completedLessons?.length : 0;

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
      }));

      updateUser({
        xp: data.totalXp,
        level: data.level,
        streak: data.streak,
        dailyXpEarned: data.dailyXpEarned,
      });

      // Load next lesson or capstone
      if (data.nextLesson) {
        // Find next lesson slug
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
        }
      } else {
        // All lessons done! Force Capstone tab
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const capstone = track.capstone_project || {};

  return (
    <PageTransition>
      <div className="workspace-page">
        <div className="workspace-header" style={{ borderBottomColor: track.color }}>
          <div className="workspace-header__left">
            <Link to="/" className="workspace-header__back">← Home</Link>
            <div className="workspace-header__title">
              <span className="workspace-header__badge" style={{ color: track.color, background: `${track.color}15` }}>AI Blueprint</span>
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
                <div className="progress-mini-bar__fill" style={{ width: `${progress?.progressPercent || 0}%`, background: track.color }} />
              </div>
            </div>
          </div>
        </div>

        <div className="workspace-container">
          {/* Left Panel: Roadmap Tree */}
          <aside className="workspace-sidebar">
            <div className="workspace-sidebar__section">
              <h2>Roadmap</h2>
            </div>
            <div className="roadmap-tree">
              {track.modules?.map((mod, mi) => (
                <div key={mod.id} className="roadmap-module">
                  <div className="roadmap-module__header">
                    <div className="roadmap-module__circle">{mi + 1}</div>
                    <div>
                      <h3>{mod.name}</h3>
                      <p className="roadmap-module__objective">{mod.learning_objective}</p>
                    </div>
                  </div>

                  <div className="roadmap-lessons">
                    {mod.lessons?.map((les, li) => {
                      const isCompleted = completedLessonsSet.has(les.id);
                      const isActive = activeLesson?.id === les.id;
                      
                      return (
                        <button
                          key={les.id}
                          className={`roadmap-lesson-btn ${isActive ? 'roadmap-lesson-btn--active' : ''} ${isCompleted ? 'roadmap-lesson-btn--completed' : ''}`}
                          onClick={() => loadLessonDetails(les.slug)}
                        >
                          <span className="roadmap-lesson-btn__icon">
                            {isCompleted ? '✓' : '○'}
                          </span>
                          <span className="roadmap-lesson-btn__text">{les.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Module Mini Project */}
                  {mod.mini_project && mod.mini_project.title && (
                    <div className="roadmap-project">
                      <span className="roadmap-project__label">🛠️ Mini-Project</span>
                      <h4>{mod.mini_project.title}</h4>
                      <p>{mod.mini_project.description}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Final Capstone Project */}
              {capstone.title && (
                <div className={`roadmap-module roadmap-module--capstone ${progress?.progressPercent >= 100 ? 'roadmap-module--capstone-active' : ''}`}>
                  <div className="roadmap-module__header">
                    <div className="roadmap-module__circle">🏆</div>
                    <div>
                      <h3>Capstone Project</h3>
                      <p className="roadmap-module__objective">Demonstrate your complete technical mastery</p>
                    </div>
                  </div>
                  <button 
                    className="roadmap-capstone-btn" 
                    onClick={() => setActiveLesson(null)}
                    disabled={progress?.progressPercent < 100}
                  >
                    🚀 Capstone Workspace
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Panel: Workspace cockpit */}
          <main className="workspace-main">
            {activeLesson ? (
              <div className="lesson-workspace">
                {/* Tabs */}
                <div className="workspace-tabs">
                  {['concept', 'example', 'practice', 'check', 'summary'].map((tab) => (
                    <button
                      key={tab}
                      className={`workspace-tab ${activeTab === tab ? 'workspace-tab--active' : ''}`}
                      style={activeTab === tab ? { borderBottomColor: track.color, color: track.color } : {}}
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
                      <p className="mb-6">{activeLesson.practice?.instruction}</p>

                      <div className="practice-box">
                        <div className="practice-template">
                          {activeLesson.practice?.template?.split('___').map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <input
                                  type="text"
                                  className={`practice-input ${practiceCorrect === true ? 'practice-input--correct' : practiceCorrect === false ? 'practice-input--wrong' : ''}`}
                                  value={practiceInput}
                                  onChange={(e) => {
                                    setPracticeInput(e.target.value);
                                    setPracticeCorrect(null);
                                  }}
                                  placeholder="Type answer..."
                                  disabled={practiceCorrect === true}
                                />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                        {practiceCorrect !== true ? (
                          <button className="btn btn--primary" onClick={handleCheckPractice}>
                            Verify Practice Check
                          </button>
                        ) : (
                          <button className="btn btn--success" onClick={() => setActiveTab('check')}>
                            Correct! Go to Knowledge Check →
                          </button>
                        )}
                        {practiceCorrect === false && (
                          <span className="practice-feedback-error">❌ Try again. Check case and spelling.</span>
                        )}
                      </div>
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
                        <div className="xp-award-circle" style={{ borderColor: track.color, color: track.color }}>
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
              /* RENDER: Capstone Project Workspace */
              <div className="capstone-workspace">
                <div className="capstone-header">
                  <span className="capstone-header__badge">🏆 Final Milestone</span>
                  <h2>{capstone.title}</h2>
                  <p>{capstone.description}</p>
                </div>

                <div className="capstone-requirements mt-8">
                  <h3>Project Requirements:</h3>
                  <ul>
                    {capstone.requirements?.map((req, ri) => (
                      <li key={ri}>
                        <span className="bullet">⚡</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="capstone-submission mt-12 p-8">
                  <h3>Submit Project</h3>
                  <p className="text-secondary mb-6">Write a summary of your capstone implementation or provide a repository link to complete the track:</p>
                  <textarea rows="5" placeholder="e.g. My repository link: github.com/username/project..." />
                  <button className="btn btn--primary btn--lg mt-6" onClick={() => navigate('/')}>
                    Submit Capstone & Graduate Track 🏆
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
