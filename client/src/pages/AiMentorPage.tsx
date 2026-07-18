import React, { useState } from 'react';
import { 
  aiService, QuizQuestion, PracticeChallenge, Flashcard, 
  InterviewMessage, InterviewScorecard, RoadmapStage, CareerAdvice 
} from '../services/aiService';
import { 
  Sparkles, Brain, Award, GraduationCap, Trophy, Terminal, 
  BookOpen, Compass, ChevronRight, Send, HelpCircle, RefreshCw, 
  Eye, HelpCircle as HelpIcon, FileText, CheckCircle, XCircle, 
  Play, Users, Map, Star, ShieldAlert
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import '../css/pages.css';

type SubTool = 'mentor' | 'quiz' | 'practice' | 'flashcards' | 'interview' | 'planner' | 'study' | 'career';

export default function AiMentorPage() {
  const [activeTool, setActiveTool] = useState<SubTool>('mentor');
  
  // --- MENTOR CHAT STATE ---
  const [mentorInput, setMentorInput] = useState('');
  const [mentorHistory, setMentorHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello! I am your AI learning mentor. How can I help you today? You can ask about lessons, coding structures, or request analogies!' }
  ]);
  const [mentorLoading, setMentorLoading] = useState(false);

  // --- QUIZ STATE ---
  const [quizScope, setQuizScope] = useState('SQL JOINs');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // --- PRACTICE STATE ---
  const [practiceLang, setPracticeLang] = useState('Python');
  const [practiceTopic, setPracticeTopic] = useState('File Handling');
  const [practiceChallenge, setPracticeChallenge] = useState<PracticeChallenge | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  // --- FLASHCARDS STATE ---
  const [flashcardTopic, setFlashcardTopic] = useState('CSS Flexbox');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flippedCard, setFlippedCard] = useState(false);

  // --- INTERVIEW SIMULATOR STATE ---
  const [interviewRole, setInterviewRole] = useState('Backend Engineer');
  const [interviewMode, setInterviewMode] = useState('technical');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewInput, setInterviewInput] = useState('');
  const [interviewHistory, setInterviewHistory] = useState<InterviewMessage[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewScorecard, setInterviewScorecard] = useState<InterviewScorecard | null>(null);

  // --- PLANNER ROADMAP STATE ---
  const [roadmapGoal, setRoadmapGoal] = useState('AI Engineer');
  const [roadmapLevel, setRoadmapLevel] = useState('Beginner');
  const [roadmapHours, setRoadmapHours] = useState(6);
  const [roadmapStages, setRoadmapStages] = useState<RoadmapStage[]>([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // --- STUDY ASSISTANT STATE ---
  const [studyTopic, setStudyTopic] = useState('React Hooks');
  const [studyType, setStudyType] = useState<'summary' | 'cheatsheet' | 'mindmap'>('summary');
  const [studyMarkdown, setStudyMarkdown] = useState('');
  const [studyLoading, setStudyLoading] = useState(false);

  // --- CAREER COACH STATE ---
  const [coachGoal, setCoachGoal] = useState('Frontend Developer');
  const [coachSkills, setCoachSkills] = useState('HTML, CSS, JavaScript basics');
  const [coachAdvice, setCoachAdvice] = useState<CareerAdvice | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // --- MENTOR CHAT LOGIC ---
  const sendMentorMessage = async (overrideMsg?: string) => {
    const textToSend = overrideMsg || mentorInput;
    if (!textToSend.trim()) return;

    setMentorHistory(prev => [...prev, { sender: 'user', text: textToSend }]);
    setMentorInput('');
    setMentorLoading(true);

    try {
      const res = await aiService.mentorChat(textToSend);
      setMentorHistory(prev => [...prev, { sender: 'ai', text: res.response }]);
    } catch (err) {
      setMentorHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I failed to connect to the model.' }]);
    } finally {
      setMentorLoading(false);
    }
  };

  // --- QUIZ LOGIC ---
  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizSubmitted(false);
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setSelectedAnswer('');
    try {
      const res = await aiService.generateQuiz(quizScope, quizDifficulty);
      setQuizQuestions(res.questions);
    } catch (err) {
      alert('Failed to generate quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    const currentQ = quizQuestions[currentQuizIdx];
    
    let isCorrect = false;
    if (currentQ.type === 'multiple-choice') {
      const correctOptIdx = currentQ.correct_index || 0;
      const correctText = currentQ.options?.[correctOptIdx] || '';
      isCorrect = selectedAnswer === correctText;
    } else {
      isCorrect = selectedAnswer.trim().toLowerCase() === (currentQ.answer || '').trim().toLowerCase();
    }

    if (isCorrect) {
      setQuizScore(s => s + 1);
    }
    setQuizSubmitted(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer('');
    setQuizSubmitted(false);
    if (currentQuizIdx + 1 < quizQuestions.length) {
      setCurrentQuizIdx(i => i + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // --- PRACTICE LOGIC ---
  const generatePracticeTask = async () => {
    setPracticeLoading(true);
    try {
      const res = await aiService.generatePractice(practiceLang, practiceTopic);
      setPracticeChallenge(res.challenge);
    } catch (err) {
      alert('Failed to generate practice challenge.');
    } finally {
      setPracticeLoading(false);
    }
  };

  // --- FLASHCARD LOGIC ---
  const fetchFlashcards = async () => {
    setFlashcardLoading(true);
    setActiveCardIdx(0);
    setFlippedCard(false);
    try {
      const res = await aiService.generateFlashcards(flashcardTopic);
      setFlashcards(res.cards);
    } catch (err) {
      alert('Failed to generate flashcards.');
    } finally {
      setFlashcardLoading(false);
    }
  };

  // --- INTERVIEW LOGIC ---
  const startInterview = async () => {
    setInterviewLoading(true);
    setInterviewScorecard(null);
    setInterviewHistory([]);
    try {
      const initRes = await aiService.interviewChat(interviewRole, interviewMode, [], 'Hello, I am ready to start the interview.');
      setInterviewHistory([
        { sender: 'interviewer', text: initRes.response }
      ]);
      setInterviewStarted(true);
    } catch (err) {
      alert('Failed to initialize mock interview.');
    } finally {
      setInterviewLoading(false);
    }
  };

  const sendInterviewResponse = async () => {
    if (!interviewInput.trim()) return;
    const userMsg = interviewInput;
    setInterviewHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInterviewInput('');
    setInterviewLoading(true);

    try {
      const res = await aiService.interviewChat(
        interviewRole,
        interviewMode,
        [...interviewHistory, { sender: 'user', text: userMsg }],
        userMsg
      );
      setInterviewHistory(prev => [...prev, { sender: 'interviewer', text: res.response }]);
    } catch (err) {
      alert('Interviewer model disconnected.');
    } finally {
      setInterviewLoading(false);
    }
  };

  const evaluateInterview = async () => {
    setInterviewLoading(true);
    try {
      const scorecard = await aiService.interviewEvaluate(interviewRole, interviewMode, interviewHistory);
      setInterviewScorecard(scorecard);
      setInterviewStarted(false);
    } catch (err) {
      alert('Failed to evaluate mock interview scorecard.');
    } finally {
      setInterviewLoading(false);
    }
  };

  // --- ROADMAP LOGIC ---
  const generateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await aiService.plannerRoadmap(roadmapGoal, roadmapLevel, roadmapHours);
      setRoadmapStages(res.roadmap);
    } catch (err) {
      alert('Failed to create roadmap.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  // --- STUDY GUIDE LOGIC ---
  const fetchStudyMaterial = async () => {
    setStudyLoading(true);
    try {
      const res = await aiService.studyAssist(studyTopic, studyType);
      setStudyMarkdown(res.markdown);
    } catch (err) {
      alert('Failed to generate study guide notes.');
    } finally {
      setStudyLoading(false);
    }
  };

  // --- CAREER LOGIC ---
  const fetchCareerAdvice = async () => {
    setCoachLoading(true);
    try {
      const res = await aiService.careerCoach(coachGoal, coachSkills);
      setCoachAdvice(res);
    } catch (err) {
      alert('Failed to generate career report.');
    } finally {
      setCoachLoading(false);
    }
  };

  const TOOLS = [
    { key: 'mentor',    label: 'AI Mentor Chat',       icon: <Brain size={16} /> },
    { key: 'quiz',      label: 'Adaptive Quizzes',      icon: <HelpIcon size={16} /> },
    { key: 'practice',  label: 'Practice Generator',    icon: <Terminal size={16} /> },
    { key: 'flashcards',label: 'Study Flashcards',      icon: <BookOpen size={16} /> },
    { key: 'interview', label: 'Interview Simulator',   icon: <Users size={16} /> },
    { key: 'planner',   label: 'Learning Planner',      icon: <Map size={16} /> },
    { key: 'study',     label: 'Revision Guide',        icon: <FileText size={16} /> },
    { key: 'career',    label: 'Career Coach',          icon: <Compass size={16} /> },
  ] as const;

  return (
    <div className="page-std animate-fade-in">
      <PageHeader
        icon={<Sparkles size={22} />}
        color="violet"
        eyebrow="AI-Powered Learning"
        title="AI Mentor Hub"
        description="Personal adaptive AI mentor — quiz generator, flashcards, interview simulator, and career coach all in one."
        stats={[
          { label: 'AI Tools',   value: 8 },
          { label: 'Status',     value: 'Online' },
          { label: 'Powered by', value: 'Gemini' },
        ]}
      />

      <div className="container" style={{ marginTop: '0px' }}>

      {/* ── Sidebar + Panel Layout ── */}
      <div className="std-layout">

        {/* SIDEBAR */}
        <div className="std-sidebar">
          <div className="std-sidebar__header">
            <p className="std-sidebar__title"><Sparkles size={14} /> AI Learning Hub</p>
            <p className="std-sidebar__desc">Choose a learning tool</p>
          </div>
          
          {/* MENTOR PROFILE CARD */}
          <div className="mentor-profile-card">
            <div className="mentor-avatar">
              <Brain size={20} />
              <div className="mentor-status-dot"></div>
            </div>
            <div>
              <div className="text-primary" style={{ fontWeight: 700, fontSize: '13px' }}>Architect AI</div>
              <span className="std-badge std-badge--violet" style={{ fontSize: '9px', padding: '1px 6px', display: 'inline-block', marginTop: '2px' }}>Gemini 1.5 Pro</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Specialty: Full-Stack</div>
            </div>
          </div>

          {TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTool(t.key as SubTool)}
              className={`std-nav-btn ${activeTool === t.key ? 'std-nav-btn--active' : ''}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* ACTIVE WORKSPACE */}
        <div className="std-panel">
        
        {/* ================== AI MENTOR CHAT ================== */}
        {activeTool === 'mentor' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>AI Personal Mentor</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Ask concept reviews, request simpler examples, or search debugging tips.</p>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button disabled={mentorLoading} onClick={() => sendMentorMessage('Explain with a simple real-world analogy')} className="btn btn--secondary btn--sm" style={{ padding: '6px 12px', fontSize: '11px' }}>
                💡 Simple Analogy
              </button>
              <button disabled={mentorLoading} onClick={() => sendMentorMessage('Simplify this explanation for a beginner')} className="btn btn--secondary btn--sm" style={{ padding: '6px 12px', fontSize: '11px' }}>
                👶 Simplify Explanation
              </button>
              <button disabled={mentorLoading} onClick={() => sendMentorMessage('Provide an advanced coding demonstration')} className="btn btn--secondary btn--sm" style={{ padding: '6px 12px', fontSize: '11px' }}>
                🚀 Advanced Code Demo
              </button>
            </div>

            {/* CHAT BUBBLES */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', marginBottom: '20px' }}>
              {mentorHistory.length === 1 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="mentor-avatar" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', fontSize: '24px', marginBottom: '16px' }}>🤖</div>
                  <h3 className="text-primary" style={{ fontSize: '16px', fontWeight: 800 }}>Start a chat with Architect AI</h3>
                  <p className="text-secondary" style={{ fontSize: '12px', maxWidth: '360px', margin: '4px auto 24px', lineHeight: 1.4 }}>
                    I can explain algorithms, review syntax, provide coding analogies, or help guide your development career.
                  </p>
                  
                  <div style={{ width: '100%', maxWidth: '480px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'left', letterSpacing: '0.5px' }}>Suggested Prompts</div>
                    <div className="suggested-prompts-grid">
                      <button disabled={mentorLoading} onClick={() => { setMentorInput('Explain OOP inheritance using a library analogy.'); }} className="suggested-prompt-btn">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>💡 Analogy Prompt</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>OOP inheritance library analogy</span>
                      </button>
                      <button disabled={mentorLoading} onClick={() => { setMentorInput('Give me a quick checklist for responsive web design.'); }} className="suggested-prompt-btn">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>📱 Web Design Checklist</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>Responsive web UI checklist</span>
                      </button>
                      <button disabled={mentorLoading} onClick={() => { setMentorInput('Explain React Context vs Redux like I am five.'); }} className="suggested-prompt-btn">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>👶 Explain like I\'m 5</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>React Context vs Redux</span>
                      </button>
                      <button disabled={mentorLoading} onClick={() => { setMentorInput('Show me a quick SQL schema for an e-commerce order table.'); }} className="suggested-prompt-btn">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>🗄️ SQL Schema Demo</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>E-commerce order table SQL</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                mentorHistory.map((m, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <div className={`chat-bubble-avatar chat-bubble-avatar--${m.sender === 'user' ? 'user' : 'ai'}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                      {m.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div style={{ 
                      background: m.sender === 'user' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px 16px',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      border: m.sender === 'user' ? 'none' : '1px solid var(--border)'
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
              {mentorLoading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '12px' }}>
                  <div className="chat-bubble-avatar chat-bubble-avatar--ai" style={{ fontSize: '11px', fontWeight: 700 }}>AI</div>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* INPUT INPUT BOX */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ask your mentor something..." 
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMentorMessage()}
                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}
              />
              <button onClick={() => sendMentorMessage()} className="btn btn--primary" style={{ padding: '12px 20px', borderRadius: 'var(--radius-lg)' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================== QUIZ GENERATOR ================== */}
        {activeTool === 'quiz' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Adaptive Quiz Generator</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Generate smart technical questions on demand to review your weak topics.</p>
            </div>

            {quizQuestions.length === 0 ? (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quiz Scope / Topic</label>
                  <input 
                    type="text" 
                    value={quizScope} 
                    onChange={(e) => setQuizScope(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Difficulty Level</label>
                  <select 
                    value={quizDifficulty} 
                    onChange={(e) => setQuizDifficulty(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>
                <button onClick={startQuiz} disabled={quizLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                  {quizLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <Play size={16} />}
                  Generate Adaptive Quiz
                </button>
              </div>
            ) : quizFinished ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Trophy size={48} className="rarity-legendary" style={{ margin: '0 auto 16px' }} />
                <h3 className="text-primary" style={{ fontSize: '20px', fontWeight: 800 }}>Quiz Completed!</h3>
                <p className="text-secondary" style={{ marginTop: '6px' }}>You scored {quizScore} out of {quizQuestions.length} correct answers.</p>
                <button onClick={() => setQuizQuestions([])} className="btn btn-primary" style={{ marginTop: '24px' }}>
                  Generate Another
                </button>
              </div>
            ) : (
              <div>
                {/* QUESTION DISPLAY */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <span>Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
                  <span>Score: {quizScore}</span>
                </div>

                <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {quizQuestions[currentQuizIdx].question}
                  </div>

                  {/* MCQ OPTIONS */}
                  {quizQuestions[currentQuizIdx].type === 'multiple-choice' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {quizQuestions[currentQuizIdx].options?.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => !quizSubmitted && setSelectedAnswer(opt)}
                          className={`btn ${selectedAnswer === opt ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '13px', padding: '12px 16px' }}
                          disabled={quizSubmitted}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="text" 
                        placeholder="Type your answer..." 
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        disabled={quizSubmitted}
                        style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}
                      />
                    </div>
                  )}
                </div>

                {/* FEEDBACK EXPLANATION */}
                {quizSubmitted && (
                  <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-blue)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                      <Eye size={16} /> Explanation:
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {quizQuestions[currentQuizIdx].explanation}
                    </p>
                  </div>
                )}

                {/* ACTION BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {!quizSubmitted ? (
                    <button onClick={submitAnswer} disabled={!selectedAnswer} className="btn btn-primary">
                      Submit Answer
                    </button>
                  ) : (
                    <button onClick={nextQuestion} className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
                      Next Question <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== PRACTICE GENERATOR ================== */}
        {activeTool === 'practice' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>AI Practice Generator</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Generate unique technical scenarios and coding exercises aligned with your target languages.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', maxWidth: '600px' }}>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Language</label>
                <select 
                  value={practiceLang} 
                  onChange={(e) => setPracticeLang(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                >
                  <option value="Python">Python</option>
                  <option value="SQL">SQL</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="HTML/CSS">HTML/CSS</option>
                </select>
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Topic Scope</label>
                <input 
                  type="text" 
                  value={practiceTopic} 
                  onChange={(e) => setPracticeTopic(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button onClick={generatePracticeTask} disabled={practiceLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {practiceLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <RefreshCw size={16} />}
              Generate Practice Scenario
            </button>

            {practiceChallenge && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="text-primary" style={{ fontSize: '15px', fontWeight: 700 }}>{practiceChallenge.title}</h3>
                  <span className="badge badge-accent" style={{ fontSize: '11px' }}>{practiceChallenge.language}</span>
                </div>
                <div style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Task Scenario</h4>
                  <p className="text-primary" style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>{practiceChallenge.description}</p>

                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Starter Code</h4>
                  <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-primary)', overflowX: 'auto', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                    <code>{practiceChallenge.starter_code}</code>
                  </pre>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => { navigator.clipboard.writeText(practiceChallenge.starter_code); alert('Starter code copied!'); }} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                      Copy Starter Template
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== STUDY FLASHCARDS ================== */}
        {activeTool === 'flashcards' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Spaced Repetition Flashcards</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Automatically generate revision decks to reinforce core coding definitions.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '500px' }}>
              <input 
                type="text" 
                value={flashcardTopic} 
                onChange={(e) => setFlashcardTopic(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
              />
              <button onClick={fetchFlashcards} disabled={flashcardLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                {flashcardLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <Play size={16} />}
                Generate Deck
              </button>
            </div>

            {flashcards.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                
                {/* FLASHCARD INTERACTIVE FLIP BOX */}
                <div 
                  onClick={() => setFlippedCard(!flippedCard)}
                  style={{
                    width: '100%',
                    maxWidth: '460px',
                    height: '240px',
                    perspective: '1000px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: flippedCard ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}>
                    {/* Front */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '24px',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <span className="text-secondary" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        Card {activeCardIdx + 1} of {flashcards.length} — {flashcards[activeCardIdx].category}
                      </span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {flashcards[activeCardIdx].question}
                      </div>
                      <span className="text-secondary" style={{ fontSize: '11px', marginTop: '24px' }}>Click to Flip Card</span>
                    </div>

                    {/* Back */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--accent-blue)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '24px',
                      boxShadow: 'var(--shadow-md)',
                      transform: 'rotateY(180deg)'
                    }}>
                      <span className="text-secondary" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Answer / Definition</span>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {flashcards[activeCardIdx].answer}
                      </div>
                      <span className="text-secondary" style={{ fontSize: '11px', marginTop: '24px' }}>Click to Flip back</span>
                    </div>
                  </div>
                </div>

                {/* SPACED REPETITION BUTTONS */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <button onClick={() => { setFlippedCard(false); if (activeCardIdx + 1 < flashcards.length) setActiveCardIdx(i => i + 1); }} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    🔴 Struggling
                  </button>
                  <button onClick={() => { setFlippedCard(false); if (activeCardIdx + 1 < flashcards.length) setActiveCardIdx(i => i + 1); }} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    🟡 Normal
                  </button>
                  <button onClick={() => { setFlippedCard(false); if (activeCardIdx + 1 < flashcards.length) setActiveCardIdx(i => i + 1); }} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    🟢 Confident
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== INTERVIEW SIMULATOR ================== */}
        {activeTool === 'interview' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>AI Interview Simulator</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Conduct custom interactive mock interviews. Finish to receive score feedback reports.</p>
            </div>

            {!interviewStarted && !interviewScorecard && (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Role</label>
                  <input 
                    type="text" 
                    value={interviewRole}
                    onChange={(e) => setInterviewRole(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Interview Type</label>
                  <select 
                    value={interviewMode} 
                    onChange={(e) => setInterviewMode(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                  >
                    <option value="technical">Technical Interview</option>
                    <option value="hr">HR Interview</option>
                    <option value="system">System Design</option>
                  </select>
                </div>
                <button onClick={startInterview} disabled={interviewLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                  {interviewLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <Play size={16} />}
                  Start Mock Interview
                </button>
              </div>
            )}

            {interviewStarted && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                
                {/* CHAT LOG SCREEN */}
                <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '360px', marginBottom: '20px' }}>
                  {interviewHistory.map((m, idx) => (
                    <div key={idx} style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: m.sender === 'user' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px 16px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      border: m.sender === 'user' ? 'none' : '1px solid var(--border)'
                    }}>
                      <strong>{m.sender === 'user' ? 'You' : 'Interviewer'}:</strong> {m.text}
                    </div>
                  ))}
                  {interviewLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', border: '1px solid var(--border)' }}>
                      <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Provide your answer to the interviewer..." 
                    value={interviewInput}
                    onChange={(e) => setInterviewInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendInterviewResponse()}
                    style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                  <button onClick={sendInterviewResponse} className="btn btn-primary" style={{ padding: '12px 20px' }}>
                    <Send size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={evaluateInterview} className="btn btn-secondary" style={{ border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>
                    Finish & Evaluate
                  </button>
                </div>
              </div>
            )}

            {interviewScorecard && (
              <div>
                <h3 className="text-primary" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Mock Interview Scorecard</h3>
                
                {/* SCORE BARS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  {[
                    { label: 'Communication Skills', score: interviewScorecard.communicationScore, color: 'var(--accent-blue)' },
                    { label: 'Technical Accuracy', score: interviewScorecard.technicalAccuracyScore, color: 'var(--accent-violet)' },
                    { label: 'Candidate Confidence', score: interviewScorecard.confidenceScore, color: '#f59e0b' },
                    { label: 'Problem Solving', score: interviewScorecard.problemSolvingScore, color: '#ef4444' }
                  ].map((s, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        <span>{s.label}</span>
                        <span>{s.score} / 100</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Detailed Feedback</h4>
                  <p className="text-secondary" style={{ fontSize: '12px', lineHeight: 1.5 }}>{interviewScorecard.overallFeedback}</p>
                </div>

                <button onClick={() => setInterviewScorecard(null)} className="btn btn-primary">
                  Start Another Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================== ROADMAP PLANNER ================== */}
        {activeTool === 'planner' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Adaptive Learning Planner</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Generate customized roadmap milestones matching your goals and hours.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Career Objective</label>
                <input 
                  type="text" 
                  value={roadmapGoal} 
                  onChange={(e) => setRoadmapGoal(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Skill Level</label>
                <select 
                  value={roadmapLevel} 
                  onChange={(e) => setRoadmapLevel(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Weekly Hours</label>
                <input 
                  type="number" 
                  value={roadmapHours} 
                  onChange={(e) => setRoadmapHours(parseInt(e.target.value, 10))}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button onClick={generateRoadmap} disabled={roadmapLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {roadmapLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <RefreshCw size={16} />}
              Generate Roadmap Timeline
            </button>

            {roadmapStages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16px', width: '2px', background: 'var(--border)' }} />
                
                {roadmapStages.map((stage, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, zIndex: 10 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 700 }}>{stage.title}</h4>
                        <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>({stage.duration})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {stage.topics.map((t, idx2) => (
                          <span key={idx2} className="badge badge-secondary" style={{ fontSize: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================== STUDY NOTES ASSISTANT ================== */}
        {activeTool === 'study' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>AI Study Material Generator</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Generate concept cheat sheets, mind maps, or guides instantly from your lessons.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', maxWidth: '600px' }}>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Topic Name</label>
                <input 
                  type="text" 
                  value={studyTopic} 
                  onChange={(e) => setStudyTopic(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Material Type</label>
                <select 
                  value={studyType} 
                  onChange={(e) => setStudyType(e.target.value as any)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                >
                  <option value="summary">Summary Notes</option>
                  <option value="cheatsheet">Cheat Sheet</option>
                  <option value="mindmap">Mind Map Diagram</option>
                </select>
              </div>
            </div>

            <button onClick={fetchStudyMaterial} disabled={studyLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {studyLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <RefreshCw size={16} />}
              Generate Guide Sheet
            </button>

            {studyMarkdown && (
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
                {studyMarkdown}
              </div>
            )}
          </div>
        )}

        {/* ================== CAREER COACH ================== */}
        {activeTool === 'career' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>AI Career Coach</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Audit your skills, uncover gaps, suggest resume items, and get portfolio recommendations.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxWidth: '600px' }}>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Career Role</label>
                <input 
                  type="text" 
                  value={coachGoal} 
                  onChange={(e) => setCoachGoal(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Current Key Skills</label>
                <textarea 
                  value={coachSkills} 
                  onChange={(e) => setCoachSkills(e.target.value)}
                  rows={2}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
            </div>

            <button onClick={fetchCareerAdvice} disabled={coachLoading} className="btn btn-primary" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {coachLoading ? <div className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <Compass size={16} />}
              Generate Career Gap Report
            </button>

            {coachAdvice && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* SKILL GAPS */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={16} style={{ color: '#ef4444' }} /> Skills Gaps Identified
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {coachAdvice.skillGaps.map((g, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{g}</li>)}
                    </ul>
                  </div>

                  {/* RESUME SUGGESTIONS */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: 'var(--accent-blue)' }} /> Resume Suggestions
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {coachAdvice.resumeTips.map((t, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{t}</li>)}
                    </ul>
                  </div>

                </div>

                {/* PROJECTS SUGGESTED */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={16} style={{ color: '#f59e0b' }} /> Suggested Portfolio Projects
                  </h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {coachAdvice.projects.map((p, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{p}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        </div>{/* /std-panel */}
      </div>{/* /std-layout */}
      </div>{/* /container */}
    </div>
  );
}
