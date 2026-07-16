import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
}

interface PageHeroProps {
  /** Lucide icon element, e.g. <Trophy size={22} /> */
  icon: React.ReactNode;
  /** Accent colour — controls glow, icon bg, eyebrow text */
  color?: 'blue' | 'amber' | 'green' | 'violet' | 'rose';
  /** Small uppercase category label shown above title */
  eyebrow?: string;
  /** Primary page title */
  title: string;
  /** Short description beneath the title */
  description: string;
  /** Up to ~4 quick stat pills shown inline */
  stats?: StatItem[];
  /** Optional right-side content (e.g. a CTA button or coin balance) */
  actions?: React.ReactNode;
}

export default function PageHero({
  icon,
  color = 'blue',
  eyebrow,
  title,
  description,
  stats,
  actions,
}: PageHeroProps) {
  return (
    <div className={`page-hero page-hero--${color}`}>
      {/* Feature icon badge */}
      <div className="page-hero__icon">{icon}</div>

      {/* Text block */}
      <div className="page-hero__body">
        {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__desc">{description}</p>

        {stats && stats.length > 0 && (
          <div className="page-hero__stats">
            {stats.map((s, i) => (
              <div key={i} className="page-hero__stat">
                <span className="page-hero__stat-value">{s.value}</span>
                <span className="page-hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional right-side slot */}
      {actions && <div className="page-hero__actions">{actions}</div>}
    </div>
  );
}
