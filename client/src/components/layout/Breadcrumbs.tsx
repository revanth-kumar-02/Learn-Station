import { Link, useLocation } from 'react-router-dom';

// ─── Route → Breadcrumb Trail Map ────────────────────────────────────────────
interface Crumb {
  label: string;
  path?: string; // undefined = current page (not clickable)
}

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const HomeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Static route map — dynamic segments handled below
const STATIC_TRAILS: Record<string, Crumb[]> = {
  '/tracks':      [{ label: 'Learning', path: '/tracks' }, { label: 'Tracks' }],
  '/practice':    [{ label: 'Learning', path: '/tracks' }, { label: 'Practice Hub' }],
  '/analytics':   [{ label: 'Learning', path: '/tracks' }, { label: 'Analytics' }],
  '/community':   [{ label: 'Community', path: '/community' }, { label: 'Community Hub' }],
  '/leaderboard': [{ label: 'Community', path: '/community' }, { label: 'Leaderboard' }],
  '/career':      [{ label: 'Career', path: '/career' }, { label: 'Career Hub' }],
  '/ai-mentor':   [{ label: 'Career', path: '/career' }, { label: 'AI Mentor Hub' }],
  '/rewards':     [{ label: 'More', path: '/rewards' }, { label: 'Rewards & Shop' }],
  '/downloads':   [{ label: 'More', path: '/downloads' }, { label: 'Download Center' }],
  '/profile':     [{ label: 'Profile' }],
  '/notifications': [{ label: 'Notifications' }],
  '/settings':    [{ label: 'Settings' }],
  '/generate':    [{ label: 'Learning', path: '/tracks' }, { label: 'Generate Path' }],
};

// Pages where breadcrumbs should NOT be shown
const HIDDEN_PATHS = ['/', '/login', '/register', '/admin'];

export default function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Hide on landing page, auth pages, admin routes
  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith('/admin'))) {
    return null;
  }

  // Resolve the trail
  let trail: Crumb[] = [];

  if (STATIC_TRAILS[pathname]) {
    trail = STATIC_TRAILS[pathname];
  } else if (pathname.startsWith('/track/')) {
    const slug = pathname.replace('/track/', '');
    trail = [
      { label: 'Learning', path: '/tracks' },
      { label: 'Tracks', path: '/tracks' },
      { label: slug.replace(/-/g, ' '), },
    ];
  } else if (pathname.startsWith('/lesson/')) {
    const slug = pathname.replace('/lesson/', '');
    trail = [
      { label: 'Learning', path: '/tracks' },
      { label: 'Tracks', path: '/tracks' },
      { label: slug.replace(/-/g, ' ') },
    ];
  } else if (pathname.startsWith('/ai-workspace/')) {
    trail = [
      { label: 'Learning', path: '/tracks' },
      { label: 'AI Workspace' },
    ];
  } else if (pathname.startsWith('/certificate/')) {
    trail = [{ label: 'Certificate' }];
  } else {
    // Unknown route — just show nothing extra
    return null;
  }

  return (
    <div className="breadcrumb-bar">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">

          {/* Home root */}
          <Link to="/" className="breadcrumb__item" aria-label="Home">
            <HomeIcon />
            <span>Home</span>
          </Link>

          {trail.map((crumb, idx) => {
            const isLast = idx === trail.length - 1;
            return (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="breadcrumb__sep" aria-hidden="true">
                  <ChevronRight />
                </span>
                {isLast || !crumb.path ? (
                  <span className={`breadcrumb__item breadcrumb__item--current`} aria-current={isLast ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.path} className="breadcrumb__item">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
