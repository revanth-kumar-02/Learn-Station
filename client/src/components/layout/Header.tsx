import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePathSelection } from '../../context/PathSelectionContext';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/tracks', label: 'Tracks', icon: 'tracks' },
  { path: '/practice', label: 'Practice Hub', icon: 'practice' },
  { path: '/rewards', label: 'Rewards & Shop', icon: 'rewards' },
  { path: '/ai-mentor', label: 'AI Mentor Hub', icon: 'ai' },
  { path: '/community', label: 'Community', icon: 'community' },
  { path: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/profile', label: 'Profile', icon: 'profile' },
];

const Icons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  tracks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  practice: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="m15 5 3 3" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logo: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  leaderboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <polyline points="22 12 18 8 13 13 8 10 2 14" />
    </svg>
  ),
  rewards: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  community: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="17" x2="9" y2="8" />
      <line x1="12" y1="17" x2="12" y2="10" />
      <line x1="15" y1="17" x2="15" y2="12" />
    </svg>
  ),
};

export default function Header() {
  const { user, logout, unreadCount } = useAuth();
  const { openOverlay } = usePathSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Notifications states
  const [notifOpen, setNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [bellAnimated, setBellAnimated] = useState(false);

  useEffect(() => {
    const handleNewNotification = () => {
      setBellAnimated(true);
      setTimeout(() => setBellAnimated(false), 1000);
    };

    window.addEventListener('new-notification-alert', handleNewNotification);
    return () => {
      window.removeEventListener('new-notification-alert', handleNewNotification);
    };
  }, []);

  const loadRecentNotifications = async () => {
    setDrawerLoading(true);
    try {
      const data = await notificationService.getAll('All', '', 5, 0);
      setRecentNotifs(data.notifications || []);
    } catch (err) {
      console.error('Failed to load recent notifications:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const toggleNotificationsDrawer = () => {
    const nextVal = !notifOpen;
    setNotifOpen(nextVal);
    if (nextVal) {
      loadRecentNotifications();
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAllRead();
      setRecentNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      try {
        await notificationService.markAsRead(n.id);
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    if (n.action_url) {
      navigate(n.action_url);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isLanding = !user && location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${isLanding ? 'header--landing' : ''}`}>
      <div className="header__inner">
        {/* Left: Logo & Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="header__logo">
            {Icons.logo}
            <span className="header__logo-text">Learn Station</span>
          </Link>
          
          {user && (
            <nav className="header__nav-desktop" style={{ marginLeft: '32px' }}>
              {NAV_LINKS.filter(link => link.path !== '/practice').map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`header__nav-link header__nav-link--${link.icon} ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                >
                  {(Icons as any)[link.icon]}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Center: Generate Path */}
        {user && (
          <div className="header__center-desktop">
            <button
              onClick={openOverlay}
              className="btn btn--primary btn--sm header__generate-btn"
              style={{
                background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-blue) 100%)',
                color: 'white',
                fontWeight: 600,
                border: 'none',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span className="header__generate-text">Generate Path</span>
              <span className="header__generate-icon">✦</span>
            </button>
          </div>
        )}

        {/* Right: Actions or Hamburger */}
        {user ? (
          <>
            <div className="header__actions-desktop">
              <div className="header__xp-badge">
                <span className="header__xp-icon">⚡</span>
                <span>{user.xp?.toLocaleString() || 0} XP</span>
                {user.level && (
                  <span className="header__level-badge">Lv.{user.level}</span>
                )}
              </div>
              <div className="header__streak">
                <span className="header__streak-fire">🔥</span>
                <span>{user.streak || 0}</span>
              </div>

              {/* Notification Bell */}
              <div className="header__notification-wrapper" style={{ position: 'relative', marginLeft: '12px' }}>
                <button
                  onClick={toggleNotificationsDrawer}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                  }}
                  className={`header__notification-bell ${bellAnimated ? 'bell-shake' : ''}`}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        backgroundColor: 'var(--accent-rose)',
                        color: 'white',
                        fontSize: '8px',
                        fontWeight: 700,
                        borderRadius: '50%',
                        width: '13px',
                        height: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--bg-secondary)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      className="notification-pulse"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown Drawer */}
                {notifOpen && (
                  <>
                    <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'transparent' }} />
                    <div 
                      className="header__dropdown"
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: 0,
                        width: '320px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '12px 0 0',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 999,
                        display: 'flex',
                        flexDirection: 'column',
                        backdropFilter: 'blur(16px)',
                      }}
                    >
                      {/* Drawer Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Recent Notifications</span>
                        {recentNotifs.length > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Drawer Content */}
                      <div style={{ maxHeight: '280px', overflowY: 'auto' }} className="no-scrollbar">
                        {drawerLoading ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                            Loading...
                          </div>
                        ) : recentNotifs.length === 0 ? (
                          <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>📭</span>
                            <span style={{ fontSize: '12px' }}>No notifications yet.</span>
                          </div>
                        ) : (
                          recentNotifs.map((n: any) => (
                            <div 
                              key={n.id} 
                              onClick={() => handleNotificationClick(n)}
                              style={{
                                padding: '10px 16px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                gap: '10px',
                                cursor: 'pointer',
                                backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                                transition: 'background 0.2s',
                                textAlign: 'left'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.03)'}
                            >
                              <span style={{ fontSize: '16px', flexShrink: 0 }}>{n.icon || '📢'}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '12px', fontWeight: n.is_read ? 500 : 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {n.title}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {n.message}
                                </span>
                              </div>
                              {!n.is_read && (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', alignSelf: 'center', flexShrink: 0 }} />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Drawer Footer */}
                      <Link 
                        to="/notifications" 
                        onClick={() => setNotifOpen(false)}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '10px',
                          borderTop: '1px solid var(--border)',
                          fontSize: '11px',
                          color: 'var(--accent-blue)',
                          textDecoration: 'none',
                          fontWeight: 500,
                          backgroundColor: 'var(--bg-primary)'
                        }}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </>
                )}
              </div>
              
              {/* User Avatar Dropdown */}
              <div className="header__avatar-wrapper" style={{ position: 'relative', marginLeft: '20px' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  aria-label="User Menu"
                >
                  <img 
                    src={user.avatarUrl || 'https://via.placeholder.com/30'} 
                    alt={user.name || 'User Avatar'} 
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--accent-blue)',
                      transition: 'transform var(--duration-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      onClick={() => setDropdownOpen(false)} 
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 998,
                        background: 'transparent'
                      }}
                    />
                    
                    <div 
                      className="header__dropdown"
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: 0,
                        width: '180px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '8px 0',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 999,
                        display: 'flex',
                        flexDirection: 'column',
                        backdropFilter: 'blur(16px)',
                      }}
                    >
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="header__dropdown-item"
                        style={{
                          padding: '10px 16px',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background var(--duration-fast) ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        👤 Profile
                      </Link>
                      
                      <Link 
                        to="/practice" 
                        onClick={() => setDropdownOpen(false)}
                        className="header__dropdown-item"
                        style={{
                          padding: '10px 16px',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background var(--duration-fast) ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🎯 Practice Hub
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => {
                          setDropdownOpen(false);
                        }}
                        className="header__dropdown-item"
                        style={{
                          padding: '10px 16px',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background var(--duration-fast) ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        ⚙️ Theme Settings
                      </Link>

                      {user.role === 'owner' && user.email === 'imposterz.rev02@gmail.com' && (
                        <Link 
                          to="/admin/dashboard" 
                          onClick={() => setDropdownOpen(false)}
                          className="header__dropdown-item"
                          style={{
                            padding: '10px 16px',
                            color: 'var(--accent-violet)',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderTop: '1px solid var(--border)',
                            borderBottom: '1px solid var(--border)',
                            margin: '4px 0',
                            transition: 'background var(--duration-fast) ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          👑 ★ OWNER PANEL
                        </Link>
                      )}

                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="header__dropdown-item"
                        style={{
                          padding: '10px 16px',
                          color: 'var(--accent-rose)',
                          background: 'none',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'background var(--duration-fast) ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <nav className={`header__nav-mobile ${mobileOpen ? 'header__nav-mobile--open' : ''}`}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                >
                  {(Icons as any)[link.icon]}
                  <span>{link.label}</span>
                </Link>
              ))}
              
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openOverlay();
                }}
                className="header__nav-link header__nav-btn"
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}
              >
                <span>Generate Path</span>
                <span className="header__nav-btn-icon">✦</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: '12px' }}>
                <div className="header__xp-badge" style={{ margin: 0 }}>
                  <span className="header__xp-icon">⚡</span>
                  <span>{user.xp?.toLocaleString() || 0} XP</span>
                  {user.level && (
                    <span className="header__level-badge" style={{ marginLeft: '6px' }}>Lv.{user.level}</span>
                  )}
                </div>
                <div className="header__streak" style={{ margin: 0 }}>
                  <span className="header__streak-fire">🔥</span>
                  <span>{user.streak || 0} Days</span>
                </div>
              </div>

              {user.role === 'owner' && user.email === 'imposterz.rev02@gmail.com' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="header__nav-link"
                  style={{ color: 'var(--accent-violet)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  👑 ★ OWNER PANEL
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="header__nav-link"
                style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🚪 Log out
              </button>
            </nav>

            {/* Hamburger Button (Mobile trigger) */}
            <button
              className={`header__hamburger-btn ${mobileOpen ? 'header__hamburger-btn--open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </>
        ) : (
          <div className="header__auth-actions">
            <Link to="/login" className="btn btn--ghost btn--sm">Log in</Link>
            <Link to="/register" className="btn btn--primary btn--sm">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
