import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollReveal, useCountUp, useTypewriter } from '../hooks/useAnimations';
import PageTransition from '../components/layout/PageTransition';

/* ── Gradient Orb ─────────────────────────────── */
function GradientOrb({ color, size, top, left, delay = 0 }) {
  return (
    <div
      className="gradient-orb"
      style={{
        '--orb-color': color,
        '--orb-size': size,
        top,
        left,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/* ── Hero ─────────────────────────────────────── */
function LandingHero() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  const words = ['Learn to code.', 'Build real skills.', 'Track your growth.'];

  return (
    <section className="landing-hero">
      <GradientOrb color="var(--accent-blue)" size="600px" top="-200px" left="-100px" delay={0} />
      <GradientOrb color="var(--accent-violet)" size="500px" top="100px" left="60%" delay={3} />

      <div className="landing-hero__content">
        {showContent && (
          <>
            <motion.div
              className="landing-hero__badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="landing-hero__badge-icon">✦</span>
              The modern way to learn code
            </motion.div>

            <h1 className="landing-hero__headline">
              {[
                { prefix: 'Learn to ', highlight: 'code.' },
                { prefix: 'Build real ', highlight: 'skills.' },
                { prefix: 'Track your ', highlight: 'growth.' }
              ].map((line, i) => (
                <motion.span
                  key={i}
                  className="landing-hero__line"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line.prefix}
                  <span className="landing-hero__highlight">
                    {line.highlight}
                  </span>
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="landing-hero__subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              Master SQL, Python, Web Dev, AI and more through interactive lessons,
              hands-on challenges, and visible progress.
            </motion.p>

            <motion.div
              className="landing-hero__ctas"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Link to="/register" className="btn btn--primary btn--xl landing-hero__cta-primary">
                Get Started Free
              </Link>
              <a href="#features" className="btn btn--ghost btn--xl landing-hero__cta-secondary">
                See How It Works
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Floating Mockup */}
      <motion.div
        className="landing-hero__mockup"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mockup-window">
          <div className="mockup-window__bar">
            <span /><span /><span />
          </div>
          <div className="mockup-window__content">
            <div className="mockup-stepper">
              <div className="mockup-step mockup-step--done">Concept</div>
              <div className="mockup-step mockup-step--active">Example</div>
              <div className="mockup-step">Challenge</div>
            </div>
            <div className="mockup-code">
              <code>
                <span className="code-keyword">SELECT</span> name, email<br />
                <span className="code-keyword">FROM</span> users<br />
                <span className="code-keyword">WHERE</span> active = <span className="code-value">true</span><br />
                <span className="code-keyword">ORDER BY</span> name;
              </code>
            </div>
            <div className="mockup-progress">
              <div className="mockup-xp">+25 XP</div>
              <div className="mockup-bar"><div className="mockup-bar__fill" /></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}



/* ── Features ─────────────────────────────────── */
function LandingFeatures() {
  const { ref, revealed } = useScrollReveal();
  const [activeDemo, setActiveDemo] = useState(null);

  const features = [
    {
      title: 'Interactive Lessons',
      desc: 'Read concepts, study examples, then practice — all in one focused flow.',
      color: 'var(--accent-blue)',
      demo: 'lesson',
    },
    {
      title: 'Hands-on Challenges',
      desc: 'Test your knowledge with multiple-choice, fill-in-the-blank, and coding challenges.',
      color: 'var(--accent-green)',
      demo: 'challenge',
    },
    {
      title: 'Track Your Progress',
      desc: 'Earn XP, level up, maintain streaks, and unlock achievements as you learn.',
      color: 'var(--accent-amber)',
      demo: 'progress',
    },
  ];

  return (
    <section className="landing-features" id="features" ref={ref}>
      <div className="container">
        <motion.h2
          className="landing-section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Everything you need to learn effectively
        </motion.h2>

        <div className="landing-features__grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`landing-feature-card ${activeDemo === i ? 'landing-feature-card--active' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              onMouseEnter={() => setActiveDemo(i)}
              onMouseLeave={() => setActiveDemo(null)}
              style={{ '--feature-color': feature.color }}
            >
              <div className="landing-feature-card__icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                {i === 0 ? '📖' : i === 1 ? '🧩' : '📊'}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>

              {/* Mini Demos */}
              <div className="landing-feature-card__demo">
                {i === 0 && <LessonMiniDemo active={activeDemo === 0} />}
                {i === 1 && <ChallengeMiniDemo active={activeDemo === 1} />}
                {i === 2 && <ProgressMiniDemo active={activeDemo === 2} />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LessonMiniDemo({ active }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) { setStep(0); return; }
    const t = setTimeout(() => setStep(1), 800);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="mini-demo mini-demo--lesson">
      <div className={`mini-demo__step ${step === 0 ? 'mini-demo__step--active' : ''}`}>
        <span className="mini-demo__tag">Concept</span>
        <p>A <strong>variable</strong> stores data values...</p>
      </div>
      <div className={`mini-demo__step ${step === 1 ? 'mini-demo__step--active' : ''}`}>
        <span className="mini-demo__tag">Example</span>
        <code>name = <span className="code-value">"Alice"</span></code>
      </div>
    </div>
  );
}

function ChallengeMiniDemo({ active }) {
  const [selected, setSelected] = useState(null);
  const correct = 1;

  return (
    <div className="mini-demo mini-demo--challenge">
      <p className="mini-demo__question">What does HTML stand for?</p>
      {['High Tech ML', 'HyperText Markup Language'].map((opt, i) => (
        <button
          key={i}
          className={`mini-demo__option ${
            selected === i ? (i === correct ? 'mini-demo__option--correct' : 'mini-demo__option--wrong') : ''
          }`}
          onClick={() => active && setSelected(i)}
        >
          {opt}
          {selected === i && i === correct && <span className="mini-demo__check">✓</span>}
        </button>
      ))}
    </div>
  );
}

function ProgressMiniDemo({ active }) {
  return (
    <div className="mini-demo mini-demo--progress">
      <div className="mini-demo__xp-row">
        <span>XP</span>
        <span className="mini-demo__xp-value">{active ? '2,450' : '0'}</span>
      </div>
      <div className="mini-demo__bar">
        <div className="mini-demo__bar-fill" style={{ width: active ? '73%' : '0%' }} />
      </div>
      <div className="mini-demo__streak-row">
        <span className="mini-demo__fire">🔥</span>
        <span>{active ? '7 day streak' : '—'}</span>
      </div>
    </div>
  );
}

/* ── Tracks Carousel ──────────────────────────── */
function LandingTracks() {
  const { ref, revealed } = useScrollReveal();
  const tracks = [
    { name: 'SQL', color: 'var(--track-sql)', icon: '🗄️', desc: 'Database Querying' },
    { name: 'Python', color: 'var(--track-python)', icon: '🐍', desc: 'General Programming' },
    { name: 'Web Dev', color: 'var(--track-webdev)', icon: '🌐', desc: 'HTML, CSS & JS' },
    { name: 'AI', color: 'var(--track-ai)', icon: '🤖', desc: 'AI Fundamentals' },
    { name: 'Data Science', color: 'var(--track-datascience)', icon: '📈', desc: 'Data Analysis' },
    { name: 'Java', color: 'var(--track-java)', icon: '☕', desc: 'Enterprise Programming' },
  ];

  return (
    <section className="landing-tracks" id="tracks" ref={ref}>
      <div className="container">
        <motion.h2
          className="landing-section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
        >
          6 learning tracks to master
        </motion.h2>
        <div className="landing-tracks__scroll">
          {tracks.map((track, i) => (
            <motion.div
              key={i}
              className="landing-track-card"
              initial={{ opacity: 0, x: 40 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <div className="landing-track-card__accent" style={{ background: track.color }} />
              <div className="landing-track-card__icon">{track.icon}</div>
              <h4>{track.name}</h4>
              <p>{track.desc}</p>
              <span className="landing-track-card__meta">3 modules · 18 lessons</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────── */
function LandingHowItWorks() {
  const { ref, revealed } = useScrollReveal();
  const steps = [
    { num: '01', title: 'Pick a Track', desc: 'Choose from SQL, Python, Web Dev, AI, Data Science, or Java.', icon: '🎯' },
    { num: '02', title: 'Learn Concepts', desc: 'Read clear, focused explanations with real code examples.', icon: '📖' },
    { num: '03', title: 'Practice & Challenge', desc: 'Test your knowledge with interactive exercises.', icon: '💪' },
    { num: '04', title: 'Earn XP & Level Up', desc: 'Track your progress and build your skills portfolio.', icon: '🚀' },
  ];

  return (
    <section className="landing-how" id="how" ref={ref}>
      <div className="container">
        <motion.h2
          className="landing-section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
        >
          How it works
        </motion.h2>

        <div className="landing-how__timeline">
          <div className="landing-how__line" style={{ transform: revealed ? 'scaleY(1)' : 'scaleY(0)' }} />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className={`landing-how__step ${i % 2 === 0 ? 'landing-how__step--left' : 'landing-how__step--right'}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.2 }}
            >
              <div className="landing-how__step-icon">{step.icon}</div>
              <div className="landing-how__step-content">
                <span className="landing-how__step-num">{step.num}</span>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ──────────────────────────────── */
function LandingCTA() {
  const { ref, revealed } = useScrollReveal();

  return (
    <section className="landing-cta" ref={ref}>
      <GradientOrb color="var(--accent-blue)" size="400px" top="-100px" left="10%" delay={0} />
      <GradientOrb color="var(--accent-violet)" size="350px" top="50px" left="70%" delay={2} />

      <div className="container">
        <motion.div
          className="landing-cta__inner"
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2>Start learning today</h2>
          <p>Join thousands of learners building real skills, one lesson at a time.</p>
          <Link to="/register" className="btn btn--primary btn--xl landing-cta__btn">
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main Landing Page ────────────────────────── */
export default function LandingPage() {
  return (
    <PageTransition>
      <div className="landing-page">
        <LandingHero />
        <LandingFeatures />
        <LandingTracks />
        <LandingHowItWorks />
        <LandingCTA />

        <footer className="landing-footer">
          <div className="container">
            <p>© 2026 Learn Station. Built for learners.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
