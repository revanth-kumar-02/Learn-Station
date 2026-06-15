import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePathSelection } from '../../context/PathSelectionContext';
import { trackService } from '../../services/trackService';

const TRACK_ICONS = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

export default function LearningPathOverlay() {
  const { user } = useAuth();
  const { isOpen, closeOverlay } = usePathSelection();
  const navigate = useNavigate();
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Esc key & body scroll freeze
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOverlay]);

  // Load recently studied tracks when opened
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      trackService.getAll()
        .then((data) => {
          const allTracks = data.tracks || [];
          const studied = allTracks.filter(t => 
            t.progress && ((Array.isArray(t.progress.completedLessons) ? t.progress.completedLessons.length > 0 : false) || t.progress.progressPercent > 0 || t.progress.xpEarned > 0)
          );
          // Sort by last accessed if present, or percent
          studied.sort((a, b) => {
            const dateA = a.progress?.lastAccessedAt ? new Date(a.progress.lastAccessedAt) : new Date(0);
            const dateB = b.progress?.lastAccessedAt ? new Date(b.progress.lastAccessedAt) : new Date(0);
            const diff = dateA.getTime() - dateB.getTime();
            if (diff !== 0) return dateB.getTime() - dateA.getTime();
            return (b.progress?.progressPercent || 0) - (a.progress?.progressPercent || 0);
          });
          setRecentTracks(studied.slice(0, 3));
        })
        .catch((err) => console.error('Error loading tracks for overlay:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  const handleNavigate = (path) => {
    if (path === '/tracks') {
      console.log("🔍 [Overlay Debug] Explore Tracks clicked");
    } else if (path === '/generate') {
      console.log("🔍 [Overlay Debug] Generate With AI clicked");
    }
    console.log("🔍 [Overlay Debug] Overlay closing");
    closeOverlay();
    console.log(`🔍 [Overlay Debug] Navigating to ${path}`);
    navigate(path);
  };

  const handleRecentClick = (track) => {
    closeOverlay();
    if (track.isAiGenerated) {
      navigate(`/ai-workspace/${track.slug}`);
    } else if (track.progress?.currentLessonSlug) {
      navigate(`/lesson/${track.progress.currentLessonSlug}`);
    } else {
      navigate(`/track/${track.slug}`);
    }
  };

  // Framer Motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: 10, 
      transition: { duration: 0.2, ease: 'easeIn' } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="path-overlay-backdrop"
          variants={backdropVariants as any}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeOverlay}
        >
          <motion.div
            className="path-overlay-modal"
            variants={modalVariants as any}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="path-overlay-close" onClick={closeOverlay} aria-label="Close modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className="path-overlay-header">
              <h2 className="path-overlay-title">Choose Your Learning Journey</h2>
              <p className="path-overlay-subtitle">Select how you'd like to start learning today.</p>
            </div>

            {/* Core Options Grid */}
            <div className="path-overlay-grid">
              {/* Option 1: Structured Learning */}
              <div className="path-overlay-card card-structured" onClick={() => handleNavigate('/tracks')}>
                <div className="card-glowing-effect" style={{ '--glow-color': 'rgba(59, 130, 246, 0.12)' } as React.CSSProperties} />
                <div className="card-icon-container" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 20l-5-3V3l5 3 6-3 5 3v14l-5-3-6 3z" />
                    <path d="M9 6v14" />
                    <path d="M15 3v14" />
                  </svg>
                </div>
                <h3 className="card-title">Structured Learning Tracks</h3>
                <p className="card-description">
                  Follow expertly designed learning tracks with predefined modules, lessons, quizzes, projects, and progression.
                </p>
                <div className="card-examples-title font-semibold">Included Tracks:</div>
                <div className="card-examples-tags">
                  <span className="example-tag">SQL</span>
                  <span className="example-tag">Python</span>
                  <span className="example-tag">Web Development</span>
                  <span className="example-tag">AI Fundamentals</span>
                  <span className="example-tag">Data Science</span>
                  <span className="example-tag">Java</span>
                </div>
                <button type="button" className="card-action-btn btn-explore" onClick={(e) => { e.stopPropagation(); handleNavigate('/tracks'); }}>
                  Explore Tracks
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              {/* Option 2: AI Generated roadmap */}
              <div className="path-overlay-card card-ai" onClick={() => handleNavigate('/generate')}>
                <div className="card-glowing-effect" style={{ '--glow-color': 'rgba(168, 85, 247, 0.12)' } as React.CSSProperties} />
                <div className="card-icon-container" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.93 10.93L12 4l2.07 6.93L21 13l-6.93 2.07L12 20l-2.07-6.93L3 13l6.93-2.07z" />
                    <path d="M19 4l.8 2.2L22 7l-2.2.8L19 10l-.8-2.2L16 7l2.2-.8L19 4z" />
                  </svg>
                </div>
                <h3 className="card-title">AI Generated Learning Path</h3>
                <p className="card-description">
                  Generate a personalized learning roadmap for any technology, framework, tool, or skill.
                </p>
                <div className="card-examples-title font-semibold">Generate topics like:</div>
                <div className="card-examples-tags">
                  <span className="example-tag">Flutter</span>
                  <span className="example-tag">Docker</span>
                  <span className="example-tag">Kubernetes</span>
                  <span className="example-tag">Prompt Engineering</span>
                  <span className="example-tag">Cyber Security</span>
                  <span className="example-tag">React Native</span>
                </div>
                <button type="button" className="card-action-btn btn-ai" onClick={(e) => { e.stopPropagation(); handleNavigate('/generate'); }}>
                  Generate With AI
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Recommended: Recently studied */}
            {!loading && recentTracks.length > 0 && (
              <div className="path-overlay-recommended">
                <h4 className="recommended-title">Continue Learning</h4>
                <div className="recommended-list">
                  {recentTracks.map((track) => (
                    <div
                      key={track._id}
                      className="recommended-item"
                      onClick={() => handleRecentClick(track)}
                    >
                      <div className="recommended-item__left">
                        <span className="recommended-item__icon">
                          {TRACK_ICONS[track.slug] || track.icon || '📚'}
                        </span>
                        <div>
                          <span className="recommended-item__name">
                            Continue {track.name} {track.isAiGenerated ? 'Blueprint' : 'Journey'}
                          </span>
                          <span className="recommended-item__progress">
                            {track.progress?.progressPercent || 0}% Complete
                          </span>
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="recommended-item__arrow">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
