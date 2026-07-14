import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { notificationService, NotificationItem } from '../services/notificationService';
import { supabase } from '../supabase';
import AnimatedCounter from '../components/common/AnimatedCounter';
import ProgressBar from '../components/common/ProgressBar';
import Loader from '../components/common/Loader';
import PageTransition from '../components/layout/PageTransition';
import ActivityHeatmap from '../components/common/ActivityHeatmap';
import { 
  Camera, 
  X, 
  Save, 
  Edit3, 
  Share2, 
  Download, 
  Settings as SettingsIcon, 
  Award, 
  ExternalLink,
  CheckCircle,
  Copy,
  BookOpen,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TRACK_ICONS: Record<string, string> = { sql: '🗄️', python: '🐍', webdev: '🌐', ai: '🤖', datascience: '📈', java: '☕' };

// Helper to calculate progress for achievements
const getAchievementProgress = (id: string, stats: any) => {
  const lessons = stats.lessonsCompleted || 0;
  const xp = stats.totalXp || 0;
  const streak = stats.streak || 0;
  const longestStreak = stats.longestStreak || 0;
  const completedTracksList = stats.completedTracksList || [];
  const aiPathsGenerated = stats.aiPathsGenerated || 0;
  const perfectQuizzes = stats.perfectQuizzesCount || 0;
  const challenges = stats.completedChallengesCount || 0;
  const projects = stats.completedProjectsCount || 0;
  const level = stats.level || 1;

  switch (id) {
    case 'lesson-1': return { current: lessons, target: 1 };
    case 'lesson-10': return { current: lessons, target: 10 };
    case 'lesson-25': return { current: lessons, target: 25 };
    case 'lesson-50': return { current: lessons, target: 50 };
    case 'lesson-100': return { current: lessons, target: 100 };
    case 'lesson-250': return { current: lessons, target: 250 };
    case 'lesson-500': return { current: lessons, target: 500 };
    
    case 'xp-100': return { current: xp, target: 100 };
    case 'xp-500': return { current: xp, target: 500 };
    case 'xp-1000': return { current: xp, target: 1000 };
    case 'xp-5000': return { current: xp, target: 5000 };
    case 'xp-10000': return { current: xp, target: 10000 };
    case 'xp-25000': return { current: xp, target: 25000 };

    case 'streak-3': return { current: streak, target: 3 };
    case 'streak-7': return { current: streak, target: 7 };
    case 'streak-14': return { current: streak, target: 14 };
    case 'streak-30': return { current: streak, target: 30 };
    case 'streak-60': return { current: streak, target: 60 };
    case 'streak-100': return { current: streak, target: 100 };
    case 'streak-365': return { current: streak, target: 365 };

    case 'track-sql': return { current: completedTracksList.includes('sql') ? 1 : 0, target: 1 };
    case 'track-python': return { current: completedTracksList.includes('python') ? 1 : 0, target: 1 };
    case 'track-webdev': return { current: completedTracksList.includes('webdev') ? 1 : 0, target: 1 };
    case 'track-ai': return { current: completedTracksList.includes('ai') ? 1 : 0, target: 1 };
    case 'track-datascience': return { current: completedTracksList.includes('datascience') ? 1 : 0, target: 1 };
    case 'track-java': return { current: completedTracksList.includes('java') ? 1 : 0, target: 1 };

    case 'quiz-perfect': return { current: perfectQuizzes, target: 1 };
    case 'quiz-perfect-10': return { current: perfectQuizzes, target: 10 };
    case 'quiz-perfect-50': return { current: perfectQuizzes, target: 50 };
    case 'quiz-champion': return { current: perfectQuizzes, target: 100 };

    case 'practice-1': return { current: challenges, target: 1 };
    case 'practice-50': return { current: challenges, target: 50 };
    case 'practice-100': return { current: challenges, target: 100 };
    case 'practice-500': return { current: challenges, target: 500 };

    case 'ai-roadmap-1': return { current: aiPathsGenerated, target: 1 };
    case 'ai-roadmap-5': return { current: aiPathsGenerated, target: 5 };
    case 'ai-roadmap-10': return { current: aiPathsGenerated, target: 10 };
    case 'ai-roadmap-architect': return { current: aiPathsGenerated, target: 20 };

    case 'project-1': return { current: projects, target: 1 };
    case 'project-5': return { current: projects, target: 5 };
    case 'project-10': return { current: projects, target: 10 };
    case 'project-portfolio': return { current: projects, target: 15 };

    case 'rare-night-owl': return { current: stats.isNightLearning ? 1 : 0, target: 1 };
    case 'rare-early-bird': return { current: stats.isEarlyLearning ? 1 : 0, target: 1 };
    case 'rare-weekend-warrior': return { current: stats.isWeekendLearning ? 1 : 0, target: 1 };
    case 'rare-consistency-king': return { current: longestStreak, target: 30 };
    case 'rare-learning-machine': return { current: lessons, target: 100 };
    case 'rare-master-learner': return { current: level, target: 10 };

    default: return { current: 0, target: 1 };
  }
};

export default function ProfilePage() {
  const { user, settings, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', bio: '', avatarUrl: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Please select an image under 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = () => {
    setEditForm({
      name: profile?.user?.name || user?.name || '',
      username: profile?.user?.username || user?.username || '',
      bio: profile?.user?.bio || user?.bio || '',
      avatarUrl: profile?.user?.avatarUrl || user?.avatarUrl || '',
    });
    setErrorMessage('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMessage('');
    try {
      const updatedData = await userService.updateProfile(editForm);
      setProfile((prev: any) => ({
        ...prev,
        user: {
          ...prev.user,
          ...updatedData.user
        }
      }));
      updateUser(updatedData.user);
      setShowEditModal(false);
      setToast('🎉 Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, achData, actData, notifData] = await Promise.all([
          userService.getProfile(),
          userService.getAchievements(),
          userService.getActivity(),
          notificationService.getAll('All', '', 10, 0)
        ]);

        setProfile(profileData);
        setAchievements(achData.achievements || []);
        setActivity(actData.activity || []);
        setTimelineEvents(notifData.notifications || []);

        // Load certificates from Supabase
        const { data: certs, error: certsError } = await supabase
          .from('certificates')
          .select('*, track:tracks(name, slug, color, icon)')
          .eq('user_id', profileData.user.id);

        if (certsError) throw certsError;
        setCertificates(certs || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullPage />;

  const stats = profile?.stats || {};
  const levelInfo = profile?.levelInfo || { progress: 0, xpInLevel: 0, xpNeeded: 100 };
  const initials = user?.name?.split(' ').map((w: any) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Calculate Rank Label
  const getRankLabel = (xp: number) => {
    if (xp < 500) return 'Novice Coder';
    if (xp < 1500) return 'Tech Apprentice';
    if (xp < 5000) return 'Fullstack Dev';
    if (xp < 15000) return 'System Engineer';
    return 'Grandmaster Architect';
  };

  const shareProfileLink = () => {
    const publicUrl = `${window.location.origin}/u/${profile?.user?.username || user?.username}`;
    navigator.clipboard.writeText(publicUrl);
    setToast('📋 Public profile link copied to clipboard!');
  };

  const downloadLearningReport = () => {
    const csvContent = [
      ['LearnStation Learning Report', ''],
      ['Name', profile?.user?.name || user?.name],
      ['Username', profile?.user?.username || user?.username],
      ['Joined', new Date(profile?.user?.createdAt || '').toLocaleDateString()],
      ['Total XP', stats.totalXp || 0],
      ['Current Level', stats.level || 1],
      ['Streak', `${stats.streak || 0} days`],
      ['Lessons Completed', stats.lessonsCompleted || 0],
      ['Tracks Completed', stats.tracksCompleted || 0],
      ['Certificates Earned', certificates.length],
      ['Achievements Earned', achievements.filter((a: any) => a.earned).length]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnStation_Report_${profile?.user?.username || 'learner'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast('📥 CSV Learning Report downloaded!');
  };

  const achievementCategories = {
    milestones: 'Learning Milestones',
    xp: 'XP Achievements',
    streaks: 'Streak Achievements',
    tracks: 'Track Completion',
    quizzes: 'Quiz Achievements',
    practice: 'Practice Achievements',
    ai: 'AI Learning Achievements',
    projects: 'Project Achievements',
    special: 'Special Rare Badges',
  };

  const originalName = profile?.user?.name || user?.name || '';
  const originalUsername = profile?.user?.username || user?.username || '';
  const originalBio = profile?.user?.bio || user?.bio || '';
  const originalAvatarUrl = profile?.user?.avatarUrl || user?.avatarUrl || '';

  const isFormUnchanged =
    editForm.name === originalName &&
    editForm.username === originalUsername &&
    editForm.bio === originalBio &&
    editForm.avatarUrl === originalAvatarUrl;

  return (
    <PageTransition>
      <div className="profile-page" style={{ padding: 'var(--space-8) 0' }}>
        <div className="container container--narrow">
          
          {/* Profile Header */}
          <motion.div className="profile-header" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div 
              className="profile-avatar-container" 
              onClick={openEditModal}
              title="Click to edit profile picture"
            >
              {profile?.user?.avatarUrl || user?.avatarUrl ? (
                <img 
                  src={profile?.user?.avatarUrl || user?.avatarUrl} 
                  alt={profile?.user?.name || user?.name || 'User'} 
                  className="profile-avatar-img" 
                />
              ) : (
                <div className="profile-avatar-placeholder">{initials}</div>
              )}
              <div className="profile-avatar-overlay">
                <Camera size={20} />
              </div>
            </div>
            
            <div className="profile-info" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 0, fontSize: '24px' }}>
                  {profile?.user?.name || user?.name}
                  {user?.role === 'owner' && (
                    <span className="owner-badge">
                      <span className="owner-badge__crown">👑</span>
                      <span className="owner-badge__text">★ OWNER</span>
                      <span className="owner-badge__shine" />
                    </span>
                  )}
                </h1>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={openEditModal}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <Edit3 size={12} /> Edit Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => navigate('/settings')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <SettingsIcon size={12} /> Settings
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                <span className="profile-username" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-blue)', fontWeight: 500 }}>
                  @{profile?.user?.username || user?.username || 'learner'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getRankLabel(stats.totalXp || 0)}
                </span>
              </div>

              <p className="profile-bio" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '10px', marginBottom: '12px', fontStyle: profile?.user?.bio ? 'normal' : 'italic' }}>
                {profile?.user?.bio || "No bio added yet. Add a short bio to describe your learning journey!"}
              </p>

              <span className="profile-level">Level {stats.level || 1}</span>
              <div className="profile-level-bar">
                <ProgressBar value={levelInfo.progress * 100} max={100} color="var(--accent-violet)" size="md" />
                <span className="profile-level-text">{levelInfo.xpInLevel} / {levelInfo.xpNeeded} XP to next level</span>
              </div>

              {/* Preferences Summary */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Daily Goal: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{user?.dailyXpGoal || 50} XP</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fav Time: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{settings?.preferred_learning_time ? settings.preferred_learning_time.charAt(0).toUpperCase() + settings.preferred_learning_time.slice(1) : 'Evening'}</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Focus: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{profile?.trackProgress?.[0]?.track?.name || 'Fullstack Coding'}</strong>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Quick Actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-6)' }}>
            <button onClick={shareProfileLink} className="btn btn--secondary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Share2 size={14} /> Share Profile
            </button>
            <button onClick={downloadLearningReport} className="btn btn--secondary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Download size={14} /> Download Report
            </button>
          </div>

          {/* Stats Grid */}
          <motion.div className="profile-stats" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {[
              { label: 'Total XP', value: stats.totalXp || 0, icon: '✦', color: 'var(--accent-amber)' },
              { label: 'Level', value: stats.level || 1, icon: '⭐', color: 'var(--accent-violet)' },
              { label: 'Day Streak', value: stats.streak || 0, icon: '🔥', color: 'var(--accent-rose)' },
              { label: 'Lessons Done', value: stats.lessonsCompleted || 0, icon: '📚', color: 'var(--accent-blue)' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="profile-stat-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <span className="profile-stat-card__icon">{stat.icon}</span>
                <span className="profile-stat-card__value" style={{ color: stat.color }}>
                  <AnimatedCounter value={stat.value} duration={1200} />
                </span>
                <span className="profile-stat-card__label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div className="profile-activity" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Activity Calendar</h2>
            <ActivityHeatmap 
              activity={activity} 
              streak={stats.streak || 0} 
              longestStreak={stats.longestStreak || 0} 
              showSummary={true} 
            />
          </motion.div>

          {/* Certificates Portfolio */}
          <motion.div className="profile-certificates" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Certificates Portfolio</h2>
            
            {certificates.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🎓</span>
                No certificates earned yet. Complete all lessons and pass the capstone project in any track to graduate!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                {certificates.map(cert => (
                  <div 
                    key={cert.id} 
                    className="card" 
                    style={{ 
                      padding: 'var(--space-4)', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '32px' }}>{TRACK_ICONS[cert.track?.slug] || cert.track?.icon || '🎓'}</span>
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-primary)' }}>{cert.track?.name || 'Technical Course'}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {cert.certificate_id}</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '12px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Earned: {new Date(cert.created_at).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link 
                          to={`/certificate/${cert.certificate_id}`}
                          title="Verify Credentials"
                          style={{
                            padding: '6px',
                            borderRadius: '4px',
                            color: 'var(--accent-blue)',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/certificate/${cert.certificate_id}`);
                            setToast('📋 Certificate link copied!');
                          }}
                          title="Copy Certificate Link"
                          style={{
                            padding: '6px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity Timeline */}
          <motion.div className="profile-timeline" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Milestone History</h2>
            
            {timelineEvents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No events logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }} />

                {timelineEvents.map(event => (
                  <div key={event.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-20px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '2px solid var(--accent-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      zIndex: 2
                    }}>
                      {event.icon || '•'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{event.title}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{event.message}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        {new Date(event.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Achievements Grid */}
          <motion.div className="profile-achievements" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Achievements & Badges</h2>
            
            {Object.entries(achievementCategories).map(([catKey, catName]) => {
              const catAchievements = achievements.filter(a => a.category === catKey);
              if (catAchievements.length === 0) return null;

              return (
                <div key={catKey} className="achievement-category-section" style={{ marginBottom: '24px' }}>
                  <h3 className="achievement-category-title" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>{catName}</h3>
                  <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    {catAchievements.map((a) => {
                      const progress = getAchievementProgress(a.id, stats);
                      const isUnlocked = a.earned || profile?.user?.achievements?.includes(a.id);
                      const isInProgress = !isUnlocked && progress.current > 0;
                      const isLocked = !isUnlocked && progress.current === 0;

                      let cardStateClass = 'achievement-card--locked';
                      if (isUnlocked) cardStateClass = 'achievement-card--unlocked';
                      else if (isInProgress) cardStateClass = 'achievement-card--in-progress';

                      let rarityClass = 'rarity-standard';
                      if (a.rarity === 'Rare') rarityClass = 'rarity-rare';
                      else if (a.rarity === 'Legendary') rarityClass = 'rarity-legendary';

                      return (
                        <motion.div
                          key={a.id}
                          className={`achievement-card ${cardStateClass} ${rarityClass}`}
                          whileHover={{ y: -4, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="achievement-card__rarity-tag">{a.rarity}</div>
                          <span className="achievement-card__icon">{a.icon}</span>
                          <strong>{a.name}</strong>
                          <p>{a.description}</p>
                          
                          <div className="achievement-card__progress">
                            <div className="achievement-card__progress-label">
                              {isUnlocked ? 'Unlocked' : `${Math.min(progress.current, progress.target)} / ${progress.target}`}
                            </div>
                            <div className="achievement-card__progress-bar-container">
                              <div
                                className="achievement-card__progress-bar"
                                style={{ width: `${isUnlocked ? 100 : Math.min(100, (progress.current / progress.target) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {isLocked && <div className="achievement-card__lock">🔒</div>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="profile-edit-modal-backdrop" onClick={() => setShowEditModal(false)}>
            <motion.div
              className="profile-edit-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <form onSubmit={handleSaveProfile} className="profile-edit-modal-form">
                <div className="profile-edit-modal__header">
                  <span className="profile-edit-modal__title">Edit Learning Profile</span>
                  <button type="button" className="profile-edit-modal__close" onClick={() => setShowEditModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="profile-edit-modal__body">
                  {errorMessage && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      marginBottom: '16px'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Alex Mercer"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label>Username</label>
                    <input
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="e.g. alex_mercer"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label>Bio</label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Describe your learning goals, interests, or career path..."
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label>Profile Picture</label>
                    <div className="profile-edit-image-card">
                      <div className="profile-edit-avatar-preview">
                        <img 
                          src={editForm.avatarUrl || 'https://via.placeholder.com/64'} 
                          alt="Avatar Preview" 
                        />
                      </div>
                      <div className="profile-edit-image-actions">
                        <button
                          type="button"
                          className="btn btn--upload"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          📁 Upload from Device
                        </button>
                        {editForm.avatarUrl && (
                          <button
                            type="button"
                            className="btn btn--remove"
                            onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label>Or Paste Image URL</label>
                    <input
                      type="url"
                      value={editForm.avatarUrl.startsWith('data:') ? '' : editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>

                <div className="profile-edit-modal__footer">
                  <button
                    type="button"
                    className="btn btn--secondary btn--md"
                    onClick={() => setShowEditModal(false)}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary btn--md"
                    disabled={saveLoading || isFormUnchanged}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {saveLoading ? (
                      <>
                        <span className="btn__spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}
