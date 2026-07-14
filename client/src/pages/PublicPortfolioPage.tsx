import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';

const ACHIEVEMENT_DEFS = {
  'first-lesson': { icon: '📚', name: 'First Lesson' },
  'streak-3': { icon: '🔥', name: '3 Day Streak' },
  'xp-100': { icon: '⚡', name: 'First 100 XP' },
  'track-sql': { icon: '🗄️', name: 'SQL Explorer' },
  'track-python': { icon: '🐍', name: 'Python Explorer' },
  'track-webdev': { icon: '🌐', name: 'Web Developer' },
  'track-ai': { icon: '🤖', name: 'AI Explorer' },
  'track-datascience': { icon: '📊', name: 'Data Scientist' },
  'track-java': { icon: '☕', name: 'Java Apprentice' },
  'track-completed': { icon: '🏆', name: 'Track Completed' },
  'ai-pathfinder': { icon: '🚀', name: 'AI Pathfinder' },
  'perfect-quiz': { icon: '🎯', name: 'Perfect Quiz' },
};

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await userService.getPublicProfile(username);
        setProfile(result);
      } catch (err: any) {
        console.error('Error loading public profile:', err);
        setError(
          err.response?.status === 403 
            ? 'This profile is private.' 
            : err.response?.status === 404 
              ? 'User not found.' 
              : 'Failed to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <Loader fullPage />;

  if (error) {
    const isPrivate = error === 'This profile is private.';
    return (
      <PageTransition>
        <div className="portfolio-error">
          <div className="container">
            <div className="portfolio-error__card">
              <span>{isPrivate ? '🔒' : '👤'}</span>
              <h2>{error}</h2>
              <p>
                {isPrivate 
                  ? `@${username} has set their profile to private.` 
                  : `The public profile for @${username} could not be found.`}
              </p>
              <Link to="/" className="btn btn--primary btn--md">Go Home</Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const { profile: p, completedTracks, certificates, projects } = profile;
  const earnedAchievements = (p.achievements || []).map((id) => ACHIEVEMENT_DEFS[id]).filter(Boolean);

  const memberSince = new Date(p.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <PageTransition>
      <div className="portfolio-page">
        <div className="container">
          {/* Profile Hero */}
          <motion.div
            className="portfolio-hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="portfolio-avatar">
              {p.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="portfolio-hero__info">
              <h1 className="portfolio-hero__name">{p.name}</h1>
              <p className="portfolio-hero__username">@{p.username}</p>
              {p.bio && <p className="portfolio-hero__bio">{p.bio}</p>}
              <p className="portfolio-hero__member">Member since {memberSince}</p>
            </div>
            <div className="portfolio-hero__stats">
              <div className="portfolio-stat">
                <span className="portfolio-stat__value">{(p.xp || 0).toLocaleString()}</span>
                <span className="portfolio-stat__label">Total XP</span>
              </div>
              <div className="portfolio-stat">
                <span className="portfolio-stat__value">Lv.{p.level || 1}</span>
                <span className="portfolio-stat__label">Level</span>
              </div>
              <div className="portfolio-stat">
                <span className="portfolio-stat__value">{p.streak || 0}🔥</span>
                <span className="portfolio-stat__label">Day Streak</span>
              </div>
              <div className="portfolio-stat">
                <span className="portfolio-stat__value">{completedTracks?.length || 0}</span>
                <span className="portfolio-stat__label">Tracks Done</span>
              </div>
            </div>
          </motion.div>

          <div className="portfolio-grid">
            {/* Achievements */}
            <motion.section
              className="portfolio-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="portfolio-section__title">🏅 Achievements</h2>
              {earnedAchievements.length > 0 ? (
                <div className="portfolio-achievements">
                  {earnedAchievements.map((ach, i) => (
                    <motion.div
                      key={i}
                      className="portfolio-achievement-badge"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      title={ach.name}
                    >
                      <span>{ach.icon}</span>
                      <span>{ach.name}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="portfolio-section__empty">No achievements earned yet.</p>
              )}
            </motion.section>

            {/* Completed Tracks */}
            <motion.section
              className="portfolio-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="portfolio-section__title">🎓 Completed Tracks</h2>
              {completedTracks?.length > 0 ? (
                <div className="portfolio-tracks">
                  {completedTracks.map((track, i) => (
                    <div key={track?.id || i} className="portfolio-track-badge">
                      <span>{track?.icon || '📚'}</span>
                      <span>{track?.name || 'Unknown Track'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="portfolio-section__empty">No tracks completed yet.</p>
              )}
            </motion.section>

            {/* Certificates */}
            {certificates?.length > 0 && (
              <motion.section
                className="portfolio-section portfolio-section--wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2 className="portfolio-section__title">📜 Certificates</h2>
                <div className="portfolio-certs">
                  {certificates.map((cert, i) => (
                    <Link
                      key={cert.id || i}
                      to={`/certificate/${cert.certificate_id}`}
                      className="portfolio-cert-card"
                    >
                      <div className="portfolio-cert-card__icon">🎖️</div>
                      <div className="portfolio-cert-card__info">
                        <span className="portfolio-cert-card__track">{cert.track?.name || 'Unknown'}</span>
                        <span className="portfolio-cert-card__id">{cert.certificate_id}</span>
                      </div>
                      <span className="portfolio-cert-card__arrow">→</span>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Projects */}
            {projects?.length > 0 && (
              <motion.section
                className="portfolio-section portfolio-section--wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="portfolio-section__title">🚀 Capstone Projects</h2>
                <div className="portfolio-projects">
                  {projects.map((proj, i) => (
                    <div key={proj.id || i} className="portfolio-project-card">
                      <div className="portfolio-project-card__header">
                        <span className="portfolio-project-card__track">{proj.track?.name || 'Unknown'}</span>
                        <span className={`portfolio-project-card__status portfolio-project-card__status--${proj.status}`}>
                          {proj.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="portfolio-project-card__links">
                        {proj.repo_url && (
                          <a href={proj.repo_url} target="_blank" rel="noopener noreferrer" className="portfolio-project-card__link">
                            📂 Repository
                          </a>
                        )}
                        {proj.demo_url && (
                          <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="portfolio-project-card__link">
                            🔗 Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
