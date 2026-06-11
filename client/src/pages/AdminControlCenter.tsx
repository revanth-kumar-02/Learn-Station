import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../css/admin.css';

// SVG Icons
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tracks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10v6" />
      <path d="M6 6h12v12H6z" />
      <path d="M12 2v4M12 18v4" />
    </svg>
  ),
  lessons: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  quizzes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  achievements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6c0 3-1.6 5.4-3.5 7H9.5C7.6 13.4 6 11 6 8a6 6 0 0 1 6-6z" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  announcements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'users', label: 'User Management', icon: Icons.users },
  { id: 'tracks', label: 'Track Management', icon: Icons.tracks },
  { id: 'lessons', label: 'Lesson Management', icon: Icons.lessons },
  { id: 'quizzes', label: 'Quiz Management', icon: Icons.quizzes },
  { id: 'ai', label: 'AI Blueprint Management', icon: Icons.ai },
  { id: 'achievements', label: 'Achievements', icon: Icons.achievements },
  { id: 'analytics', label: 'Analytics', icon: Icons.analytics },
  { id: 'reports', label: 'Reports', icon: Icons.reports },
  { id: 'announcements', label: 'Announcements', icon: Icons.announcements },
  { id: 'settings', label: 'System Settings', icon: Icons.settings },
];

