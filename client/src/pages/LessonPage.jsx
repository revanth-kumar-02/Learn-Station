import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lessonService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import InteractivePlayground from '../components/common/InteractivePlayground';

const STEPS = ['Concept', 'Example', 'Practice', 'Challenge', 'Complete'];

export default function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceDone, setPracticeDone] = useState(false);
  const [allCorrect, setAllCorrect] = useState(true);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonService.getBySlug(slug);
        setLesson(data.lesson);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setUserAnswer('');

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePracticeSubmit = () => {
    if (practiceAnswer.trim().toLowerCase() === lesson.practice?.answer?.toLowerCase()) {
      setPracticeDone(true);
    }
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
        // Complete lesson
        completeLesson();
      }
    }, 2000);
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
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      setCurrentStep(4);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!lesson) return <div className="container" style={{ paddingTop: '120px' }}><h2>Lesson not found</h2></div>;

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <PageTransition>
      <div className="lesson-page">
        <div className="container container--narrow">
          {/* Stepper */}
          <div className="lesson-stepper">
            {STEPS.slice(0, -1).map((step, i) => (
              <div key={i} className={`lesson-stepper__step ${i <= currentStep ? 'lesson-stepper__step--active' : ''} ${i < currentStep ? 'lesson-stepper__step--done' : ''}`}>
                <div className="lesson-stepper__dot" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          <h1 className="lesson-title">{lesson.title}</h1>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={1}>
            {currentStep === 0 && (
              <motion.div key="concept" className="lesson-step" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="lesson-concept">
                  <h2>{lesson.concept?.title}</h2>
                  {lesson.concept?.content?.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {lesson.concept?.highlights?.length > 0 && (
                    <div className="lesson-concept__highlights">
                      <span className="lesson-concept__hl-label">Key terms:</span>
                      {lesson.concept.highlights.map((h, i) => (
                        <span key={i} className="lesson-concept__hl">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleNext} variant="primary" size="lg" className="lesson-next">
                  See Example →
                </Button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="example" className="lesson-step" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="lesson-example">
                  <pre className="lesson-example__code">
                    <code>{lesson.example?.code}</code>
                  </pre>
                  {lesson.example?.explanation && (
                    <p className="lesson-example__explanation">{lesson.example.explanation}</p>
                  )}
                </div>
                <Button onClick={handleNext} variant="primary" size="lg" className="lesson-next">
                  Try Practice →
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="practice" className="lesson-step" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <div className="lesson-practice">
                  <h3>Practice</h3>
                  <p>{lesson.practice?.instruction}</p>
                  
                  <InteractivePlayground
                    language={lesson.example?.language || 'javascript'}
                    template={lesson.practice?.template}
                    instruction={lesson.practice?.instruction}
                    answer={lesson.practice?.answer}
                    onCorrect={() => setPracticeDone(true)}
                  />
                </div>
                {practiceDone && (
                  <Button onClick={handleNext} variant="primary" size="lg" className="lesson-next">
                    Take Challenge →
                  </Button>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="challenge" className="lesson-step" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                {lesson.challenges?.[challengeIndex] && (
                  <div className="lesson-challenge">
                    <div className="lesson-challenge__counter">
                      Challenge {challengeIndex + 1} of {lesson.challenges.length}
                    </div>
                    <h3>{lesson.challenges[challengeIndex].question}</h3>

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
                          >
                            <span className="challenge-option__letter">{String.fromCharCode(65 + i)}</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {lesson.challenges[challengeIndex].type === 'fill-blank' && (
                      <div className="lesson-challenge__fill">
                        <div className="lesson-challenge__template">
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
                        initial={{ opacity: 0, scale: 0.9 }}
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
                      >
                        Submit Answer
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="complete" className="lesson-step lesson-reward" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
                <div className="lesson-reward__icon">🎉</div>
                <h2>Lesson Complete!</h2>
                <div className="lesson-reward__xp">
                  <span className="lesson-reward__xp-label">XP Earned</span>
                  <span className="lesson-reward__xp-value">+{reward?.xpEarned || lesson.xpReward}</span>
                </div>
                {reward?.newAchievements?.length > 0 && (
                  <div className="lesson-reward__achievements">
                    {reward.newAchievements.map((a) => (
                      <div key={a.id} className="lesson-reward__achievement">
                        <span className="lesson-reward__achievement-icon">{a.icon}</span>
                        <div>
                          <strong>{a.name}</strong>
                          <p>{a.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="lesson-reward__actions">
                  <Button onClick={() => navigate(-1)} variant="secondary" size="lg">
                    Back to Track
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
