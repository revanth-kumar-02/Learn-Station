import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonService, aiService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import InteractivePlayground from '../components/common/InteractivePlayground';
import ProgressBar from '../components/common/ProgressBar';
import { getEnhancedLessonData, parseMarkdown, EnhancedLessonData } from '../utils/lessonHelper';
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Trophy, 
  Clock, 
  Compass, 
  Bookmark, 
  Shuffle, 
  ChevronRight, 
  Flame, 
  Check, 
  X,
  Code,
  Zap
} from 'lucide-react';

const TABS = [
  { label: 'Overview', icon: <Compass size={16} /> },
  { label: 'Lesson', icon: <BookOpen size={16} /> },
  { label: 'Practice', icon: <Code size={16} /> },
  { label: 'Quiz', icon: <HelpCircle size={16} /> },
  { label: 'Summary', icon: <Trophy size={16} /> },
  { label: 'Flashcards', icon: <Zap size={16} /> }
];

export default function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  
  const [lesson, setLesson] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Quiz/Challenge States
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message?: string } | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Match following states
  const [selectedMatchKey, setSelectedMatchKey] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  // Flashcards States
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<number[]>([]);
  const [flashcardOrder, setFlashcardOrder] = useState<number[]>([]);
  const [flashcardFilter, setFlashcardFilter] = useState<'all' | 'bookmarked'>('all');

  // Code Walkthrough active line
  const [activeWalkthroughLine, setActiveWalkthroughLine] = useState<number | null>(null);

  // AI Mentor State
  const [mentorOpen, setMentorOpen] = useState(() => {
    const saved = localStorage.getItem('ls_ai_panel_open');
    return saved !== 'false';
  });
  const [mentorMessages, setMentorMessages] = useState<any[]>([]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const mentorEndRef = useRef<HTMLDivElement>(null);

  const toggleMentorOpen = () => {
    setMentorOpen(prev => {
      const next = !prev;
      localStorage.setItem('ls_ai_panel_open', JSON.stringify(next));
      return next;
    });
  };

  const getSuggestedPromptsForStep = (step: number) => {
    switch (step) {
      case 0: // Overview
      case 1: // Lesson
        return [
          { text: '📖 Explain concept differently', prompt: 'Explain the concept of this lesson differently using a simple analogy.' },
          { text: '✨ Simplify this topic', prompt: 'Can you simplify the explanation of this lesson concept?' },
          { text: '🏢 Show real-world examples', prompt: 'Provide 3 real-world practical use cases for this concept.' }
        ];
      case 2: // Practice
        return [
          { text: '💡 Give me a hint', prompt: 'Give me a hint for this practice task without revealing the direct solution.' },
          { text: '🔍 Explain step-by-step logic', prompt: 'Explain the step-by-step logic required to solve this practice task.' },
          { text: '🐛 Debug my code', prompt: 'Here is my current practice code. Can you help me debug it and explain my errors?' }
        ];
      case 3: // Quiz
        return [
          { text: '🧠 Hint for current question', prompt: 'Provide a helpful hint for this quiz question without telling me the answer.' },
          { text: '📝 Explain quiz mistakes', prompt: 'Can you explain the concepts behind this quiz question and review common mistakes?' }
        ];
      case 4: // Summary
        return [
          { text: '🏋️ Generate extra practice', prompt: 'Generate 2 additional practice code exercises with instructions for this topic.' },
          { text: '🎓 Test my understanding', prompt: 'Ask me a challenging conceptual question about this lesson to test my knowledge.' }
        ];
      default:
        return [
          { text: '💬 Summarize lesson', prompt: 'Explain the core concepts of this lesson in a simple summary.' }
        ];
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const data = await lessonService.getBySlug(slug!);
        setLesson(data.lesson);
        setTrack(data.track);
        setProgress(data.progress);
        setIsLocked(false);
        
        // Reset states
        setCurrentStep(0);
        setMaxStepReached(0);
        setChallengeIndex(0);
        setUserAnswer('');
        setSelectedOption(null);
        setFeedback(null);
        setQuizSubmitted(false);
        setQuizScore(0);
        setQuizAnswers([]);
        setMatches({});
        setSelectedMatchKey(null);
        setCurrentFlashcardIdx(0);
        setCardFlipped(false);
        setBookmarkedCards([]);

        // Initialize flashcard indices
        const len = data.lesson?.flashcards?.length || 2;
        setFlashcardOrder(Array.from({ length: len }, (_, i) => i));

        const todayStr = new Date().toISOString().split('T')[0];
        const dailyMissions = user?.daily_missions;
        const completedToday = (dailyMissions && dailyMissions.date === todayStr) ? (dailyMissions.completedLessonsToday || []) : [];
        
        if (!data.isCompleted && completedToday.length >= 4) {
          setIsDailyLimitReached(true);
        } else {
          setIsDailyLimitReached(false);
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setIsLocked(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug, user?.daily_missions]);

  // Scroll to bottom of chat
  useEffect(() => {
    mentorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages, mentorOpen]);

  if (loading) return <Loader fullPage />;

  if (isLocked) {
    return (
      <PageTransition>
        <div className="lesson-locked-container" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
          <div className="container container--narrow card" style={{ padding: 'var(--space-8)' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔒</span>
            <h2>Lesson Locked</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Complete the previous lesson and its module assessments in sequence to unlock this topic.
            </p>
            <button onClick={() => navigate(-1)} className="btn btn--primary btn--md">Go Back</button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isDailyLimitReached) {
    return (
      <PageTransition>
        <div className="lesson-locked-container" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
          <div className="container container--narrow card" style={{ padding: 'var(--space-8)' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🚀</span>
            <h2>Daily Learning Limit Reached</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You have completed 4 lessons today! To encourage retention and avoid burnout, we limit lessons to 4 per day. Continue tomorrow!
            </p>
            <button onClick={() => navigate('/')} className="btn btn--primary btn--md">Go to Dashboard</button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const enhanced = getEnhancedLessonData(lesson);
  if (!enhanced) return <div className="container"><h2>Failed to load enhanced lesson metadata.</h2></div>;

  const completedLessonsSet = new Set((progress?.completedLessons || []).map((l: any) => l.toString()));

  const handleTabClick = (idx: number) => {
    if (idx <= maxStepReached || completedLessonsSet.has(lesson.id.toString())) {
      setCurrentStep(idx);
    }
  };

  const handleNextStep = () => {
    const next = currentStep + 1;
    if (next < TABS.length) {
      if (next > maxStepReached) {
        setMaxStepReached(next);
      }
      setCurrentStep(next);
    }
  };

  // --- Quiz Grader logic ---
  const handleVerifyAnswer = () => {
    const challenges = lesson.challenges || [];
    const challenge = challenges[challengeIndex];
    if (!challenge) return;

    let isCorrect = false;

    if (challenge.type === 'multiple-choice') {
      isCorrect = selectedOption === challenge.correct_index;
    } else if (challenge.type === 'fill-blank' || challenge.type === 'output-prediction' || challenge.type === 'debugging') {
      isCorrect = userAnswer.trim().toLowerCase() === (challenge.answer || challenge.expected_output || '').trim().toLowerCase();
    } else if (challenge.type === 'match-following') {
      const correctPairs = challenge.pairs || {};
      let matchAll = true;
      for (const [k, v] of Object.entries(correctPairs)) {
        if (matches[k] !== v) {
          matchAll = false;
          break;
        }
      }
      isCorrect = matchAll;
    }

    setFeedback({
      correct: isCorrect,
      message: isCorrect 
        ? '🎉 Excellent job! That is completely correct.' 
        : `❌ Incorrect. Let's review this topic.`
    });

    const updatedAnswers = [...quizAnswers];
    updatedAnswers[challengeIndex] = {
      challengeId: challenge.id,
      question: challenge.question,
      userAnswer: challenge.type === 'multiple-choice' ? challenge.options[selectedOption!] : (challenge.type === 'match-following' ? JSON.stringify(matches) : userAnswer),
      correctAnswer: challenge.type === 'multiple-choice' ? challenge.options[challenge.correct_index] : (challenge.type === 'match-following' ? JSON.stringify(challenge.pairs) : (challenge.answer || challenge.expected_output)),
      explanation: challenge.explanation,
      correct: isCorrect
    };
    setQuizAnswers(updatedAnswers);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    // Safe gating: if last question is verified correct, and total expected score >= 4, unlock Summary
    const challengesList = lesson.challenges || [];
    const isLastQuestion = challengeIndex === challengesList.length - 1;
    const finalExpectedScore = quizScore + (isCorrect ? 1 : 0);
    if (isLastQuestion && finalExpectedScore >= 4) {
      setMaxStepReached(prev => Math.max(prev, 4));
    }
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback(null);
    setMatches({});
    setSelectedMatchKey(null);

    const challengesList = lesson.challenges || [];
    if (challengeIndex < challengesList.length - 1) {
      setChallengeIndex(challengeIndex + 1);
    } else {
      // Quiz finished
      setQuizSubmitted(true);
      // Ensure Summary is unlocked if quiz is passed
      if (quizScore >= 4) {
        setMaxStepReached(prev => Math.max(prev, 4));
      }
    }
  };

  const handleResetQuiz = () => {
    setChallengeIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizAnswers([]);
    setMatches({});
    setSelectedMatchKey(null);
  };

  // --- Complete Lesson ---
  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      const quizPassed = quizScore >= 4; // Passing threshold 80% (4 out of 5)
      const res = await lessonService.complete(lesson.slug, quizScore, quizPassed);
      if (res.success) {
        updateUser(res.user);
        setShowSuccessOverlay(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to complete lesson.');
    } finally {
      setIsCompleting(false);
    }
  };

  // --- Match Following connected handler ---
  const handleMatchClick = (side: 'left' | 'right', value: string) => {
    if (feedback) return; // disable during verification review

    if (side === 'left') {
      setSelectedMatchKey(value);
    } else {
      if (selectedMatchKey) {
        setMatches(prev => ({
          ...prev,
          [selectedMatchKey]: value
        }));
        setSelectedMatchKey(null);
      }
    }
  };

  // --- Flashcard Operations ---
  const filteredFlashcardIndices = flashcardOrder.filter(idx => {
    if (flashcardFilter === 'all') return true;
    return bookmarkedCards.includes(idx);
  });

  const activeFlashcardIdx = filteredFlashcardIndices[currentFlashcardIdx] ?? 0;
  const currentFlashcard = enhanced.flashcards[activeFlashcardIdx];

  const handleFlashcardNext = () => {
    setCardFlipped(false);
    setTimeout(() => {
      if (currentFlashcardIdx < filteredFlashcardIndices.length - 1) {
        setCurrentFlashcardIdx(prev => prev + 1);
      } else {
        setCurrentFlashcardIdx(0);
      }
    }, 150);
  };

  const handleFlashcardPrev = () => {
    setCardFlipped(false);
    setTimeout(() => {
      if (currentFlashcardIdx > 0) {
        setCurrentFlashcardIdx(prev => prev - 1);
      } else {
        setCurrentFlashcardIdx(filteredFlashcardIndices.length - 1);
      }
    }, 150);
  };

  const handleShuffleFlashcards = () => {
    setCardFlipped(false);
    const shuffled = [...flashcardOrder].sort(() => Math.random() - 0.5);
    setFlashcardOrder(shuffled);
    setCurrentFlashcardIdx(0);
  };

  const toggleBookmarkFlashcard = (idx: number) => {
    setBookmarkedCards(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // --- AI Mentor Chat Handlers ---
  const handleSendMentorMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim() || mentorLoading) return;

    const userText = mentorInput;
    setMentorInput('');
    setMentorMessages(prev => [...prev, { sender: 'student', text: userText }]);
    setMentorLoading(true);

    // Context parameters injected dynamically
    const trackName = track?.name || '';
    const lessonTitle = lesson?.title || '';
    const activeTabName = TABS[currentStep]?.label || '';
    
    let userPracticeCode = '';
    if (currentStep === 2) {
      const playgroundCode = localStorage.getItem(`ls_playground_${lesson.slug}`);
      if (playgroundCode) {
        userPracticeCode = `\nUSER PRACTICE CODE ATTEMPT:\n\`\`\`\n${playgroundCode}\n\`\`\``;
      }
    }

    let quizContext = '';
    if (currentStep === 3) {
      const challenges = lesson.challenges || [];
      const challenge = challenges[challengeIndex];
      if (challenge) {
        quizContext = `\nACTIVE QUIZ QUESTION: "${challenge.question}"\nTYPE: ${challenge.type}\nUSER ANSWER GIVEN: "${userAnswer}"\nIS CORRECT: ${feedback ? (feedback.correct ? 'Yes' : 'No') : 'Unsubmitted'}`;
      }
    }

    const fullMessageForAI = `
[CONTEXT INJECTED AUTOMATICALLY]
TRACK: ${trackName}
LESSON: ${lessonTitle}
ACTIVE TAB STEP: ${activeTabName}
${userPracticeCode}
${quizContext}
----------------------------------------
STUDENT MESSAGE:
${userText}
`.trim();

    try {
      const res = await aiService.mentor(fullMessageForAI, lesson.slug, track.slug, 'default');
      setMentorMessages(prev => [...prev, { sender: 'mentor', text: res.response || res.message }]);

      if (res.reward && res.reward.rewarded) {
        // Grant XP and Coins in client state immediately
        updateUser({
          ...user,
          xp: res.reward.totalXp,
          learn_coins: res.reward.totalCoins,
          level: res.reward.level
        });

        // Insert a friendly system notice in chat log
        setMentorMessages(prev => [
          ...prev,
          { 
            sender: 'system', 
            text: `🎉 Reward Earned! +10 XP and +5 LearnCoins awarded for your first AI mentor interaction in this lesson.` 
          }
        ]);
      }
    } catch (err) {
      console.error('AI Service Error:', err);
      setMentorMessages(prev => [
        ...prev, 
        { 
          sender: 'mentor', 
          text: '🤖 Note: The AI Mentor is currently offline or unreachable. You can still continue studying your lesson, practice, and complete the quiz normally!' 
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="workspace-layout">
        
        {/* Workspace Body */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: mentorOpen ? '1fr 340px' : '1fr 48px', 
            gap: 'var(--space-6)', 
            height: 'calc(100vh - 100px)', 
            padding: 'var(--space-4)',
            transition: 'grid-template-columns 0.3s ease-in-out'
          }} 
          className="workspace-main-panel"
        >
          
          {/* Main workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '12px' }} className="no-scrollbar">
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {track.name} • Lesson {lesson.display_order}
                </span>
                <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '2px 0 0' }}>{lesson.title}</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {lesson.estimated_minutes || 8} min
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚡ {lesson.xp_reward || 25} XP
                </span>
              </div>
            </div>

            {/* Segmented Tab Headers */}
            <nav className="premium-tabs" style={{ marginBottom: 'var(--space-6)' }}>
              {TABS.map((tab, idx) => {
                const isUnlocked = idx <= maxStepReached || completedLessonsSet.has(lesson.id.toString());
                const isActive = currentStep === idx;

                return (
                  <button
                    key={idx}
                    className={`tab-button ${isActive ? 'tab-button--active' : ''}`}
                    onClick={() => handleTabClick(idx)}
                    disabled={!isUnlocked}
                    style={isActive ? { borderColor: track.color, color: track.color } : {}}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Main Content Area */}
            <div className="workspace-content-card card" style={{ padding: 'var(--space-6)', flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1 }}
                >
                  
                  {/* STEP 0: OVERVIEW */}
                  {currentStep === 0 && (
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎯 Learning Outcomes
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                        By the end of this structured lesson, you will be able to master the following coding concepts:
                      </p>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                        {enhanced.learningObjective.map((obj, i) => (
                          <li key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* STEP 1: LESSON DETAILS */}
                  {currentStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Concept Explanation */}
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>📖 Concept Explanation</h3>
                        <div 
                          className="lesson-markdown"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(lesson.concept_content) }} 
                          style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}
                        />
                      </div>

                      {/* Why Matters Spotlight */}
                      <div className="lesson-spotlight lesson-spotlight--why">
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px' }}>
                          🌍 Why This Matters
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                          {enhanced.whyMatters}
                        </p>
                      </div>

                      {/* Real World Spotlight */}
                      <div className="lesson-spotlight lesson-spotlight--realworld">
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px' }}>
                          🏢 Real-World Application
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                          {enhanced.realWorldScenario}
                        </p>
                      </div>

                      {/* Visual Explanation Card */}
                      {enhanced.visualExplanation && (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>🖼️ Visual Learning Guide: {enhanced.visualExplanation.title}</h4>
                          
                          {/* Comparison Cards Grid */}
                          {enhanced.visualExplanation.type === 'comparison' && enhanced.visualExplanation.cards && (
                            <div className="visual-comparison-grid">
                              {enhanced.visualExplanation.cards.map((c, idx) => (
                                <div key={idx} className="visual-comparison-card">
                                  <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>{c.title}</strong>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.description}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comparison Tables */}
                          {enhanced.visualExplanation.type === 'table' && enhanced.visualExplanation.headers && enhanced.visualExplanation.rows && (
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '8px' }}>
                                <thead>
                                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
                                    {enhanced.visualExplanation.headers.map((h, i) => (
                                      <th key={i} style={{ padding: '8px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {enhanced.visualExplanation.rows.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                      {row.map((cell, cidx) => (
                                        <td key={cidx} style={{ padding: '8px', color: 'var(--text-secondary)' }}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Code Walkthrough & Line Annotations */}
                      {enhanced.codeWalkthrough && (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>💻 Annotated Code Walkthrough</h4>
                          <div className="code-walkthrough-split">
                            <div style={{ background: '#1e1e1e', borderRadius: 'var(--radius-md)', padding: '14px', overflowX: 'auto' }}>
                              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#d4d4d4', lineHeight: 1.5 }}>
                                {enhanced.codeWalkthrough.code.split('\n').map((line, idx) => {
                                  const lineNum = idx + 1;
                                  const hasAnnotation = enhanced.codeWalkthrough.annotations.some(a => a.line === lineNum);
                                  const isActive = activeWalkthroughLine === lineNum;

                                  return (
                                    <div 
                                      key={idx} 
                                      onClick={() => hasAnnotation && setActiveWalkthroughLine(isActive ? null : lineNum)}
                                      style={{
                                        display: 'flex',
                                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                        cursor: hasAnnotation ? 'pointer' : 'default',
                                        padding: '2px 4px',
                                        borderRadius: '2px'
                                      }}
                                    >
                                      <span style={{ width: '24px', color: hasAnnotation ? 'var(--accent-blue)' : '#858585', textAlign: 'right', paddingRight: '8px', userSelect: 'none', fontWeight: hasAnnotation ? 700 : 400 }}>
                                        {lineNum}
                                      </span>
                                      <span style={{ color: hasAnnotation ? '#ffffff' : 'inherit' }}>{line}</span>
                                    </div>
                                  );
                                })}
                              </pre>
                            </div>
                            
                            <div className="code-walkthrough-annotations">
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Line Annotations</span>
                              {enhanced.codeWalkthrough.annotations.map((ann, idx) => (
                                <div 
                                  key={idx} 
                                  className={`code-annotation-card ${activeWalkthroughLine === ann.line ? 'code-annotation-card--active' : ''}`}
                                  onClick={() => setActiveWalkthroughLine(activeWalkthroughLine === ann.line ? null : ann.line)}
                                >
                                  <strong>Line {ann.line}:</strong>
                                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{ann.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: PRACTICE */}
                  {currentStep === 2 && (
                    <div style={{ height: '100%' }}>
                      <InteractivePlayground 
                        language={lesson.example_language || 'javascript'}
                        template={lesson.practice_template || ''}
                        instruction={lesson.practice_instruction || ''}
                        answer={lesson.practice_answer || ''}
                        slug={lesson.slug}
                        onCorrect={() => setMaxStepReached(prev => Math.max(prev, 3))}
                      />
                    </div>
                  )}

                  {/* STEP 3: QUIZ (KNOWLEDGE CHECK) */}
                  {currentStep === 3 && (
                    <div>
                      {quizSubmitted ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
                            {quizScore >= 4 ? '🏆' : '📝'}
                          </span>
                          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Quiz Completed</h3>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            You scored <strong>{quizScore} out of {lesson.challenges?.length || 5}</strong> ({Math.round((quizScore / (lesson.challenges?.length || 5)) * 100)}%)
                          </p>

                          {quizScore >= 4 ? (
                            <div style={{ marginTop: '20px' }}>
                              <p style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
                                🎉 Congratulations! You passed the lesson quiz knowledge check.
                              </p>
                            </div>
                          ) : (
                            <div style={{ marginTop: '20px' }}>
                              <p style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '13px' }}>
                                ⚠️ Minimum passing score is 80% (4/5). We recommend retrying.
                              </p>
                              <button onClick={handleResetQuiz} className="btn btn--secondary btn--md" style={{ marginTop: '12px' }}>
                                Retry Quiz
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        lesson.challenges?.[challengeIndex] && (
                          <div className="lesson-challenge">
                            <span className="lesson-challenge__counter">
                              Question {challengeIndex + 1} of {lesson.challenges.length}
                            </span>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
                              {lesson.challenges[challengeIndex].question}
                            </h3>

                            {/* MCQ */}
                            {lesson.challenges[challengeIndex].type === 'multiple-choice' && (
                              <div className="lesson-challenge__options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {lesson.challenges[challengeIndex].options?.map((opt: string, i: number) => {
                                  const isSelected = selectedOption === i;
                                  let stateClass = '';
                                  if (feedback) {
                                    if (i === lesson.challenges[challengeIndex].correct_index) {
                                      stateClass = 'challenge-option--correct';
                                    } else if (isSelected) {
                                      stateClass = 'challenge-option--wrong';
                                    }
                                  } else if (isSelected) {
                                    stateClass = 'challenge-option--selected';
                                  }

                                  return (
                                    <button
                                      key={i}
                                      disabled={!!feedback}
                                      onClick={() => setSelectedOption(i)}
                                      className={`challenge-option ${stateClass}`}
                                    >
                                      <span className="challenge-option__letter">{String.fromCharCode(65 + i)}</span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Fill Blanks */}
                            {lesson.challenges[challengeIndex].type === 'fill-blank' && (
                              <div className="lesson-challenge__template">
                                {lesson.challenges[challengeIndex].template?.split('___').map((part: string, i: number, arr: any[]) => (
                                  <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                      <input
                                        type="text"
                                        className="challenge-fill-input"
                                        disabled={!!feedback}
                                        value={userAnswer}
                                        onChange={e => setUserAnswer(e.target.value)}
                                        style={{ width: '100px', display: 'inline-block' }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}

                            {/* Output Prediction */}
                            {lesson.challenges[challengeIndex].type === 'output-prediction' && (
                              <div>
                                <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                                  {lesson.challenges[challengeIndex].starter_code}
                                </pre>
                                <div style={{ marginTop: '12px' }}>
                                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Predict expected console output or return value:</label>
                                  <input
                                    type="text"
                                    className="challenge-fill-input"
                                    placeholder="Type output..."
                                    disabled={!!feedback}
                                    value={userAnswer}
                                    onChange={e => setUserAnswer(e.target.value)}
                                    style={{ width: '100%' }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Match Following */}
                            {lesson.challenges[challengeIndex].type === 'match-following' && (
                              <div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Click a term on the left, then click its match on the right.</p>
                                <div className="match-grid-layout">
                                  <div className="match-column">
                                    {Object.keys(lesson.challenges[challengeIndex].pairs || {}).map(k => {
                                      const isSelected = selectedMatchKey === k;
                                      const isMatched = !!matches[k];
                                      return (
                                        <div 
                                          key={k} 
                                          onClick={() => !isMatched && handleMatchClick('left', k)}
                                          className={`match-card ${isSelected ? 'match-card--selected' : ''} ${isMatched ? 'match-card--disabled' : ''}`}
                                        >
                                          {k} {isMatched && `➔ ${matches[k]}`}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="match-column">
                                    {Object.values(lesson.challenges[challengeIndex].pairs || {}).sort(() => 0.5 - Math.random()).map((v: any) => {
                                      const isMatched = Object.values(matches).includes(v);
                                      return (
                                        <div 
                                          key={v} 
                                          onClick={() => !isMatched && handleMatchClick('right', v)}
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
                            {lesson.challenges[challengeIndex].type === 'debugging' && (
                              <div>
                                <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderLeft: '3px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '12px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                                  {lesson.challenges[challengeIndex].starter_code}
                                </pre>
                                <div style={{ marginTop: '12px' }}>
                                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Provide the corrected code line or statement:</label>
                                  <input
                                    type="text"
                                    className="challenge-fill-input"
                                    placeholder="Type fixed line..."
                                    disabled={!!feedback}
                                    value={userAnswer}
                                    onChange={e => setUserAnswer(e.target.value)}
                                    style={{ width: '100%' }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Feedback review */}
                            {feedback && (
                              <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid', backgroundColor: feedback.correct ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderColor: feedback.correct ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: feedback.correct ? 'var(--accent-green)' : 'var(--accent-rose)', display: 'block' }}>
                                  {feedback.message}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                                  <strong>Explanation:</strong> {lesson.challenges[challengeIndex].explanation}
                                </span>
                              </div>
                            )}

                            {/* Navigation controls */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                              {!feedback ? (
                                <button 
                                  onClick={handleVerifyAnswer} 
                                  className="btn btn--primary btn--md"
                                  disabled={
                                    lesson.challenges[challengeIndex].type === 'multiple-choice' ? selectedOption === null : 
                                    (lesson.challenges[challengeIndex].type === 'match-following' ? Object.keys(matches).length < Object.keys(lesson.challenges[challengeIndex].pairs || {}).length : !userAnswer.trim())
                                  }
                                >
                                  Verify Answer
                                </button>
                              ) : (
                                <button onClick={handleNextQuestion} className="btn btn--primary btn--md">
                                  {challengeIndex < lesson.challenges.length - 1 ? 'Next Question' : 'View Results'}
                                </button>
                              )}
                            </div>

                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* STEP 4: SUMMARY */}
                  {currentStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>💡 Lesson Summary</h2>
                      
                      {/* Key points */}
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Key Takeaways</span>
                        <ul style={{ paddingLeft: '20px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {enhanced.keyTakeaways.bullet_points.map((pt, i) => (
                            <li key={i} style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Mistakes */}
                      {enhanced.keyTakeaways.common_mistakes && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--accent-rose)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>⚠️ Common Mistakes to Avoid</span>
                          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {enhanced.keyTakeaways.common_mistakes.map((mistake, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Revision */}
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Quick Revision</span>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                          {enhanced.keyTakeaways.quick_revision}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {quizScore >= 4 && (
                          <button
                            onClick={handleCompleteLesson}
                            disabled={isCompleting}
                            className="btn btn--primary btn--md"
                            style={{
                              background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
                              color: 'white',
                              fontWeight: 600,
                              minWidth: '220px'
                            }}
                          >
                            {isCompleting ? 'Completing...' : 'Complete Lesson & Continue'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMaxStepReached(prev => Math.max(prev, 5));
                            setCurrentStep(5);
                          }}
                          className="btn btn--secondary btn--md"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          Try Flashcards (Optional) <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: FLASHCARDS */}
                  {currentStep === 5 && (
                    <div className="flashcards-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Card {filteredFlashcardIndices.length > 0 ? currentFlashcardIdx + 1 : 0} of {filteredFlashcardIndices.length}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleShuffleFlashcards}
                            title="Shuffle Cards"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-secondary)' }}
                          >
                            <Shuffle size={16} />
                          </button>
                          
                          <select
                            value={flashcardFilter}
                            onChange={e => { setFlashcardFilter(e.target.value as any); setCurrentFlashcardIdx(0); }}
                            style={{ fontSize: '11px', outline: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 4px', backgroundColor: 'var(--bg-primary)' }}
                          >
                            <option value="all">All Flashcards</option>
                            <option value="bookmarked">Bookmarked Only</option>
                          </select>
                        </div>
                      </div>

                      {filteredFlashcardIndices.length === 0 ? (
                        <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                          <span>🔖</span>
                          <span style={{ fontSize: '12px', marginTop: '6px' }}>No bookmarked flashcards in this lesson.</span>
                        </div>
                      ) : (
                        currentFlashcard && (
                          <div className="flashcard-perspective" onClick={() => setCardFlipped(!cardFlipped)}>
                            <div className={`flashcard-inner ${cardFlipped ? 'flashcard-inner--flipped' : ''}`}>
                              
                              {/* Front Face */}
                              <div className="flashcard-face flashcard-face--front">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleBookmarkFlashcard(activeFlashcardIdx); }}
                                  style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: bookmarkedCards.includes(activeFlashcardIdx) ? 'var(--accent-amber)' : 'var(--text-muted)' }}
                                >
                                  <Bookmark size={18} fill={bookmarkedCards.includes(activeFlashcardIdx) ? 'currentColor' : 'none'} />
                                </button>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>Front</span>
                                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{currentFlashcard.front}</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', position: 'absolute', bottom: '14px' }}>Click to flip card</span>
                              </div>

                              {/* Back Face */}
                              <div className="flashcard-face flashcard-face--back">
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>Back</span>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{currentFlashcard.back}</p>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', position: 'absolute', bottom: '14px' }}>Click to flip back</span>
                              </div>

                            </div>
                          </div>
                        )
                      )}

                      {filteredFlashcardIndices.length > 0 && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button onClick={handleFlashcardPrev} className="btn btn--secondary btn--sm">Previous</button>
                          <button onClick={handleFlashcardNext} className="btn btn--secondary btn--sm">Next Card</button>
                        </div>
                      )}

                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
              <button 
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} 
                disabled={currentStep === 0}
                className="btn btn--secondary btn--sm"
              >
                Back
              </button>
              
              {currentStep < TABS.length - 1 && (
                <button
                  onClick={handleNextStep}
                  disabled={currentStep >= maxStepReached && !completedLessonsSet.has(lesson.id.toString())}
                  className="btn btn--primary btn--sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Continue <ChevronRight size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Collapsible AI Mentor Chat Sidebar */}
          {!mentorOpen ? (
            <div 
              className="card" 
              onClick={toggleMentorOpen}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                padding: '24px 6px', 
                cursor: 'pointer', 
                gap: '16px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px dashed var(--border)',
                height: '100%',
                opacity: 0.8,
                transition: 'opacity 0.2s',
                overflow: 'hidden'
              }}
              title="Expand AI Mentor"
            >
              <button 
                className="btn btn--secondary" 
                style={{ padding: '6px', border: 'none', background: 'transparent', fontSize: '18px' }}
              >
                🤖
              </button>
              <div style={{ writingMode: 'vertical-rl', textTransform: 'uppercase', fontSize: '10.5px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-muted)', userSelect: 'none' }}>
                AI MENTOR
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🤖</span>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>AI Lesson Mentor</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ask questions about this concept</span>
                  </div>
                </div>
                <button 
                  onClick={toggleMentorOpen}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer', 
                    fontSize: '12px', 
                    padding: '4px',
                    fontWeight: 'bold'
                  }}
                  title="Collapse Panel"
                >
                  ✕
                </button>
              </div>

              {/* Chat messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }} className="no-scrollbar">
                <div className="chat-msg chat-msg--mentor" style={{ backgroundColor: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '12px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                  Hi! I am your interactive AI coding mentor. Ask me anything about <strong>{lesson.title}</strong>, or select one of the suggested prompts below!
                </div>

                {mentorMessages.map((msg, i) => {
                  if (msg.sender === 'system') {
                    return (
                      <div 
                        key={i}
                        style={{
                          alignSelf: 'center',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px dashed var(--border)',
                          fontSize: '11px',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'center',
                          margin: '6px 0',
                          maxWidth: '90%'
                        }}
                      >
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        alignSelf: msg.sender === 'student' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: msg.sender === 'student' ? 'var(--accent-blue-glow)' : 'var(--bg-primary)',
                        color: msg.sender === 'student' ? 'var(--accent-blue)' : 'var(--text-primary)',
                        border: msg.sender === 'student' ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                })}

                {mentorLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>
                    <span className="btn__spinner" style={{ width: '12px', height: '12px', border: '2px solid var(--text-muted)', borderTopColor: 'transparent' }} />
                    Mentor is typing...
                  </div>
                )}
                <div ref={mentorEndRef} />
              </div>

              {/* Dynamic Suggested Prompts badges */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Suggested Prompts</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }} className="no-scrollbar">
                  {getSuggestedPromptsForStep(currentStep).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMentorInput(s.prompt)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        fontSize: '10.5px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMentorMsg} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Ask your mentor..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                <button type="submit" disabled={!mentorInput.trim() || mentorLoading} className="btn btn--primary btn--sm" style={{ padding: '6px 12px' }}>
                  Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Success Celebration Overlay */}
      {showSuccessOverlay && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card"
            style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '400px', width: '90%' }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎉</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Lesson Completed!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '8px 0 20px' }}>
              Excellent job! You passed the quiz and completed the structured roadmap objectives. You earned <strong>+{lesson.xp_reward || 25} XP</strong>!
            </p>
            <button 
              onClick={() => {
                setShowSuccessOverlay(false);
                navigate(`/track/${track.slug}`);
              }} 
              className="btn btn--primary btn--md"
              style={{ width: '100%' }}
            >
              Continue to Roadmap
            </button>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
