import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePathSelection } from '../../context/PathSelectionContext';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/tracks', label: 'Tracks', icon: 'tracks' },
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
};

export default function Header() {
  const { user, logout } = useAuth();
  const { openOverlay } = usePathSelection();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isLanding = !user && location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${isLanding ? 'header--landing' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          {Icons.logo}
          <span className="header__logo-text">Learn Station</span>
        </Link>

        {user ? (
          <>
            <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                >
                  {Icons[link.icon]}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="header__actions">
              <button
                onClick={openOverlay}
                className="header__generate-btn"
              >
                Generate Path ✦
              </button>
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
              <button onClick={handleLogout} className="header__logout-btn">
                Log out
              </button>
            </div>

            <button
              className={`header__hamburger ${mobileOpen ? 'header__hamburger--open' : ''}`}
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
