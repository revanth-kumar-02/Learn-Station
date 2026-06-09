import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageTransition from '../components/layout/PageTransition';

const SUGGESTED_SKILLS = [
  { name: 'Docker', icon: '🐳' },
  { name: 'Kubernetes', icon: '☸️' },
  { name: 'React Native', icon: '📱' },
  { name: 'Flutter', icon: '⚡' },
  { name: 'Cyber Security', icon: '🔒' },
  { name: 'Machine Learning', icon: '🤖' },
  { name: 'Prompt Engineering', icon: '🧠' },
  { name: 'UI/UX Design', icon: '🎨' },
  { name: 'Blockchain', icon: '⛓️' },
  { name: 'Cloud Computing', icon: '☁️' }
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

const SegmentedControl = ({ options, value, onChange, uniqueId }) => {
  return (
    <div className="segmented-control">
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <button
            key={opt}
            type="button"
            className={`segmented-control__item ${isActive ? 'segmented-control__item--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {isActive && (
              <motion.div
                layoutId={`active_pill_${uniqueId}`}
                className="segmented-control__active-pill"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            <span className="segmented-control__text">{opt}</span>
          </button>
        );
      })}
    </div>
  );
};

const getMockModules = (skillName, levelName, goalName) => {
  const cleanSkill = skillName.trim();
  if (!cleanSkill) return [];
  
  const normSkill = cleanSkill.toLowerCase();
  const normLevel = levelName.toLowerCase();
  const normGoal = goalName.toLowerCase();

  let suffix;
  if (normGoal.includes('job')) suffix = ' [Job Prep: Portfolio Focus]';
  else if (normGoal.includes('interview')) suffix = ' [Interview: Assessment Prep]';
  else if (normGoal.includes('academic')) suffix = ' [Academic: Theory Focus]';
  else suffix = ' [Skill Development]';



  // Specific mappings for Flutter
  if (normSkill.includes('flutter')) {
    if (normLevel === 'beginner') {
      if (normGoal.includes('job')) {
        return [
          'Flutter Setup & Basic Layout Widgets',
          'Building Your First Portfolio Profile App',
          'Deploying to Local Emulator'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Flutter Framework Core Concepts & Quiz Topics',
          'Stateless vs Stateful Widgets Lifecycle',
          'Flutter Key Technical Interview Questions'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'Declarative UI Paradigms & Architecture Theory',
          'Introduction to Dart Compilation & Syntax Rules',
          'Academic Framework Comparative Analysis'
        ];
      } else {
        return [
          'Flutter Foundations & Dart Basics',
          'Stateless & Stateful Widgets Layouts',
          'Interactive Inputs & Basic Navigation'
        ];
      }
    } else if (normLevel === 'intermediate') {
      if (normGoal.includes('job')) {
        return [
          'REST API Integration & Local Storage (Hive)',
          'State Management with Provider/Riverpod',
          'Publishing a Practical Multi-Screen Portfolio App'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Managing State: Bloc vs Riverpod Tradeoffs',
          'Advanced Widget Tree Lifecycle & Navigation Mock Qs',
          'Coding Challenge: Custom Weather API Integration'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'Dart Streams & Futures Async Programming Theory',
          'Local Database Performance & Storage Paradigms',
          'Declarative State Propagation Mathematics'
        ];
      } else {
        return [
          'Practical Workflows & Custom Painters',
          'REST API Integration & Local Storage (Hive)',
          'State Management Basics (Provider/Riverpod)'
        ];
      }
    } else {
      if (normGoal.includes('job')) {
        return [
          'Clean Architecture & BloC Production Workflows',
          'Memory Leak Profiling & Native Swift/Kotlin Bridges',
          'Automated App Store CI/CD Delivery Pipelines'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Enterprise System Design & High Concurrency Mock Tests',
          'Senior Flutter Architect Mock Assessments',
          'Performance Bottlenecks & Optimization Challenge'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'JIT vs AOT Compilation & Flutter Engine Research',
          'Rendering Engines: Skia vs Impeller Architecture Theory',
          'Declarative UI Mathematical Optimization Thesis'
        ];
      } else {
        return [
          'Clean Architecture & BloC/Redux Masterclass',
          'Performance Profiling & Memory Leak Optimization',
          'CI/CD Automated Testing & Production Builds'
        ];
      }
    }
  }

  // Fallback for other skills (like Docker, Kubernetes, etc.)
  if (normSkill.includes('docker')) {
    if (normLevel === 'beginner') {
      if (normGoal.includes('job')) {
        return [
          'Introduction to Containers & Job Workflows',
          'Workspace Setup & Local Container Builds',
          'Creating Basic Dockerfiles for Web Apps'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Containers vs VMs Core Interview Qs',
          'Docker Architecture & Key CLI Quiz Checks',
          'Common Beginner Assessment Tasks'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'Theoretical History of OS-level Virtualization',
          'Kernel Namespaces & Control Groups Theory',
          'Academic Container Design Paradigms'
        ];
      } else {
        return [
          'Introduction to Containers & Core Terminology',
          'Workspace Setup & Basic CLI Commands',
          'Basic Dockerfiles & Image Builds'
        ];
      }
    } else if (normLevel === 'intermediate') {
      if (normGoal.includes('job')) {
        return [
          'Multi-stage Builds for Slim Production Images',
          'Docker Compose for Multi-Service Applications',
          'Local Storage Volume Mounts & Networking'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Dockerfile Optimization Rules & Layer Caching Qs',
          'Orchestrating Multi-Container Apps Quiz Checks',
          'Coding Task: Optimizing a Heavy Dev Image'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'Layered File Systems: OverlayFS & AUFS Theory',
          'Network Topology and Virtual Bridge Routing',
          'Container Resource Allocation & Limits Research'
        ];
      } else {
        return [
          'Multi-stage Builds & Cache Optimization',
          'Docker Compose for Multi-Container Apps',
          'Volume Mapping & Local Network Setup'
        ];
      }
    } else {
      if (normGoal.includes('job')) {
        return [
          'Container Security Best Practices & Hardening',
          'Production Deployment Orchestrations (Swarm/AWS)',
          'Automated CI/CD Containerization Pipelines'
        ];
      } else if (normGoal.includes('interview')) {
        return [
          'Senior DevSecOps & Enterprise Architecture Qs',
          'Profiling Heap/CPU inside Docker Containers',
          'High Availability & Auto-scaling Mock Tests'
        ];
      } else if (normGoal.includes('academic')) {
        return [
          'Advanced Virtualization Engineering & Hypervisors',
          'Secure Container Runtimes (Kata Containers, gVisor)',
          'Docker Architecture Performance Benchmark Study'
        ];
      } else {
        return [
          'Security Best Practices & Container Hardening',
          'Production Deployment Patterns & Orchestrations',
          'CI/CD Pipeline Integrations & Auto-scaling'
        ];
      }
    }
  }

  // Default fallback for any other skill
  if (normLevel === 'beginner') {
    if (normGoal.includes('job')) {
      return [
        `${cleanSkill} Foundations & Terminology${suffix}`,
        `${cleanSkill} Workspace Setup & Basic Commands`,
        `Mini-Project: Interactive Portfolio Entry`
      ];
    } else if (normGoal.includes('interview')) {
      return [
        `${cleanSkill} Core Definitions & Quiz Topics${suffix}`,
        `Whiteboard Concepts & Fundamental Qs`,
        `Guided Assessments: Core Basics Check`
      ];
    } else if (normGoal.includes('academic')) {
      return [
        `Theoretical Overview of ${cleanSkill}${suffix}`,
        `Academic Definitions & Syntax Paradigms`,
        `Term Exercises & Theoretical Exam Prep`
      ];
    } else {
      return [
        `${cleanSkill} Foundations & Terminology${suffix}`,
        `${cleanSkill} Setup & Basic Commands`,
        `${cleanSkill} Core Concepts & Guided Practice`
      ];
    }
  } else if (normLevel === 'intermediate') {
    if (normGoal.includes('job')) {
      return [
        `${cleanSkill} Practical Workflows & Industry Tools${suffix}`,
        `Implementing API Integrations & State Stores`,
        `Portfolio Project: Multi-feature Application`
      ];
    } else if (normGoal.includes('interview')) {
      return [
        `${cleanSkill} Architecture Patterns & Interview Qs${suffix}`,
        `Tradeoff Analyses & Common Assessment Tasks`,
        `Mock Challenge: API Integration Coding Task`
      ];
    } else if (normGoal.includes('academic')) {
      return [
        `${cleanSkill} Advanced Paradigms & Algorithm Theory${suffix}`,
        `Comparative Study & Optimization Proofs`,
        `Intermediate Term Paper & Exam Preparation`
      ];
    } else {
      return [
        `${cleanSkill} Practical Workflows & Tools${suffix}`,
        `${cleanSkill} Best Practices & Real Applications`,
        `${cleanSkill} Portfolio Projects & Challenges`
      ];
    }
  } else {
    if (normGoal.includes('job')) {
      return [
        `${cleanSkill} Enterprise Architecture & Scalability${suffix}`,
        `Production Operations & Telemetry Logs`,
        `Capstone Project: Deployment & Auto-scaling Setup`
      ];
    } else if (normGoal.includes('interview')) {
      return [
        `${cleanSkill} Senior System Design Interview Qs${suffix}`,
        `High Concurrency, Cache Optimization Mock Tests`,
        `Timed Advanced Coding & Refactoring Challenges`
      ];
    } else if (normGoal.includes('academic')) {
      return [
        `Deep Engineering Research in ${cleanSkill}${suffix}`,
        `High-performance Compilers & Core Engine Analysis`,
        `Advanced Academic Examination & Research Defense`
      ];
    } else {
      return [
        `${cleanSkill} Architecture & Scalability${suffix}`,
        `${cleanSkill} Optimization & System Design`,
        `${cleanSkill} Production Operations & Mastery`
      ];
    }
  }
};

export default function GenerateTrackPage() {
  const navigate = useNavigate();
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Skill Development');
  const [generating, setGenerating] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [generating]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!skill.trim()) return;

    setGenerating(true);
    setStageIndex(0);
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

  const previewModules = getMockModules(skill || 'Technology Skill', level, goal);

  return (
    <PageTransition>
      <div className="generate-page">
        {/* Decorative blur blobs */}
        <div className="gradient-orb gradient-orb--1" style={{ '--orb-color': 'var(--accent-blue)', '--orb-size': '500px', top: '-10%', left: '-10%' }} />
        <div className="gradient-orb gradient-orb--2" style={{ '--orb-color': 'var(--accent-violet)', '--orb-size': '400px', bottom: '-10%', right: '-10%' }} />

        <div className="container">
          <AnimatePresence mode="wait">
            {!generating ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="generate-container"
              >
                {/* Left Panel: Form Settings */}
                <div className="generate-card--form">
                  <div className="generate-header">
                    <span className="generate-card__badge">✦ Signature Feature</span>
                    <h1>AI Learning Blueprint</h1>
                    <p>Design a structured, customized learning journey for any technical skill instantly.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="generate-form">
                    {error && <div className="generate-form__error" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: 'var(--text-xs)' }}>{error}</div>}

                    {/* Skill Input */}
                    <div className="generate-form__group">
                      <label htmlFor="skill">What skill do you want to learn?</label>
                      <div className="generate-form__input-wrapper">
                        <span className="generate-form__input-icon">✨</span>
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
                    </div>

                    {/* Suggested Chips */}
                    <div className="generate-form__chips">
                      {SUGGESTED_SKILLS.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          className={`chip ${skill.toLowerCase() === s.name.toLowerCase() ? 'chip--active' : ''}`}
                          onClick={() => setSkill(s.name)}
                        >
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Target level segmented control */}
                    <div className="generate-form__group">
                      <label>Target Level</label>
                      <SegmentedControl
                        options={['Beginner', 'Intermediate', 'Advanced']}
                        value={level}
                        onChange={setLevel}
                        uniqueId="level"
                      />
                    </div>

                    {/* Primary Goal segmented control */}
                    <div className="generate-form__group" style={{ marginBottom: 'var(--space-8)' }}>
                      <label>Primary Goal</label>
                      <SegmentedControl
                        options={['Skill Development', 'Job Preparation', 'Interview Prep', 'Academic']}
                        value={goal}
                        onChange={setGoal}
                        uniqueId="goal"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn--premium-cta btn--xl"
                      disabled={!skill.trim()}
                    >
                      Generate Learning Blueprint ✦
                    </button>
                  </form>
                </div>

                {/* Right Panel: Live Blueprint Preview & Perks */}
                <div className="right-panel">
                  {/* Dynamic Blueprint Preview Card */}
                  <div className="preview-card">
                    <span className="preview-card__badge">Live Preview</span>
                    <h3 className="preview-card__title">
                      {skill.trim() ? `${skill.trim()}: Zero to Hero` : 'Technology Skill Blueprint'}
                    </h3>
                    <p className="preview-card__desc">
                      AI-generated curriculum targeting {level.toLowerCase()} level expertise.
                    </p>

                    <div className="preview-card__stats">
                      <div>
                        <span className="preview-card__stat-val">6</span>
                        <span className="preview-card__stat-lbl">Modules</span>
                      </div>
                      <div>
                        <span className="preview-card__stat-val">24</span>
                        <span className="preview-card__stat-lbl">Lessons</span>
                      </div>
                      <div>
                        <span className="preview-card__stat-val">48</span>
                        <span className="preview-card__stat-lbl">Quizzes</span>
                      </div>
                    </div>

                    <div className="preview-card__heading">Curated Curriculum Preview</div>
                    <div className="preview-card__modules-list">
                      {previewModules.map((modText, index) => (
                        <div key={index} className="preview-card__module-item">
                          <div className="preview-card__module-circle">{index + 1}</div>
                          <span className="preview-card__module-text">{modText}</span>
                        </div>
                      ))}
                      <div className="preview-card__module-item" style={{ borderStyle: 'dashed', background: 'transparent', opacity: 0.5 }}>
                        <div className="preview-card__module-circle" style={{ background: 'transparent', borderStyle: 'dashed' }}>+</div>
                        <span className="preview-card__module-text">Generating 3 additional advanced modules...</span>
                      </div>
                    </div>
                  </div>

                  {/* "What you'll get" Perks section */}
                  <div className="what-get">
                    <div className="what-get__title">Included in your Blueprint</div>
                    <div className="what-get__grid">
                      <div className="what-get__item">
                        <span className="what-get__icon">📦</span>
                        <div>
                          <div className="what-get__name">Structured Modules</div>
                          <div className="what-get__desc">6-10 units that group core paradigms systematically.</div>
                        </div>
                      </div>
                      <div className="what-get__item">
                        <span className="what-get__icon">📝</span>
                        <div>
                          <div className="what-get__name">Conceptual Lessons</div>
                          <div className="what-get__desc">Concept explanations rich in real-world industry context.</div>
                        </div>
                      </div>
                      <div className="what-get__item">
                        <span className="what-get__icon">🧪</span>
                        <div>
                          <div className="what-get__name">Sandboxed Practice</div>
                          <div className="what-get__desc">Interactive coding editors to validate code immediately.</div>
                        </div>
                      </div>
                      <div className="what-get__item">
                        <span className="what-get__icon">🏆</span>
                        <div>
                          <div className="what-get__name">Quiz Challenges</div>
                          <div className="what-get__desc">Targeted MCQ and fill-in-the-blank checks with feedback.</div>
                        </div>
                      </div>
                      <div className="what-get__item">
                        <span className="what-get__icon">🛠️</span>
                        <div>
                          <div className="what-get__name">Module Projects</div>
                          <div className="what-get__desc">Practical mini-projects to apply skills in isolated contexts.</div>
                        </div>
                      </div>
                      <div className="what-get__item">
                        <span className="what-get__icon">🎓</span>
                        <div>
                          <div className="what-get__name">Capstone Milestone</div>
                          <div className="what-get__desc">Comprehensive final task to demonstrate total track mastery.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