export default function AdminControlCenter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation states
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data storage
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('');

  // Modals & Editors
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', content: '', type: 'info', is_active: true });

  // Load baseline statistics
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
      setDailyStats(data.dailyStats || []);
      setHealth(data.health);
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Failed to fetch dashboard statistics.');
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch functions based on module
  useEffect(() => {
    const loadModuleData = async () => {
      setLoading(true);
      try {
        if (currentModule === 'users') {
          const { data } = await api.get(`/admin/users?search=${searchQuery}`);
          setUsers(data.users);
        } else if (currentModule === 'tracks' || currentModule === 'ai') {
          const { data } = await api.get('/admin/tracks');
          setTracks(data.tracks);
        } else if (currentModule === 'lessons') {
          const [tracksRes, lessonsRes] = await Promise.all([
            api.get('/admin/tracks'),
            api.get(`/admin/lessons?track_id=${selectedTrackFilter}`),
          ]);
          setTracks(tracksRes.data.tracks);
          setLessons(lessonsRes.data.lessons);
        } else if (currentModule === 'quizzes') {
          const [lessonsRes, challengesRes] = await Promise.all([
            api.get('/admin/lessons'),
            api.get(`/admin/challenges?lesson_id=${selectedLessonFilter}`),
          ]);
          setLessons(lessonsRes.data.lessons);
          setChallenges(challengesRes.data.challenges);
        } else if (currentModule === 'settings') {
          const { data } = await api.get('/admin/settings');
          setSettings(data.settings || {});
        } else if (currentModule === 'announcements') {
          const { data } = await api.get('/admin/announcements');
          setAnnouncements(data.announcements || []);
        } else if (currentModule === 'analytics') {
          // Re-fetch stats to get fresh chart metrics
          await fetchStats();
        }
      } catch (err) {
        console.error(err);
        triggerFeedback('error', `Failed to load details for module ${currentModule}`);
      } finally {
        setLoading(false);
      }
    };

    loadModuleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModule, selectedTrackFilter, selectedLessonFilter, searchQuery]);

  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ==========================================
  // USER ACTIONS
  // ==========================================
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        role: editingUser.role,
        is_suspended: editingUser.is_suspended,
      });
      setUsers(users.map(u => u.id === editingUser.id ? data.user : u));
      setShowUserModal(false);
      triggerFeedback('success', 'User updated successfully.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This will erase all progress, activity logs, and certificates.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      triggerFeedback('success', 'User profile deleted.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // ==========================================
  // TRACK ACTIONS
  // ==========================================
  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrack.id) {
        const { data } = await api.put(`/admin/tracks/${editingTrack.id}`, editingTrack);
        setTracks(tracks.map(t => t.id === editingTrack.id ? data.track : t));
        triggerFeedback('success', 'Track updated successfully.');
      } else {
        const { data } = await api.post('/admin/tracks', editingTrack);
        setTracks([...tracks, data.track]);
        triggerFeedback('success', 'New learning track created.');
      }
      setShowTrackModal(false);
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to save track.');
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!window.confirm('Danger! Deleting this track will delete all modules, lessons, and challenges. Do you wish to continue?')) return;
    try {
      await api.delete(`/admin/tracks/${id}`);
      setTracks(tracks.filter(t => t.id !== id));
      triggerFeedback('success', 'Track deleted completely.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to delete track.');
    }
  };

  // ==========================================
  // LESSON ACTIONS
  // ==========================================
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson.id) {
        const { data } = await api.put(`/admin/lessons/${editingLesson.id}`, editingLesson);
        setLessons(lessons.map(l => l.id === editingLesson.id ? data.lesson : l));
        triggerFeedback('success', 'Lesson details updated.');
      } else {
        // Fetch a module to associate with or create one if none exists in the track
        let moduleId = editingLesson.module_id;
        if (!moduleId) {
          // Find or create default module for track
          const modsRes = await api.get(`/admin/modules?track_id=${editingLesson.track_id}`);
          if (modsRes.data.modules.length > 0) {
            moduleId = modsRes.data.modules[0].id;
          } else {
            // Create a default module
            const createModRes = await api.post('/admin/modules', {
              track_id: editingLesson.track_id,
              name: 'Module 1: Getting Started',
              display_order: 1,
            });
            moduleId = createModRes.data.module.id;
          }
        }

        const { data } = await api.post('/admin/lessons', {
          ...editingLesson,
          module_id: moduleId,
        });
        setLessons([...lessons, data.lesson]);
        triggerFeedback('success', 'New lesson created.');
      }
      setShowLessonModal(false);
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to save lesson.');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Deleting this lesson will delete all quiz challenges associated. Continue?')) return;
    try {
      await api.delete(`/admin/lessons/${id}`);
      setLessons(lessons.filter(l => l.id !== id));
      triggerFeedback('success', 'Lesson deleted.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to delete lesson.');
    }
  };

  // ==========================================
  // QUIZ ACTIONS
  // ==========================================
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formatted = {
        ...editingQuiz,
        options: editingQuiz.optionsStr?.split('\n').filter((opt: string) => opt.trim() !== '') || [],
      };
      if (editingQuiz.id) {
        const { data } = await api.put(`/admin/challenges/${editingQuiz.id}`, formatted);
        setChallenges(challenges.map(c => c.id === editingQuiz.id ? data.challenge : c));
        triggerFeedback('success', 'Quiz challenge updated.');
      } else {
        const { data } = await api.post('/admin/challenges', formatted);
        setChallenges([...challenges, data.challenge]);
        triggerFeedback('success', 'New quiz question added.');
      }
      setShowQuizModal(false);
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to save quiz.');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      await api.delete(`/admin/challenges/${id}`);
      setChallenges(challenges.filter(c => c.id !== id));
      triggerFeedback('success', 'Quiz challenge deleted.');
    } catch (err: any) {
      triggerFeedback('error', err.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  // ==========================================
  // SETTINGS & ANNOUNCEMENTS
  // ==========================================
  const handleToggleSetting = async (key: string, currentVal: boolean) => {
    try {
      const nextVal = !currentVal;
      await api.put('/admin/settings', { [key]: nextVal });
      setSettings((prev: any) => ({ ...prev, [key]: nextVal }));
      triggerFeedback('success', `Setting updated successfully.`);
    } catch (err) {
      triggerFeedback('error', 'Failed to toggle setting.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/announcements', newAnnounce);
      setAnnouncements([data.announcement, ...announcements]);
      setShowAnnounceModal(false);
      setNewAnnounce({ title: '', content: '', type: 'info', is_active: true });
      triggerFeedback('success', 'Announcement published.');
    } catch (err) {
      triggerFeedback('error', 'Failed to publish announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
      triggerFeedback('success', 'Announcement removed.');
    } catch (err) {
      triggerFeedback('error', 'Failed to remove announcement.');
    }
  };

  // ==========================================
  // EXPORT REPORTS
  // ==========================================
  const handleExportData = async (type: string) => {
    try {
      let endpoint = '';
      if (type === 'users') endpoint = '/admin/users';
      else if (type === 'tracks') endpoint = '/admin/tracks';
      else if (type === 'settings') endpoint = '/admin/settings';

      const { data } = await api.get(endpoint);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learnstation_report_${type}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerFeedback('success', 'Report exported successfully.');
    } catch (err) {
      triggerFeedback('error', 'Failed to export report.');
    }
  };

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="admin-layout">
      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              backgroundColor: feedback.type === 'success' ? '#22c55e' : '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <svg className="admin-sidebar__logo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="admin-sidebar__title">Midnight Admin</span>
        </div>

        <div className="admin-sidebar__profile">
          <div className="admin-sidebar__user-details">
            <div className="admin-sidebar__avatar">{initials}</div>
            <div>
              <div className="admin-sidebar__username">{user?.name}</div>
              <div className="admin-sidebar__role">
                {user?.role === 'owner' ? (
                  <span className="owner-badge" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                    👑 ★ OWNER
                    <span className="owner-badge__shine" />
                  </span>
                ) : (
                  'Platform Administrator'
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {SIDEBAR_ITEMS.map((item) => {
            // normal admins cannot access system settings or AI blueprint modifications
            if (user?.role === 'admin' && (item.id === 'settings' || item.id === 'ai')) return null;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentModule(item.id);
                  setSidebarOpen(false);
                }}
                className={`admin-sidebar__nav-item ${currentModule === item.id ? 'admin-sidebar__nav-item--active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button onClick={handleLogout} className="admin-sidebar__logout">
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header__title-section">
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1 className="admin-header__title">
              {SIDEBAR_ITEMS.find((i) => i.id === currentModule)?.label}
            </h1>
            {user?.role === 'owner' && (
              <span className="owner-badge" style={{ marginLeft: '12px' }}>
                👑 ★ OWNER
                <span className="owner-badge__shine" />
              </span>
            )}
          </div>

          <div className="admin-header__actions">
            {health && (
              <div className="admin-header__status">
                <span className="admin-header__status-pulse" />
                <span>Health Status: {health.status}</span>
              </div>
            )}
            <Link to="/" className="admin-header__back-btn">
              ← Return to Platform
            </Link>
          </div>
        </header>

        <main className="admin-viewport">
          {loading && <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>Syncing data with command center...</div>}

          {/* ==========================================
              MODULE: DASHBOARD
              ========================================== */}
          {currentModule === 'dashboard' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-grid-stats">
                <div className="admin-card-stat">
                  <span className="admin-card-stat__label">Total Accounts</span>
                  <span className="admin-card-stat__value">{stats.totalUsers}</span>
                  <span className="admin-card-stat__trend admin-card-stat__trend--up">
                    ✦ Registered users on platform
                  </span>
                </div>
                <div className="admin-card-stat">
                  <span className="admin-card-stat__label">Active (7 Days)</span>
                  <span className="admin-card-stat__value">{stats.activeUsers}</span>
                  <span className="admin-card-stat__trend admin-card-stat__trend--up">
                    ● Weekly active users
                  </span>
                </div>
                <div className="admin-card-stat">
                  <span className="admin-card-stat__label">Total XP Distributed</span>
                  <span className="admin-card-stat__value">{stats.totalXp.toLocaleString()}</span>
                  <span className="admin-card-stat__trend">
                    ⚡ Platform engagement metric
                  </span>
                </div>
                <div className="admin-card-stat">
                  <span className="admin-card-stat__label">Lessons Completed</span>
                  <span className="admin-card-stat__value">{stats.totalLessonsCompleted}</span>
                  <span className="admin-card-stat__trend">
                    📚 Curriculum elements consumed
                  </span>
                </div>
              </div>

              <div className="admin-columns">
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">Recent Learning Activity Logs</h2>
                  </div>
                  {recentActivity.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent learning logs generated.</p>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Username</th>
                            <th>Date</th>
                            <th>XP Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivity.map((log) => (
                            <tr key={log.id}>
                              <td style={{ fontWeight: 600 }}>{log.name}</td>
                              <td style={{ color: '#94a3b8' }}>@{log.username}</td>
                              <td>{log.date}</td>
                              <td style={{ color: '#3b82f6', fontWeight: 600 }}>+{log.xp} XP</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div>
                  <div className="admin-card">
                    <div className="admin-card__header">
                      <h2 className="admin-card__title">Diagnostics & Status</h2>
                    </div>
                    {health && (
                      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>DB Engine:</span>
                          <span style={{ color: '#22c55e', fontWeight: 600 }}>{health.database}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>API Uptime:</span>
                          <span>{Math.round(health.apiUptime / 60)} minutes</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>Server Memory:</span>
                          <span>{health.memory}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>AI Path Gen:</span>
                          <span>{stats.aiPathsGenerated} blueprints</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>Track Completions:</span>
                          <span>{stats.trackCompletions} tracks</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="admin-card">
                    <div className="admin-card__header">
                      <h2 className="admin-card__title">Quick Actions Panel</h2>
                    </div>
                    <div className="admin-quick-actions">
                      <button className="admin-quick-btn" onClick={() => setCurrentModule('users')}>
                        <span className="admin-quick-btn__icon">👥</span>
                        <span className="admin-quick-btn__text">Manage Users</span>
                      </button>
                      <button className="admin-quick-btn" onClick={() => setCurrentModule('tracks')}>
                        <span className="admin-quick-btn__icon">📚</span>
                        <span className="admin-quick-btn__text">Manage Tracks</span>
                      </button>
                      <button className="admin-quick-btn" onClick={() => {
                        setNewAnnounce({ title: '', content: '', type: 'info', is_active: true });
                        setShowAnnounceModal(true);
                      }}>
                        <span className="admin-quick-btn__icon">📢</span>
                        <span className="admin-quick-btn__text">Announcement</span>
                      </button>
                      {user?.role === 'owner' && (
                        <button className="admin-quick-btn" onClick={() => setCurrentModule('settings')}>
                          <span className="admin-quick-btn__icon">⚙️</span>
                          <span className="admin-quick-btn__text">Settings</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: USER MANAGEMENT
              ========================================== */}
          {currentModule === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-controls-row">
                <input
                  type="text"
                  placeholder="Search name, username, email..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Level / XP</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className={u.is_suspended ? 'suspended-row' : ''}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td style={{ color: '#94a3b8' }}>@{u.username}</td>
                          <td>{u.email}</td>
                          <td>
                            Lv.{u.level} <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({u.xp} XP)</span>
                          </td>
                          <td>
                            <span className={`admin-user-badge admin-user-badge--${u.role}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.is_suspended ? (
                              <span style={{ color: '#ef4444', fontWeight: 600 }}>Suspended</span>
                            ) : (
                              <span style={{ color: '#22c55e' }}>Active</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowUserModal(true);
                                }}
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                              >
                                Edit
                              </button>
                              {u.role !== 'owner' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="admin-btn admin-btn--danger admin-btn--sm"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: TRACK MANAGEMENT
              ========================================== */}
          {currentModule === 'tracks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-controls-row">
                <span />
                <button
                  onClick={() => {
                    setEditingTrack({ name: '', slug: '', description: '', icon: 'polygon', color: '#3B82F6', display_order: undefined, is_ai_generated: false });
                    setShowTrackModal(true);
                  }}
                  className="admin-btn admin-btn--primary"
                >
                  {Icons.plus} Add Track
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Color/Icon</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Type</th>
                        <th>Total Lessons</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600 }}>{t.display_order}</td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: `${t.color}20`,
                              color: t.color,
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}>
                              {t.icon?.slice(0, 3)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.name}</td>
                          <td style={{ color: '#94a3b8' }}>{t.slug}</td>
                          <td>
                            {t.is_ai_generated ? (
                              <span style={{ color: '#a855f7', fontWeight: 600 }}>🤖 AI Generated</span>
                            ) : (
                              <span style={{ color: '#3b82f6' }}>Standard Curriculum</span>
                            )}
                          </td>
                          <td>{t.total_lessons || 0}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingTrack(t);
                                  setShowTrackModal(true);
                                }}
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrack(t.id)}
                                className="admin-btn admin-btn--danger admin-btn--sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: LESSON MANAGEMENT
              ========================================== */}
          {currentModule === 'lessons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-controls-row">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    className="admin-select"
                    value={selectedTrackFilter}
                    onChange={(e) => setSelectedTrackFilter(e.target.value)}
                  >
                    <option value="">-- All Tracks --</option>
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingLesson({
                      title: '',
                      slug: '',
                      track_id: selectedTrackFilter || (tracks.length > 0 ? tracks[0].id : ''),
                      display_order: undefined,
                      estimated_minutes: 10,
                      xp_reward: 50,
                      concept_title: '',
                      concept_content: '',
                      concept_highlights: [],
                      example_language: 'javascript',
                      example_code: '',
                      example_explanation: '',
                      practice_type: 'multiple-choice',
                      practice_instruction: '',
                      practice_template: '',
                      practice_answer: '',
                      summary: '',
                    });
                    setShowLessonModal(true);
                  }}
                  disabled={tracks.length === 0}
                  className="admin-btn admin-btn--primary"
                >
                  {Icons.plus} Add Lesson
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Track</th>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Time</th>
                        <th>XP Reward</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((l) => (
                        <tr key={l.id}>
                          <td style={{ color: '#94a3b8' }}>{l.track?.name || 'Unknown Track'}</td>
                          <td style={{ fontWeight: 600 }}>{l.display_order}</td>
                          <td style={{ fontWeight: 600 }}>{l.title}</td>
                          <td style={{ color: '#94a3b8' }}>{l.slug}</td>
                          <td>{l.estimated_minutes} min</td>
                          <td style={{ color: '#22c55e', fontWeight: 600 }}>{l.xp_reward} XP</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingLesson(l);
                                  setShowLessonModal(true);
                                }}
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(l.id)}
                                className="admin-btn admin-btn--danger admin-btn--sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: QUIZ MANAGEMENT
              ========================================== */}
          {currentModule === 'quizzes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-controls-row">
                <select
                  className="admin-select"
                  value={selectedLessonFilter}
                  onChange={(e) => setSelectedLessonFilter(e.target.value)}
                >
                  <option value="">-- All Lessons --</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingQuiz({
                      lesson_id: selectedLessonFilter || (lessons.length > 0 ? lessons[0].id : ''),
                      type: 'multiple-choice',
                      question: '',
                      optionsStr: '',
                      correct_index: 0,
                      template: '',
                      answer: '',
                      explanation: '',
                      xp_reward: 10,
                    });
                    setShowQuizModal(true);
                  }}
                  disabled={lessons.length === 0}
                  className="admin-btn admin-btn--primary"
                >
                  {Icons.plus} Add Quiz Question
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Lesson</th>
                        <th>Type</th>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Correct Option</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.map((c) => (
                        <tr key={c.id}>
                          <td style={{ color: '#94a3b8' }}>{c.lesson?.title || 'Unknown Lesson'}</td>
                          <td style={{ fontWeight: 600 }}>{c.type}</td>
                          <td style={{ fontWeight: 500 }}>{c.question}</td>
                          <td>{(c.options || []).length} items</td>
                          <td style={{ color: '#22c55e', fontWeight: 600 }}>
                            {c.options && c.options[c.correct_index] ? c.options[c.correct_index] : `Index ${c.correct_index}`}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingQuiz({
                                    ...c,
                                    optionsStr: (c.options || []).join('\n'),
                                  });
                                  setShowQuizModal(true);
                                }}
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(c.id)}
                                className="admin-btn admin-btn--danger admin-btn--sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: AI BLUEPRINT MANAGEMENT
              ========================================== */}
          {currentModule === 'ai' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                Review and manage AI-generated pathways. You can prune generated pathways, revise details, or delete blueprints to save server capacity.
              </p>
              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Blueprint Name</th>
                        <th>Slug</th>
                        <th>Display Order</th>
                        <th>Estimated Lessons</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.filter(t => t.is_ai_generated).map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600, color: '#a855f7' }}>🤖 {t.name}</td>
                          <td style={{ color: '#94a3b8' }}>{t.slug}</td>
                          <td>{t.display_order}</td>
                          <td>{t.total_lessons}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setEditingTrack(t);
                                  setShowTrackModal(true);
                                }}
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTrack(t.id)}
                                className="admin-btn admin-btn--danger admin-btn--sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tracks.filter(t => t.is_ai_generated).length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>
                            No AI-generated blueprints found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: ACHIEVEMENTS RULES
              ========================================== */}
          {currentModule === 'achievements' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                View reward milestones and XP achievements definitions. These are handled programmatically by the progression engine.
              </p>
              <div className="admin-card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3 style={{ marginBottom: '12px' }}>Standard Badges</h3>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <li><strong>Milestones</strong>: lesson-1, lesson-10, lesson-25, lesson-50, lesson-100</li>
                      <li><strong>XP</strong>: xp-100, xp-500, xp-1000, xp-5000, xp-10000, xp-25000</li>
                      <li><strong>Streaks</strong>: streak-3, streak-7, streak-14, streak-30, streak-60, streak-100</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '12px' }}>Rare Badges</h3>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <li><strong>Night Owl</strong>: Learn between midnight and 4:00 AM</li>
                      <li><strong>Early Bird</strong>: Learn between 5:00 AM and 8:00 AM</li>
                      <li><strong>Weekend Warrior</strong>: Study on Saturdays and Sundays</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: ANALYTICS
              ========================================== */}
          {currentModule === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-columns">
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">Signups Over Last 7 Days</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '10px 0' }}>
                    {dailyStats.map((stat, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{stat.signups}</span>
                        <div style={{
                          width: '24px',
                          height: `${Math.max(10, stat.signups * 25)}px`,
                          maxHeight: '150px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '4px 4px 0 0'
                        }} />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>{stat.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">XP Distributed (Daily Activity)</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '10px 0' }}>
                    {dailyStats.map((stat, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{stat.xpEarned} XP</span>
                        <div style={{
                          width: '24px',
                          height: `${Math.max(10, Math.min(150, stat.xpEarned / 10))}px`,
                          backgroundColor: '#a855f7',
                          borderRadius: '4px 4px 0 0'
                        }} />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>{stat.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: REPORTS EXPORT
              ========================================== */}
          {currentModule === 'reports' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                Download system databases and analytics metrics directly in JSON file formats.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem' }}>User Profiles Dataset</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Exports all student profile statistics, XP rankings, and credentials data.</p>
                  <button onClick={() => handleExportData('users')} className="admin-btn admin-btn--primary">
                    Export JSON Report
                  </button>
                </div>

                <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem' }}>Curriculum Tracks Dataset</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Exports curriculum settings, displays orders, colors, and project keys.</p>
                  <button onClick={() => handleExportData('tracks')} className="admin-btn admin-btn--primary">
                    Export JSON Report
                  </button>
                </div>

                <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem' }}>Platform Config Dataset</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Exports global variables, AI paths enabled state, and features state.</p>
                  <button onClick={() => handleExportData('settings')} className="admin-btn admin-btn--primary">
                    Export JSON Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==========================================
              MODULE: ANNOUNCEMENTS
              ========================================== */}
          {currentModule === 'announcements' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-controls-row">
                <span />
                <button
                  onClick={() => {
                    setNewAnnounce({ title: '', content: '', type: 'info', is_active: true });
                    setShowAnnounceModal(true);
                  }}
                  className="admin-btn admin-btn--primary"
                >
                  {Icons.plus} Publish Announcement
                </button>
              </div>

              {announcements.map((a) => (
                <div key={a.id} className="admin-card" style={{ borderLeft: `4px solid ${
                  a.type === 'warning' ? '#F59E0B' : a.type === 'danger' ? '#EF4444' : a.type === 'success' ? '#22C55E' : '#3B82F6'
                }` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{a.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="admin-btn admin-btn--danger admin-btn--sm"
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#f8fafc' }}>
                    {a.content}
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="admin-card" style={{ textAlign: 'center', color: '#94a3b8' }}>
                  No announcements published.
                </div>
              )}
            </motion.div>
          )}

          {/* ==========================================
              MODULE: SYSTEM SETTINGS
              ========================================== */}
          {currentModule === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-card">
                <div className="admin-card__header">
                  <h2 className="admin-card__title">Platform Feature Controls</h2>
                </div>
                <div className="setting-item-row">
                  <div className="setting-item-row__info">
                    <span className="setting-item-row__title">AI Learning Path Generation</span>
                    <span className="setting-item-row__desc">Allows student accounts to request AI-generated pathways from blueprints.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!settings.ai_generation_enabled}
                      onChange={() => handleToggleSetting('ai_generation_enabled', settings.ai_generation_enabled)}
                    />
                    <span className="admin-switch__slider" />
                  </label>
                </div>

                <div className="setting-item-row">
                  <div className="setting-item-row__info">
                    <span className="setting-item-row__title">Open User Registration</span>
                    <span className="setting-item-row__desc">Controls if new student accounts can sign up directly. Toggling off closes registrations.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!settings.registration_open}
                      onChange={() => handleToggleSetting('registration_open', settings.registration_open)}
                    />
                    <span className="admin-switch__slider" />
                  </label>
                </div>

                <div className="setting-item-row">
                  <div className="setting-item-row__info">
                    <span className="setting-item-row__title">Maintenance Mode</span>
                    <span className="setting-item-row__desc">Locks platform access for students with a maintenance screen. Only Admins/Owners remain active.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!settings.maintenance_mode}
                      onChange={() => handleToggleSetting('maintenance_mode', settings.maintenance_mode)}
                    />
                    <span className="admin-switch__slider" />
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* ==========================================
          MODALS SECTION
          ========================================== */}
      {/* 1. Edit User Modal */}
      {showUserModal && editingUser && (
        <div className="admin-modal-backdrop" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Modify Student Profile</h3>
              <button className="admin-modal__close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="admin-modal__body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Platform Role</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={editingUser.role || 'student'}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Suspension Status</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={editingUser.is_suspended ? 'true' : 'false'}
                      onChange={(e) => setEditingUser({ ...editingUser, is_suspended: e.target.value === 'true' })}
                    >
                      <option value="false">Active (Access Allowed)</option>
                      <option value="true">Suspended (Access Revoked)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Track Modal */}
      {showTrackModal && editingTrack && (
        <div className="admin-modal-backdrop" onClick={() => setShowTrackModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingTrack.id ? 'Modify Learning Track' : 'Create New Track'}
              </h3>
              <button className="admin-modal__close" onClick={() => setShowTrackModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveTrack}>
              <div className="admin-modal__body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Track Name</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={editingTrack.name || ''}
                    onChange={(e) => setEditingTrack({ ...editingTrack, name: e.target.value })}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug (URL Key)</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={editingTrack.slug || ''}
                      onChange={(e) => setEditingTrack({ ...editingTrack, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={editingTrack.display_order ?? ''}
                      onChange={(e) => setEditingTrack({ ...editingTrack, display_order: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Color Theme (Hex)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingTrack.color || '#3B82F6'}
                      onChange={(e) => setEditingTrack({ ...editingTrack, color: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Icon Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingTrack.icon || 'polygon'}
                      onChange={(e) => setEditingTrack({ ...editingTrack, icon: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    value={editingTrack.description || ''}
                    onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowTrackModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lesson Modal */}
      {showLessonModal && editingLesson && (
        <div className="admin-modal-backdrop" onClick={() => setShowLessonModal(false)}>
          <div className="admin-modal admin-modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingLesson.id ? 'Modify Lesson Details' : 'Create New Lesson'}
              </h3>
              <button className="admin-modal__close" onClick={() => setShowLessonModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveLesson}>
              <div className="admin-modal__body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Parent Track</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={editingLesson.track_id || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, track_id: e.target.value })}
                    >
                      {tracks.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Lesson Title</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={editingLesson.title || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug (URL Key)</label>
                    <input
                      type="text"
                      required
                      className="admin-form-input"
                      value={editingLesson.slug || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={editingLesson.display_order ?? ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, display_order: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Estimated Minutes</label>
                    <input
                      type="number"
                      required
                      className="admin-form-input"
                      value={editingLesson.estimated_minutes || 10}
                      onChange={(e) => setEditingLesson({ ...editingLesson, estimated_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">XP Reward</label>
                    <input
                      type="number"
                      required
                      className="admin-form-input"
                      value={editingLesson.xp_reward || 50}
                      onChange={(e) => setEditingLesson({ ...editingLesson, xp_reward: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <h4 style={{ borderBottom: '1px solid #334155', paddingBottom: '6px', margin: '20px 0 12px 0' }}>Concept Details</h4>
                <div className="admin-form-group">
                  <label className="admin-form-label">Concept Header</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingLesson.concept_title || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, concept_title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Concept Content (Markdown/HTML supported)</label>
                  <textarea
                    rows={4}
                    className="admin-form-textarea"
                    value={editingLesson.concept_content || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, concept_content: e.target.value })}
                  />
                </div>

                <h4 style={{ borderBottom: '1px solid #334155', paddingBottom: '6px', margin: '20px 0 12px 0' }}>Example Playground</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Language</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="javascript, python, sql..."
                      value={editingLesson.example_language || 'javascript'}
                      onChange={(e) => setEditingLesson({ ...editingLesson, example_language: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Playground Code</label>
                    <textarea
                      rows={3}
                      className="admin-form-textarea"
                      value={editingLesson.example_code || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, example_code: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ borderBottom: '1px solid #334155', paddingBottom: '6px', margin: '20px 0 12px 0' }}>Practice Assignment</h4>
                <div className="admin-form-group">
                  <label className="admin-form-label">Practice Instruction</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingLesson.practice_instruction || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, practice_instruction: e.target.value })}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Template Code</label>
                    <textarea
                      rows={2}
                      className="admin-form-textarea"
                      value={editingLesson.practice_template || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, practice_template: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Expected Answer Key</label>
                    <textarea
                      rows={2}
                      className="admin-form-textarea"
                      value={editingLesson.practice_answer || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, practice_answer: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowLessonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Quiz Challenge Modal */}
      {showQuizModal && editingQuiz && (
        <div className="admin-modal-backdrop" onClick={() => setShowQuizModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">
                {editingQuiz.id ? 'Modify Quiz Question' : 'Create Quiz Question'}
              </h3>
              <button className="admin-modal__close" onClick={() => setShowQuizModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveQuiz}>
              <div className="admin-modal__body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Parent Lesson</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={editingQuiz.lesson_id || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, lesson_id: e.target.value })}
                  >
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Question Text</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={editingQuiz.question || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, question: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Multiple-choice Options (one option per line)</label>
                  <textarea
                    rows={4}
                    required
                    className="admin-form-textarea"
                    placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                    value={editingQuiz.optionsStr || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, optionsStr: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Correct Option Index (0-based)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="admin-form-input"
                      value={editingQuiz.correct_index}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, correct_index: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">XP Reward</label>
                    <input
                      type="number"
                      required
                      className="admin-form-input"
                      value={editingQuiz.xp_reward || 10}
                      onChange={(e) => setEditingQuiz({ ...editingQuiz, xp_reward: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Explanation</label>
                  <textarea
                    rows={2}
                    className="admin-form-textarea"
                    value={editingQuiz.explanation || ''}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, explanation: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowQuizModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Save Quiz Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Announcement Modal */}
      {showAnnounceModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAnnounceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Create Banner Announcement</h3>
              <button className="admin-modal__close" onClick={() => setShowAnnounceModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="admin-modal__body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title</label>
                  <input
                    type="text"
                    required
                    className="admin-form-input"
                    value={newAnnounce.title}
                    onChange={(e) => setNewAnnounce({ ...newAnnounce, title: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Style / Type</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={newAnnounce.type}
                    onChange={(e) => setNewAnnounce({ ...newAnnounce, type: e.target.value })}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="danger">Danger (Red)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Content Content</label>
                  <textarea
                    rows={4}
                    required
                    className="admin-form-textarea"
                    placeholder="Enter the banner text shown to students..."
                    value={newAnnounce.content}
                    onChange={(e) => setNewAnnounce({ ...newAnnounce, content: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowAnnounceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
