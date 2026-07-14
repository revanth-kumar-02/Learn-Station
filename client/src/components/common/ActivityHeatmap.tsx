import { useState } from 'react';
import { motion } from 'framer-motion';

interface ActivityDay {
  date: string;
  xp: number;
  lessonsCompleted: number;
  minutesLearned: number;
}

interface ActivityHeatmapProps {
  activity: ActivityDay[];
  streak?: number;
  longestStreak?: number;
  showSummary?: boolean;
}

export default function ActivityHeatmap({
  activity = [],
  streak = 0,
  longestStreak = 0,
  showSummary = true,
}: ActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    data: ActivityDay;
    x: number;
    y: number;
  } | null>(null);

  if (!activity || activity.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
        No learning activity recorded yet. Start a lesson to log your progress!
      </div>
    );
  }

  // --- Process Activity Heatmap ---
  const columns: (ActivityDay | null)[][] = [];
  let currentWeek: (ActivityDay | null)[] = [];

  // Align days of the week starting 364 days ago
  const firstDate = new Date(activity[0].date + 'T00:00:00');
  const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Pad first week with empty cells for days preceding our activity window
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  activity.forEach((day) => {
    if (currentWeek.length === 7) {
      columns.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    columns.push(currentWeek);
  }

  // Find month labels and their week column indices
  const monthLabels: { weekIdx: number; label: string }[] = [];
  columns.forEach((week, weekIdx) => {
    const firstDay = week.find((d) => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date + 'T00:00:00');
      // If first day is in the first 7 days of the month, place a label
      if (date.getDate() <= 7) {
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== monthName) {
          monthLabels.push({ weekIdx, label: monthName });
        }
      }
    }
  });

  // Summary Metrics
  const activeDaysCount = activity.filter((d) => d.xp > 0).length;
  const totalStudyMinutes = activity.reduce((sum, d) => sum + (d.minutesLearned || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="profile-activity" style={{ position: 'relative', width: '100%' }}>
      {showSummary && (
        <div className="heatmap-summary-panel">
          <div className="heatmap-summary-card">
            <span className="heatmap-summary-card__icon">🔥</span>
            <div className="heatmap-summary-card__content">
              <span className="heatmap-summary-card__value">{streak} Days</span>
              <span className="heatmap-summary-card__label">Current Streak</span>
            </div>
          </div>
          <div className="heatmap-summary-card">
            <span className="heatmap-summary-card__icon">🏆</span>
            <div className="heatmap-summary-card__content">
              <span className="heatmap-summary-card__value">{longestStreak} Days</span>
              <span className="heatmap-summary-card__label">Longest Streak</span>
            </div>
          </div>
          <div className="heatmap-summary-card">
            <span className="heatmap-summary-card__icon">📅</span>
            <div className="heatmap-summary-card__content">
              <span className="heatmap-summary-card__value">{activeDaysCount} Days</span>
              <span className="heatmap-summary-card__label">Active Days</span>
            </div>
          </div>
          <div className="heatmap-summary-card">
            <span className="heatmap-summary-card__icon">⏱️</span>
            <div className="heatmap-summary-card__content">
              <span className="heatmap-summary-card__value">{totalStudyHours} Hours</span>
              <span className="heatmap-summary-card__label">Study Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="heatmap-section-wrapper" style={{ overflowX: 'auto', position: 'relative' }}>
        <div className="heatmap-months-row" style={{ height: '20px', position: 'relative', marginBottom: '4px' }}>
          {monthLabels.map((lbl, idx) => (
            <span
              key={idx}
              className="heatmap-month-label"
              style={{
                position: 'absolute',
                left: `${lbl.weekIdx * 14 + 32}px`,
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              {lbl.label}
            </span>
          ))}
        </div>
        
        <div className="heatmap-grid-container" style={{ display: 'flex', gap: '8px' }}>
          <div className="heatmap-day-labels" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', paddingRight: '4px', height: '94px', width: '28px' }}>
            <span style={{ height: '10px' }} />
            <span style={{ height: '10px', lineHeight: '10px' }}>Mon</span>
            <span style={{ height: '10px' }} />
            <span style={{ height: '10px', lineHeight: '10px' }}>Wed</span>
            <span style={{ height: '10px' }} />
            <span style={{ height: '10px', lineHeight: '10px' }}>Fri</span>
            <span style={{ height: '10px' }} />
          </div>

          <div className="heatmap-weeks-columns" style={{ display: 'flex', gap: '3px' }}>
            {columns.map((week, wIdx) => (
              <div key={wIdx} className="heatmap-week-column" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day, dIdx) => {
                  if (day === null) {
                    return <div key={dIdx} className="heatmap-cell heatmap-cell--empty" style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--border-light)' }} />;
                  }

                  let level = 0;
                  if (day.xp > 0 && day.xp < 30) level = 1;
                  else if (day.xp >= 30 && day.xp < 60) level = 2;
                  else if (day.xp >= 60 && day.xp < 120) level = 3;
                  else if (day.xp >= 120) level = 4;

                  return (
                    <div
                      key={dIdx}
                      className={`heatmap-cell heatmap-cell--level-${level}`}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={(e) => {
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        const wrapper = e.currentTarget.closest('.heatmap-section-wrapper');
                        if (wrapper) {
                          const parentRect = wrapper.getBoundingClientRect();
                          setHoveredCell({
                            data: day,
                            x: cellRect.left - parentRect.left + cellRect.width / 2,
                            y: cellRect.top - parentRect.top - 6,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="heatmap-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <div className="heatmap-legend" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div className="heatmap-cell heatmap-cell--level-0" style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--border-light)' }} />
            <div className="heatmap-cell heatmap-cell--level-1" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-cell heatmap-cell--level-2" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-cell heatmap-cell--level-3" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-cell heatmap-cell--level-4" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <span>More</span>
          </div>
        </div>

        {/* Floating Tooltip inside parent coordinate space */}
        {hoveredCell && (
          <div
            className="heatmap-tooltip"
            style={{
              position: 'absolute',
              left: hoveredCell.x,
              top: hoveredCell.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 999,
              pointerEvents: 'none',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '11px',
              lineHeight: '1.4',
            }}
          >
            <div className="tooltip-date" style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px', marginBottom: '2px' }}>
              {new Date(hoveredCell.data.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="tooltip-xp" style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>+{hoveredCell.data.xp} XP</div>
            <div className="tooltip-detail">{hoveredCell.data.lessonsCompleted} {hoveredCell.data.lessonsCompleted === 1 ? 'Lesson' : 'Lessons'} Completed</div>
            <div className="tooltip-detail">{hoveredCell.data.minutesLearned} Min Learning</div>
          </div>
        )}
      </div>
    </div>
  );
}
