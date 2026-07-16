import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { careerService } from '../services/careerService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';
import { 
  Mail, ExternalLink, Award, BookOpen, 
  Code, Star, Calendar, MessageSquare, Shield, CheckCircle 
} from 'lucide-react';
import GithubIcon from '../components/common/GithubIcon';
import LinkedinIcon from '../components/common/LinkedinIcon';

const ACHIEVEMENT_DEFS: Record<string, { icon: string; name: string }> = {
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
  const { username, slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        if (slug) {
          // Public portfolio by slug
          const result = await careerService.getPublicPortfolio(slug);
          setData(result);
        } else if (username) {
          // Fallback legacy endpoint
          const result = await userService.getPublicProfile(username);
          // Standardize format
          setData({
            portfolio: {
              theme: 'minimal',
              custom_sections: {
                show_sections: ['About', 'Skills', 'Learning Progress', 'Projects', 'Certificates', 'Achievements', 'Contact']
              }
            },
            profile: {
              ...result.profile,
              githubConnected: result.profile.github_connected || false,
              githubUsername: result.profile.github_username || '',
              githubStats: result.profile.github_stats || null
            },
            completedTracks: result.completedTracks || [],
            learningProgress: [],
            projects: result.projects || [],
            certificates: result.certificates || []
          });
        }
      } catch (err: any) {
        console.error('Error loading portfolio:', err);
        setError(
          err.response?.status === 403 
            ? 'This portfolio is private.' 
            : err.response?.status === 404 
              ? 'Portfolio not found.' 
              : 'Failed to load portfolio.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioData();
  }, [username, slug]);

  if (loading) return <Loader fullPage />;

  if (error) {
    const isPrivate = error === 'This portfolio is private.';
    return (
      <PageTransition>
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{isPrivate ? '🔒' : '👤'}</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{error}</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              {isPrivate 
                ? 'The student has configured this page to be private.' 
                : 'The requested public portfolio could not be resolved.'}
            </p>
            <Link to="/" style={{
              display: 'inline-block',
              background: '#2563eb',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}>Go Home</Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const { portfolio, profile, completedTracks, learningProgress, projects, certificates } = data;
  const custom = portfolio?.custom_sections || {};
  const theme = portfolio?.theme || 'minimal';
  const showSections = custom.show_sections || ['About', 'Skills', 'Learning Progress', 'Projects', 'Certificates', 'Achievements', 'GitHub', 'Contact'];

  const earnedAchievements = (profile.achievements || [])
    .map((id: string) => ACHIEVEMENT_DEFS[id])
    .filter(Boolean);

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  // Theme Variables Injection
  const getThemeStyles = () => {
    switch (theme) {
      case 'developer':
        return {
          '--port-bg': '#0b0f19',
          '--port-card-bg': '#161b22',
          '--port-text': '#c9d1d9',
          '--port-text-title': '#f0f6fc',
          '--port-muted': '#8b949e',
          '--port-border': '#30363d',
          '--port-accent': '#58a6ff',
          '--port-accent-hover': '#1f6feb',
          '--port-accent-glow': 'rgba(88, 166, 255, 0.15)',
          '--port-font': "'JetBrains Mono', monospace",
        } as React.CSSProperties;
      case 'creative':
        return {
          '--port-bg': 'radial-gradient(circle at 50% 50%, #1e1145 0%, #0b071e 100%)',
          '--port-card-bg': 'rgba(255, 255, 255, 0.03)',
          '--port-text': '#e2e8f0',
          '--port-text-title': '#ffffff',
          '--port-muted': '#94a3b8',
          '--port-border': 'rgba(255, 255, 255, 0.08)',
          '--port-accent': '#ff007f',
          '--port-accent-hover': '#e6006f',
          '--port-accent-glow': 'rgba(255, 0, 127, 0.25)',
          '--port-font': "'Inter', sans-serif",
          'backdropFilter': 'blur(12px)',
          'WebkitBackdropFilter': 'blur(12px)',
        } as React.CSSProperties;
      case 'minimal':
      default:
        return {
          '--port-bg': '#ffffff',
          '--port-card-bg': '#f8fafc',
          '--port-text': '#334155',
          '--port-text-title': '#0f172a',
          '--port-muted': '#64748b',
          '--port-border': '#e2e8f0',
          '--port-accent': '#2563eb',
          '--port-accent-hover': '#1d4ed8',
          '--port-accent-glow': 'rgba(37, 99, 235, 0.08)',
          '--port-font': "'Inter', sans-serif",
        } as React.CSSProperties;
    }
  };

  return (
    <PageTransition>
      <div style={{
        ...getThemeStyles(),
        background: 'var(--port-bg)',
        color: 'var(--port-text)',
        fontFamily: 'var(--port-font)',
        minHeight: '100vh',
        padding: '60px 20px 100px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* PROFILE HERO */}
          <motion.div
            style={{
              background: 'var(--port-card-bg)',
              border: '1px solid var(--port-border)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Theme glow effect */}
            {theme === 'creative' && (
              <div style={{
                position: 'absolute',
                top: '-50px',
                width: '200px',
                height: '200px',
                background: 'var(--port-accent)',
                filter: 'blur(100px)',
                opacity: 0.15,
                zIndex: 0
              }} />
            )}

            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--port-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 800,
              marginBottom: '20px',
              boxShadow: '0 8px 16px var(--port-accent-glow)',
              zIndex: 1
            }}>
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--port-text-title)',
              marginBottom: '6px',
              zIndex: 1
            }}>{profile.name}</h1>
            
            <p style={{
              fontSize: '15px',
              color: 'var(--port-accent)',
              fontWeight: 600,
              marginBottom: '16px',
              zIndex: 1
            }}>@{profile.username}</p>

            {showSections.includes('About') && (
              <p style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--port-text)',
                maxWidth: '600px',
                marginBottom: '24px',
                zIndex: 1
              }}>{custom.about || profile.bio || 'Software engineer in training @ LearnStation.'}</p>
            )}

            {/* Quick stats block */}
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              borderTop: '1px solid var(--port-border)',
              paddingTop: '24px',
              width: '100%',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)' }}>Lvl {profile.level}</span>
                <span style={{ fontSize: '11px', color: 'var(--port-muted)', textTransform: 'uppercase' }}>Rank Level</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)' }}>{(profile.xp || 0).toLocaleString()}</span>
                <span style={{ fontSize: '11px', color: 'var(--port-muted)', textTransform: 'uppercase' }}>Total XP</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)' }}>{profile.streak} 🔥</span>
                <span style={{ fontSize: '11px', color: 'var(--port-muted)', textTransform: 'uppercase' }}>Day Streak</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)' }}>{completedTracks.length}</span>
                <span style={{ fontSize: '11px', color: 'var(--port-muted)', textTransform: 'uppercase' }}>Tracks Finished</span>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SKILLS SECTION */}
            {showSections.includes('Skills') && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={18} /> Verified Skill Taxonomy
                </h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {completedTracks.map((t: any, i: number) => (
                    <span 
                      key={i} 
                      style={{
                        background: 'var(--port-accent-glow)',
                        color: 'var(--port-accent)',
                        border: '1px solid var(--port-border)',
                        padding: '8px 16px',
                        borderRadius: '30px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                  {completedTracks.length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--port-muted)' }}>Learning path currently in progress.</p>
                  )}
                </div>
              </motion.section>
            )}

            {/* LEARNING PROGRESS SECTION */}
            {showSections.includes('Learning Progress') && learningProgress && learningProgress.length > 0 && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} /> Ongoing Curriculums
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {learningProgress.map((p: any, i: number) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--port-text-title)' }}>{p.track?.name}</span>
                        <span>{p.percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--port-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${p.percent}%`, height: '100%', background: 'var(--port-accent)', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* PROJECTS SHOWCASE */}
            {showSections.includes('Projects') && projects && projects.length > 0 && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ExternalLink size={18} /> Showcase Projects
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                  {projects.map((proj: any, i: number) => (
                    <div 
                      key={i} 
                      style={{
                        border: '1px solid var(--port-border)',
                        borderRadius: '12px',
                        padding: '20px',
                        background: theme === 'minimal' ? '#ffffff' : 'rgba(255, 255, 255, 0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--port-text-title)', marginBottom: '8px' }}>{proj.project_name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--port-muted)', marginBottom: '12px', lineHeight: 1.5 }}>{proj.description}</p>
                        
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {proj.technologies?.map((tech: string, idx: number) => (
                            <span key={idx} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--port-border)', color: 'var(--port-text)' }}>{tech}</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--port-border)', paddingTop: '12px', fontSize: '12px' }}>
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--port-accent)', textDecoration: 'none', fontWeight: 600 }}>
                            <GithubIcon size={12} /> Repo
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--port-accent)', textDecoration: 'none', fontWeight: 600 }}>
                            <ExternalLink size={12} /> Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* CERTIFICATES */}
            {showSections.includes('Certificates') && certificates && certificates.length > 0 && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} /> Credentials & Certificates
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {certificates.map((cert: any, i: number) => (
                    <Link 
                      key={i} 
                      to={`/certificate/${cert.certificate_id}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        border: '1px solid var(--port-border)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: 'var(--port-text)',
                        background: theme === 'minimal' ? '#ffffff' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🎖️</span>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--port-text-title)' }}>{cert.track?.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--port-muted)' }}>ID: {cert.certificate_id}</span>
                        </div>
                      </div>
                      <span style={{ color: 'var(--port-accent)', fontSize: '13px', fontWeight: 600 }}>View →</span>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ACHIEVEMENTS / BADGES */}
            {showSections.includes('Achievements') && earnedAchievements.length > 0 && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} /> Collectible Badges
                </h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {earnedAchievements.map((ach: any, i: number) => (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--port-card-bg)',
                        border: '1px solid var(--port-border)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '13px'
                      }}
                      title={ach.name}
                    >
                      <span style={{ fontSize: '18px' }}>{ach.icon}</span>
                      <span style={{ fontWeight: 600 }}>{ach.name}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* GITHUB INTEGRATION SECTION */}
            {showSections.includes('GitHub') && profile.githubConnected && profile.githubStats && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GithubIcon size={18} /> GitHub Repository Showcase
                </h2>
                
                {/* Stats row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                  textAlign: 'center',
                  background: theme === 'minimal' ? '#ffffff' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid var(--port-border)'
                }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--port-text-title)' }}>{profile.githubStats.repos}</span>
                    <p style={{ fontSize: '11px', color: 'var(--port-muted)', margin: '4px 0 0' }}>Repos</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--port-text-title)' }}>{profile.githubStats.commits}</span>
                    <p style={{ fontSize: '11px', color: 'var(--port-muted)', margin: '4px 0 0' }}>Commits</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--port-text-title)' }}>{profile.githubStats.stars}</span>
                    <p style={{ fontSize: '11px', color: 'var(--port-muted)', margin: '4px 0 0' }}>Stars</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--port-accent)' }}>{profile.githubStats.languages?.[0] || 'TypeScript'}</span>
                    <p style={{ fontSize: '11px', color: 'var(--port-muted)', margin: '4px 0 0' }}>Primary</p>
                  </div>
                </div>

                {/* Selected repos list */}
                {profile.githubStats.repositoriesList && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {profile.githubStats.repositoriesList.slice(0, 3).map((repo: any, i: number) => (
                      <div 
                        key={i}
                        style={{
                          padding: '16px',
                          border: '1px solid var(--port-border)',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--port-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Code size={14} /> {repo.name}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--port-muted)', marginTop: '4px' }}>{repo.desc}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={12} /> {repo.stars}</span>
                          <span style={{ background: 'var(--port-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{repo.language}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* CONTACT DETAILS */}
            {showSections.includes('Contact') && (
              <motion.section 
                style={{
                  background: 'var(--port-card-bg)',
                  border: '1px solid var(--port-border)',
                  padding: '32px',
                  borderRadius: '20px',
                  textAlign: 'center'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--port-text-title)', marginBottom: '12px' }}>Get In Touch</h2>
                <p style={{ fontSize: '14px', color: 'var(--port-muted)', marginBottom: '24px' }}>Interested in collaborating or discussing technical roles? Reach out via channels below.</p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {custom.contact_email && (
                    <a href={`mailto:${custom.contact_email}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--port-accent)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      <Mail size={16} /> {custom.contact_email}
                    </a>
                  )}
                  {custom.linkedin_url && (
                    <a href={custom.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid var(--port-border)',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--port-text-title)'
                    }}>
                      <LinkedinIcon size={16} style={{ color: '#0077b5' }} /> LinkedIn Connection
                    </a>
                  )}
                </div>
              </motion.section>
            )}

          </div>

          {/* Footer branding */}
          <div style={{ textAlign: 'center', marginTop: '60px', borderTop: '1px solid var(--port-border)', paddingTop: '20px' }}>
            <p style={{ fontSize: '11px', color: 'var(--port-muted)' }}>
              Verified Portfolio generated automatically by <Link to="/" style={{ color: 'var(--port-accent)', textDecoration: 'none', fontWeight: 600 }}>LearnStation 🎓</Link>. © 2026.
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
