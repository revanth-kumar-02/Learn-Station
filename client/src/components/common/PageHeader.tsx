import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface Crumb {
  label: string;
  path?: string;
}

interface StatItem {
  label: string;
  value: string | number;
}

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  categoryBadge?: string;
  eyebrow?: string;
  crumbs?: Crumb[];
  icon?: React.ReactNode;
  color?: 'blue' | 'amber' | 'green' | 'violet' | 'rose';
  stats?: StatItem[];
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
}

const ChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

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

export default function PageHeader({
  title,
  description,
  categoryBadge,
  eyebrow,
  crumbs,
  icon,
  color = 'blue',
  stats,
  tabs,
  actions
}: PageHeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Resolve crumbs if not provided
  let trail: Crumb[] = crumbs || [];
  if (!crumbs) {
    if (STATIC_TRAILS[pathname]) {
      trail = STATIC_TRAILS[pathname];
    } else if (pathname.startsWith('/track/')) {
      const slug = pathname.replace('/track/', '');
      trail = [
        { label: 'Learning', path: '/tracks' },
        { label: 'Tracks', path: '/tracks' },
        { label: slug.replace(/-/g, ' ') },
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
    }
  }

  return (
    <header className="page-header animate-fade-in">
      <div className="container">
        
        {/* Breadcrumb section */}
        {trail.length > 0 && (
          <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="page-header__breadcrumb-item" aria-label="Home">
              <HomeIcon />
              <span>Home</span>
            </Link>

            {trail.map((crumb, idx) => {
              const isLast = idx === trail.length - 1;
              return (
                <React.Fragment key={idx}>
                  <span className="page-header__breadcrumb-sep" aria-hidden="true">
                    <ChevronRight />
                  </span>
                  {isLast || !crumb.path ? (
                    <span className="page-header__breadcrumb-item page-header__breadcrumb-item--current">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.path} className="page-header__breadcrumb-item">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Title area */}
        <div className="page-header__main" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {icon && (
            <div className={`page-header__icon page-header__icon--${color}`} style={{ flexShrink: 0 }}>
              {icon}
            </div>
          )}
          <div className="page-header__title-container">
            {categoryBadge && (
              <span className="page-header__badge">{categoryBadge}</span>
            )}
            {eyebrow && (
              <span className="page-header__eyebrow">{eyebrow}</span>
            )}
            <h1 className="page-header__title">{title}</h1>
            {description && (
              <p className="page-header__description">{description}</p>
            )}

            {/* Stats block */}
            {stats && stats.length > 0 && (
              <div className="page-header__stats">
                {stats.map((s, i) => (
                  <div key={i} className="page-header__stat">
                    <span className="page-header__stat-value">{s.value}</span>
                    <span className="page-header__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {actions && (
            <div className="page-header__actions">
              {actions}
            </div>
          )}
        </div>

        {/* Optional Tabs */}
        {tabs && (
          <div className="page-header__tabs-container">
            {tabs}
          </div>
        )}
        
      </div>
    </header>
  );
}
