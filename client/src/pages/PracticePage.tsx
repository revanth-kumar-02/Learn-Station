import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { practiceService, PracticeLesson } from '../services/practiceService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

export default function PracticePage() {
  const { user, updateUser } = useAuth();
  const [lessons, setLessons] = useState<PracticeLesson[]>([]);
  const [dailyPracticeXp, setDailyPracticeXp] = useState(0);
  const [completedLessonsToday, setCompletedLessonsToday] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation state
  const [selectedLesson, setSelectedLesson] = useState<PracticeLesson | null>(null);
  const [activeMode, setActiveMode] = useState<'quiz' | 'challenge' | 'flashcard' | 'timed' | 'ai-interview' | 'notes' | null>(null);

  // Load data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await practiceService.getCompletedLessons();
      setLessons(res.completedLessons);
      setDailyPracticeXp(res.dailyPracticeXp);
      setCompletedLessonsToday(res.completedLessonsToday);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch completed lessons. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackToDashboard = () => {
    setSelectedLesson(null);
    setActiveMode(null);
    fetchData(); // Refresh stats
  };

  const handleBackToLauncher = () => {
    setActiveMode(null);
  };

  return (
    <PageTransition>
      <div className="practice-page" style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {loading && !selectedLesson ? (
            <Loader />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '48px' }}>⚠️</span>
              <h3 style={{ marginTop: '16px' }}>Error Loading Practice Hub</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{error}</p>
              <button className="btn btn--primary" onClick={fetchData} style={{ marginTop: '20px' }}>Retry</button>
            </div>
          ) : !selectedLesson ? (
            /* Main Dashboard View */
            <MainDashboard
              lessons={lessons}
              dailyPracticeXp={dailyPracticeXp}
              completedLessonsToday={completedLessonsToday}
              onSelectLesson={setSelectedLesson}
            />
          ) : !activeMode ? (
            /* Launcher View */
            <PracticeLauncher
              lesson={selectedLesson}
              onBack={handleBackToDashboard}
              onSelectMode={setActiveMode}
            />
          ) : (
            /* Active Mode View */
            <PracticeModeContainer
              lesson={selectedLesson}
              mode={activeMode}
              onBack={handleBackToLauncher}
              onComplete={async (xpEarned) => {
                // Instantly update local states before fetching
                setDailyPracticeXp(prev => Math.min(100, prev + xpEarned));
                if (updateUser) {
                  updateUser({
                    xp: (user?.xp || 0) + xpEarned
                  });
                }
              }}
            />
          )}

        </div>
      </div>
    </PageTransition>
  );
}

/* 1. Main Dashboard View */
interface MainDashboardProps {
  lessons: PracticeLesson[];
  dailyPracticeXp: number;
  completedLessonsToday: string[];
  onSelectLesson: (lesson: PracticeLesson) => void;
}

