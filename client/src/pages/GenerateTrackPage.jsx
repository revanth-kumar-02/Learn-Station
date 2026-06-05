import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageTransition from '../components/layout/PageTransition';

const SUGGESTED_SKILLS = [
  'Docker', 'Kubernetes', 'React Native', 'Flutter', 
  'Cyber Security', 'Machine Learning', 'Prompt Engineering', 
  'UI/UX Design', 'Blockchain', 'Cloud Computing'
];

const STAGES = [
  'Analyzing skill requirements...',
  'Structuring foundations & advanced modules...',
  'Curating comprehensive explanations & examples...',
  'Drafting interactive practices...',
  'Generating knowledge checks & quizzes...',
  'Designing capstone projects...',
  'Finalizing database schemas...'
];

export default function GenerateTrackPage() {
  const navigate = useNavigate();
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Skill Development');
  const [generating, setGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (generating) {
      interval = setInterval(() => {
        setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      setStageIndex(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skill.trim()) return;

    setGenerating(true);
    setError('');

    try {
      const { data } = await api.post('/ai/generate', {
        skill: skill.trim(),
        level,
        goal
      });
      // Redirect to the newly generated AI Learning Workspace!
      navigate(`/ai-workspace/${data.trackSlug}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Generation failed. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="generate-page">
        {/* Decorative blur blobs */}
        <div className="gradient-orb gradient-orb--1" style={{ '--orb-color': 'var(--accent-blue)', '--orb-size': '500px', top: '-10%', left: '-10%' }} />
        <div className="gradient-orb gradient-orb--2" style={{ '--orb-color': 'var(--accent-violet)', '--orb-size': '400px', bottom: '-10%', right: '-10%' }} />

        <div className="container container--narrow">
          <AnimatePresence mode="wait">
            {!generating ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="generate-card"
              >
                <div className="generate-card__header">
                  <span className="generate-card__badge">✦ Signature Feature</span>
                  <h1>AI Learning Blueprint</h1>
                  <p>Design a structured, customized learning journey for any technical skill instantly.</p>
                </div>

                <form onSubmit={handleSubmit} className="generate-form">
                  {error && <div className="generate-form__error">{error}</div>}

                  {/* Skill Input */}
                  <div className="generate-form__group">
                    <label htmlFor="skill">What skill do you want to learn?</label>
                    <input
                      type="text"
                      id="skill"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      placeholder="e.g. Docker, Kubernetes, React Native..."
                      autoComplete="off"
                      required
                    />
                  </div>

                  {/* Suggested Chips */}
                  <div className="generate-form__chips">
                    {SUGGESTED_SKILLS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`chip ${skill.toLowerCase() === s.toLowerCase() ? 'chip--active' : ''}`}
                        onClick={() => setSkill(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="generate-form__row">
                    {/* Experience Level */}
                    <div className="generate-form__group">
                      <label>Target Level</label>
                      <div className="select-buttons">
                        {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                          <button
                            key={l}
                            type="button"
                            className={`select-btn ${level === l ? 'select-btn--active' : ''}`}
                            onClick={() => setLevel(l)}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learning Goal */}
                    <div className="generate-form__group">
                      <label>Primary Goal</label>
                      <div className="select-buttons">
                        {['Skill Development', 'Job Preparation', 'Interview Prep', 'Academic'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            className={`select-btn ${goal === g ? 'select-btn--active' : ''}`}
                            onClick={() => setGoal(g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn--primary btn--xl generate-form__submit">
                    Generate Learning Blueprint ✦
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="generator-loader"
              >
                <div className="generator-loader__orb">
                  <div className="generator-loader__ring generator-loader__ring--1" />
                  <div className="generator-loader__ring generator-loader__ring--2" />
                  <div className="generator-loader__ring generator-loader__ring--3" />
                  <span className="generator-loader__icon">🧠</span>
                </div>
                <h2>Generating Learning System</h2>
                <div className="generator-loader__stages">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={stageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="generator-loader__stage"
                    >
                      {STAGES[stageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="generator-loader__progress-bar">
                  <div 
                    className="generator-loader__progress-fill" 
                    style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