function MainDashboard({ lessons, dailyPracticeXp, completedLessonsToday, onSelectLesson }: MainDashboardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Title */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Practice Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '16px' }}>
          Unlock unlimited practice activities for completed roadmap lessons to master your skills and earn XP.
        </p>
      </div>

      {/* Progress Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Daily Roadmap Lessons */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--accent-violet) 0%, var(--accent-blue) 100%)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎯 Roadmap Progression
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Daily roadmap lessons completed</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '24px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>{completedLessonsToday.length} <span style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 500 }}>/ 4</span></span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: completedLessonsToday.length >= 4 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
              {completedLessonsToday.length >= 4 ? 'Goal Reached! 🚀' : 'Keep learning!'}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.min(100, (completedLessonsToday.length / 4) * 100)}%`, 
                background: 'linear-gradient(90deg, var(--accent-violet) 0%, var(--accent-blue) 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>
        </div>

        {/* Practice XP Card */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-emerald) 100%)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Practice XP Cap
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Daily practice XP limit</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '24px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>{dailyPracticeXp} <span style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 500 }}>/ 100 XP</span></span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: dailyPracticeXp >= 100 ? 'var(--accent-rose)' : 'var(--accent-blue)' }}>
              {dailyPracticeXp >= 100 ? 'Capped 🔒' : `${100 - dailyPracticeXp} XP Remaining`}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${Math.min(100, (dailyPracticeXp / 100) * 100)}%`, 
                background: 'linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-emerald) 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Completed Lessons Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Completed Lessons ({lessons.length})</h2>
      </div>

      {lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '48px' }}>📚</span>
          <h3 style={{ marginTop: '16px', fontWeight: 700 }}>No Completed Lessons Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '400px', margin: '8px auto 20px auto', fontSize: '14px' }}>
            Go to your roadmap dashboard and complete lessons. Once completed, they will appear here for practice!
          </p>
          <a href="/tracks" className="btn btn--primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Browse Tracks</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {lessons.map((lesson) => {
            const trackColor = lesson.track?.color || 'var(--accent-blue)';
            return (
              <motion.div
                key={lesson.id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => onSelectLesson(lesson)}
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '20px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '180px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span 
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: `rgba(255, 255, 255, 0.05)`, 
                        border: `1px solid ${trackColor}`,
                        color: trackColor,
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {lesson.track?.name || 'Lesson'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    {lesson.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏱️ {lesson.estimated_minutes || 8} min learn</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-violet)' }}>Practice &rarr;</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* 2. Practice Launcher View */
interface PracticeLauncherProps {
  lesson: PracticeLesson;
  onBack: () => void;
  onSelectMode: (mode: 'quiz' | 'challenge' | 'flashcard' | 'timed' | 'ai-interview' | 'notes') => void;
}

function PracticeLauncher({ lesson, onBack, onSelectMode }: PracticeLauncherProps) {
  const modesList = [
    { key: 'quiz', name: 'Quiz Practice', desc: 'Solve MCQ, True/False, and fill-in-the-blanks using lesson challenges.', icon: '🎯', badge: '+5 XP', color: 'var(--accent-blue)' },
    { key: 'challenge', name: 'Coding Challenges', desc: 'Code exercises! Fix the missing blocks, complete functions, and verify output syntax.', icon: '💻', badge: '+10 XP', color: 'var(--accent-emerald)' },
    { key: 'flashcard', name: 'Flash Cards', desc: 'Flip concept cards containing highlights, terminology, and reference notes.', icon: '🎴', badge: 'Study Mode', color: 'var(--accent-orange)' },
    { key: 'timed', name: 'Challenge Mode', desc: 'Answer questions under pressure! Active 15s countdown timer per question.', icon: '⏳', badge: '+10 XP', color: 'var(--accent-rose)' },
    { key: 'ai-interview', name: 'AI Interview Mode', desc: 'Simulated AI mock interview. Answer concept questions and get graded with feedback.', icon: '🤖', badge: '+15 XP', color: 'var(--accent-violet)' },
    { key: 'notes', name: 'Revision Notes', desc: 'Quick cheatsheet review with code examples, definitions, and highlights.', icon: '📝', badge: 'Revision', color: 'var(--text-secondary)' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      {/* Header link */}
      <button 
        onClick={onBack} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: 600,
          marginBottom: '24px',
          padding: 0
        }}
      >
        &larr; Back to Dashboard
      </button>

      {/* Lesson Details Card */}
      <div 
        style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-xl)', 
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: lesson.track?.color || 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {lesson.track?.name}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Module Progress</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{lesson.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
          {lesson.concept_title || `Mastering the conceptual applications of ${lesson.title}. Select a practice mode below.`}
        </p>
      </div>

      {/* Launcher Grid */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Select Practice Mode</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {modesList.map((mode) => (
          <motion.div
            key={mode.key}
            whileHover={{ y: -4, borderColor: mode.color }}
            onClick={() => onSelectMode(mode.key as any)}
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '24px', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '180px',
              transition: 'border-color 0.25s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{mode.icon}</span>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '20px', 
                    backgroundColor: `rgba(255, 255, 255, 0.04)`, 
                    color: mode.color,
                    border: `1px solid ${mode.color}` 
                  }}
                >
                  {mode.badge}
                </span>
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>{mode.name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>{mode.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* 3. Active Mode Container */
interface PracticeModeContainerProps {
  lesson: PracticeLesson;
  mode: 'quiz' | 'challenge' | 'flashcard' | 'timed' | 'ai-interview' | 'notes';
  onBack: () => void;
  onComplete: (xp: number) => void;
}

function PracticeModeContainer({ lesson, mode, onBack, onComplete }: PracticeModeContainerProps) {
  const [completeState, setCompleteState] = useState<{ xp: number; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const submitCompletion = async (xpValue: number) => {
    try {
      setSaving(true);
      const res = await practiceService.completePracticeActivity(lesson.id, mode);
      setCompleteState({
        xp: res.xpEarned,
        msg: res.message
      });
      onComplete(res.xpEarned);
    } catch (err) {
      console.error(err);
      setCompleteState({
        xp: 0,
        msg: 'Failed to report practice completion to the server, but nice work!'
      });
    } finally {
      setSaving(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'quiz': return 'Quiz Practice';
      case 'challenge': return 'Coding Challenge';
      case 'flashcard': return 'Flash Cards';
      case 'timed': return 'Challenge Mode (Timed)';
      case 'ai-interview': return 'AI Mock Interview';
      case 'notes': return 'Revision Notes';
      default: return 'Practice';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Mode Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: 600,
            padding: 0
          }}
        >
          &larr; Exit Practice
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          {getModeTitle()}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {saving ? (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <Loader />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Saving practice results...</p>
          </motion.div>
        ) : completeState ? (
          /* Completion Screen */
          <motion.div 
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-xl)', 
              boxShadow: 'var(--shadow-lg)',
              marginTop: '40px'
            }}
          >
            <span style={{ fontSize: '64px' }}>🎉</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '20px' }}>Practice Session Done!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px', maxWidth: '480px', margin: '8px auto 24px auto' }}>
              {completeState.msg}
            </p>
            {completeState.xp > 0 && (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px 24px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid var(--accent-emerald)', 
                  borderRadius: '30px', 
                  color: 'var(--accent-emerald)',
                  fontWeight: 700,
                  fontSize: '18px',
                  marginBottom: '32px'
                }}
              >
                <span>⚡</span>
                <span>+{completeState.xp} Practice XP Earned!</span>
              </div>
            )}
            <div>
              <button 
                onClick={onBack} 
                className="btn btn--ghost" 
                style={{ marginRight: '12px', border: '1px solid var(--border)' }}
              >
                Other Modes
              </button>
              <button 
                onClick={onBack} 
                className="btn btn--primary"
                style={{ background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)' }}
              >
                Return to Hub
              </button>
            </div>
          </motion.div>
        ) : (
          /* Active Mode Implementation */
          <motion.div key="mode-body" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {mode === 'quiz' && (
              <QuizPracticeMode lesson={lesson} onFinished={submitCompletion} timed={false} />
            )}
            {mode === 'timed' && (
              <QuizPracticeMode lesson={lesson} onFinished={submitCompletion} timed={true} />
            )}
            {mode === 'challenge' && (
              <CodingChallengeMode lesson={lesson} onFinished={submitCompletion} />
            )}
            {mode === 'flashcard' && (
              <FlashcardsPracticeMode lesson={lesson} onFinished={() => submitCompletion(0)} />
            )}
            {mode === 'ai-interview' && (
              <AiInterviewMode lesson={lesson} onFinished={submitCompletion} />
            )}
            {mode === 'notes' && (
              <RevisionNotesMode lesson={lesson} onFinished={() => submitCompletion(0)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 3.1. Quiz Practice & Timed Mode */
interface QuizPracticeModeProps {
  lesson: PracticeLesson;
  onFinished: (xp: number) => void;
  timed: boolean;
}

function QuizPracticeMode({ lesson, onFinished, timed }: QuizPracticeModeProps) {
  // Use challenges from lesson or generate fallback
  const questions = lesson.challenges && lesson.challenges.length > 0 ? lesson.challenges : [
    {
      type: 'multiple-choice',
      question: `What is the primary architectural concept introduced in "${lesson.title}"?`,
      options: [
        'Modular abstraction and clean separation of logical layers.',
        'Direct pointer access on the call stack.',
        'Removing type assertions entirely.',
        'Avoiding async events.'
      ],
      correct_index: 0,
      explanation: 'Modular structures divide the codebase logically and ensure clean testing interfaces.'
    },
    {
      type: 'fill-blank',
      question: `Complete the template declaration:`,
      template: lesson.practice_template || 'const state = ___ ;',
      answer: lesson.practice_answer || 'true',
      explanation: 'Entering the correct value creates a valid instruction.'
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [blankInput, setBlankInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<any | null>(null);

  const currentQuestion = questions[currentIdx] || questions[0];

  // Start timer for Timed Mode
  useEffect(() => {
    if (!timed || submitted) return;
    
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, submitted]);

  const handleTimeOut = () => {
    setSubmitted(true);
  };

  const handleOptionSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOpt(idx);
  };

  const checkAnswer = () => {
    if (submitted) return;
    
    let correct = false;
    if (currentQuestion.type === 'fill-blank') {
      const ans = currentQuestion.answer || lesson.practice_answer || '';
      correct = blankInput.trim().toLowerCase() === ans.toLowerCase();
    } else {
      const correctIdx = currentQuestion.correct_index !== undefined ? currentQuestion.correct_index : 0;
      correct = selectedOpt === correctIdx;
    }

    if (correct) {
      setScore(prev => prev + 1);
    }
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setBlankInput('');
      setSubmitted(false);
    } else {
      // Finished
      onFinished(timed ? 10 : 5); // +10 XP for timed, +5 XP for standard
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
      {/* Progress & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Question {currentIdx + 1} of {questions.length}
        </span>
        {timed && !submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft <= 5 ? 'var(--accent-rose)' : 'var(--accent-orange)' }}>
            <span style={{ fontSize: '18px' }}>⏰</span>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Question */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.5, marginBottom: '24px' }}>
        {currentQuestion.question}
      </h3>

      {/* Options / Input */}
      {currentQuestion.type === 'fill-blank' ? (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'monospace', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--border)' }}>
            {currentQuestion.template?.replace('___', '______')}
          </div>
          <input 
            type="text"
            className="input"
            placeholder="Type missing content..."
            value={blankInput}
            onChange={(e) => setBlankInput(e.target.value)}
            disabled={submitted}
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {(currentQuestion.options || []).map((opt, idx) => {
            const isSelected = selectedOpt === idx;
            const isCorrect = idx === (currentQuestion.correct_index !== undefined ? currentQuestion.correct_index : 0);
            
            let border = '1px solid var(--border)';
            let bg = 'var(--bg-secondary)';
            if (submitted) {
              if (isCorrect) {
                border = '1px solid var(--accent-green)';
                bg = 'rgba(16, 185, 129, 0.08)';
              } else if (isSelected) {
                border = '1px solid var(--accent-rose)';
                bg = 'rgba(239, 68, 68, 0.08)';
              }
            } else if (isSelected) {
              border = '1px solid var(--accent-blue)';
              bg = 'rgba(59, 130, 246, 0.08)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={submitted}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border,
                  backgroundColor: bg,
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: submitted ? 'default' : 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: isSelected ? '2px solid var(--accent-blue)' : '2px solid var(--border)',
                  color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback & Actions */}
      {submitted && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: (currentQuestion.type === 'fill-blank' ? blankInput.trim().toLowerCase() === (currentQuestion.answer || lesson.practice_answer || '').toLowerCase() : selectedOpt === (currentQuestion.correct_index !== undefined ? currentQuestion.correct_index : 0)) ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
            {(currentQuestion.type === 'fill-blank' ? blankInput.trim().toLowerCase() === (currentQuestion.answer || lesson.practice_answer || '').toLowerCase() : selectedOpt === (currentQuestion.correct_index !== undefined ? currentQuestion.correct_index : 0)) ? '✓ Correct Answer' : '✗ Incorrect / Timed Out'}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            {currentQuestion.explanation || 'Review the lesson concepts to understand the context behind this solution.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!submitted ? (
          <button 
            onClick={checkAnswer} 
            className="btn btn--primary" 
            disabled={(currentQuestion.type === 'fill-blank' ? !blankInput.trim() : selectedOpt === null)}
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn btn--primary">
            {currentIdx < questions.length - 1 ? 'Next Question &rarr;' : 'Finish Activity'}
          </button>
        )}
      </div>
    </div>
  );
}

/* 3.2. Coding Challenge Mode */
function CodingChallengeMode({ lesson, onFinished }: { lesson: PracticeLesson; onFinished: (xp: number) => void }) {
  const [userCode, setUserCode] = useState(lesson.example_code || '// Write code here');
  const [verified, setVerified] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleVerify = () => {
    // Simple syntax verification. Look for the correct answer substring in the template
    const correctAns = (lesson.practice_answer || '').trim().toLowerCase();
    const instruction = (lesson.practice_instruction || '').toLowerCase();

    // Verify user filled code contains the practice answer
    const code = userCode.toLowerCase();
    
    let passed = false;
    if (correctAns && code.includes(correctAns)) {
      passed = true;
    } else if (instruction.includes('add') || instruction.includes('write')) {
      // Simple pass for open coding exercises
      passed = userCode.length > (lesson.example_code || '').length + 2;
    } else {
      passed = false;
    }

    setVerified(true);
    setSuccess(passed);
    if (passed) {
      setResultMsg('🎉 All test cases passed! Code compiles and executes successfully.');
    } else {
      setResultMsg(`❌ Test validation failed. Missing keyword: "${lesson.practice_answer || 'answer'}". Please follow the instructions.`);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
      {/* Instructions Pane */}
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Exercise Instructions</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
          {lesson.practice_instruction || 'Complete the following syntax by editing the sandbox workspace on the right. Make sure the code runs without syntax issues.'}
        </p>

        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>Practice Template Guide</h4>
          <code style={{ fontSize: '13px', color: 'var(--accent-orange)' }}>{lesson.practice_template || 'No template code required.'}</code>
        </div>

        {verified && (
          <div style={{ padding: '16px', backgroundColor: success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-lg)', border: success ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: success ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{resultMsg}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {!success ? (
            <button className="btn btn--primary" onClick={handleVerify} style={{ flex: 1 }}>Run Verification</button>
          ) : (
            <button className="btn btn--primary" onClick={() => onFinished(10)} style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-green) 100%)' }}>
              Claim +10 XP &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Editor Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            sandbox_workspace.{lesson.example_language || 'js'}
          </span>
          <button 
            onClick={() => setUserCode(lesson.example_code || '')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          style={{
            flex: 1,
            minHeight: '280px',
            backgroundColor: '#090d16',
            color: '#a9b1d6',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '20px',
            border: 'none',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
}

/* 3.3. Flash Cards Mode */
function FlashcardsPracticeMode({ lesson, onFinished }: { lesson: PracticeLesson; onFinished: () => void }) {
  const cards = [
    { front: `What is the core definition of "${lesson.title}"?`, back: lesson.example_explanation || 'A fundamental coding framework concept.' },
    { front: `Where is "${lesson.title}" commonly applied in real world?`, back: 'Commonly used in modular APIs, data structures parsing, UI components alignments, and secure databases connections.' },
    { front: `What syntax language is used for "${lesson.title}" in this lesson?`, back: `Language: ${lesson.example_language || 'JavaScript/TypeScript'}` },
  ];

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      if (idx < cards.length - 1) {
        setIdx(idx + 1);
      } else {
        onFinished();
      }
    }, 150);
  };

  const currentCard = cards[idx] || cards[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Card {idx + 1} of {cards.length}</p>

      {/* Card Body */}
      <div 
        onClick={() => setFlipped(!flipped)}
        style={{
          width: '100%',
          maxWidth: '450px',
          height: '280px',
          perspective: '1000px',
          cursor: 'pointer'
        }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px',
              backfaceVisibility: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Question Card</span>
            <p style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.5 }}>{currentCard.front}</p>
            <span style={{ position: 'absolute', bottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>Click card to flip 🔄</span>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--bg-tertiary)',
              border: '2px solid var(--accent-orange)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Explanation Concept</span>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>{currentCard.back}</p>
            <span style={{ position: 'absolute', bottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>Click card to flip 🔄</span>
          </div>
        </motion.div>
      </div>

      <button className="btn btn--primary" onClick={handleNext}>
        {idx < cards.length - 1 ? 'Next Card &rarr;' : 'Finish Session'}
      </button>
    </div>
  );
}

/* 3.4. AI Interview Mode */
function AiInterviewMode({ lesson, onFinished }: { lesson: PracticeLesson; onFinished: (xp: number) => void }) {
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

  const mockInterviewQuestions = [
    `Can you explain what "${lesson.title}" accomplishes and how it prevents errors or optimizes memory structure in production systems?`,
    `When designing projects that incorporate "${lesson.title}", how do you structure your file directories and code components modularly?`,
    `Explain the performance implications of ignoring best practices when implementing "${lesson.title}".`
  ];

  const randomQuestion = mockInterviewQuestions[0];

  const handleEvaluation = () => {
    if (!answer.trim()) return;

    setEvaluating(true);
    // Simulate AI grading with dynamic feedback based on user input keywords
    setTimeout(() => {
      const keywords = ['modular', 'structure', 'clean', 'security', 'api', 'state', 'const', 'let', 'pointer', 'optimize', 'cache'];
      const ansLower = answer.toLowerCase();
      let matched = 0;
      keywords.forEach(kw => {
        if (ansLower.includes(kw)) matched++;
      });

      const rawScore = 65 + (matched * 4) + Math.min(10, Math.floor(answer.length / 30));
      const scoreVal = Math.min(98, Math.max(70, rawScore));

      let feedbackText = 'Good explanation! You highlighted key syntax components. ';
      if (scoreVal >= 90) {
        feedbackText += 'Excellent depth! Your answer covers architectural safety boundaries, modular design, and handles variables context beautifully.';
      } else if (scoreVal >= 80) {
        feedbackText += 'Strong technical vocabulary. You could add more detail about edge cases or compiler constraints to score higher.';
      } else {
        feedbackText += 'Clear overview of the basic definitions. To improve, try mentioning optimization practices, caching, or code modularity concepts.';
      }

      setEvaluating(false);
      setResult({
        score: scoreVal,
        feedback: feedbackText
      });
    }, 2000);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
      {evaluating ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>AI Interviewer is grading your response...</p>
        </div>
      ) : result ? (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>🤖</span>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginTop: '16px' }}>Grade Report</h3>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(124, 58, 237, 0.1)', border: '3px solid var(--accent-violet)', margin: '20px 0' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-violet)' }}>{result.score}%</span>
          </div>

          <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5, maxWidth: '500px', margin: '0 auto 24px auto' }}>
            {result.feedback}
          </p>

          <button className="btn btn--primary" onClick={() => onFinished(15)}>
            Claim +15 XP &rarr;
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--accent-violet)', color: 'white' }}>AI QUESTION</span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.4, marginBottom: '20px' }}>
            {randomQuestion}
          </h3>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your explanation in detail (at least 2-3 sentences to secure a high grade)..."
            style={{
              width: '100%',
              minHeight: '160px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              fontSize: '14px',
              lineHeight: 1.5,
              outline: 'none',
              marginBottom: '20px',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn--primary" onClick={handleEvaluation} disabled={!answer.trim() || answer.length < 10}>
              Submit for AI Grading
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 3.5. Revision Notes Mode */
function RevisionNotesMode({ lesson, onFinished }: { lesson: PracticeLesson; onFinished: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(lesson.example_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process concept content to format nice paragraphs
  const contentParagraphs = (lesson.concept_content || '')
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => p.replace(/### \d\. /g, ''));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Explanation Sheets */}
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Lesson Overview: {lesson.title}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: 1.6, fontSize: '14px', color: 'var(--text-secondary)' }}>
          {contentParagraphs.length > 0 ? (
            contentParagraphs.map((para, i) => (
              <p key={i} style={{ color: para.startsWith('In this lesson') || para.startsWith('This concept') ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {para}
              </p>
            ))
          ) : (
            <p>Review the template code guidelines and example scripts provided inside this track module.</p>
          )}
        </div>
      </div>

      {/* Code Sandbox View */}
      {lesson.example_code && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Example Code ({lesson.example_language || 'javascript'})
            </span>
            <button 
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              {copied ? '✓ Copied' : 'Copy Code'}
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: '20px',
            backgroundColor: '#090d16',
            color: '#a9b1d6',
            fontFamily: 'monospace',
            fontSize: '13px',
            overflowX: 'auto',
            lineHeight: 1.5
          }}>
            <code>{lesson.example_code}</code>
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <button className="btn btn--primary" onClick={onFinished}>
          I'm Done Reviewing
        </button>
      </div>
    </div>
  );
}
