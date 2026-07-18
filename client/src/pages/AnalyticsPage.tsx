import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PageTransition from '../components/layout/PageTransition';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

interface DailyActivityAreaChartProps {
  data: Array<{ date: string; xp: number }>;
  color: string;
}

function DailyActivityAreaChart({ data, color }: DailyActivityAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxXP = Math.max(...data.map((d) => d.xp), 0);
  const padding = maxXP > 0 ? Math.ceil(maxXP * 0.2) : 20;
  const maxY = Math.max(maxXP + padding, 50);

  // Generate points coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.xp / maxY) * chartHeight;
    return { x, y };
  });

  // Calculate SVG line and area path commands (smooth curve)
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      // Cubic bezier control points for a smooth transition
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Y-axis grid values (4 lines)
  const yTicks = [0, maxY * 0.33, maxY * 0.67, maxY];

  // X-axis label indexes (show every 5th label: 0, 5, 10, 15, 20, 25, and the last one)
  const showLabelAtIndex = (idx: number) => {
    return idx % 5 === 0 || idx === data.length - 1;
  };

  return (
    <div className="analytics-chart-wrapper" style={{ position: 'relative', width: '100%', minHeight: '200px' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines (Horizontal) */}
        {yTicks.map((val, idx) => {
          const y = paddingTop + chartHeight - (val / maxY) * chartHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 3}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
                fontFamily="inherit"
              >
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* X-axis Line */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255, 255, 255, 0.15)"
        />

        {/* X-axis Labels */}
        {data.map((day, i) => {
          if (!showLabelAtIndex(i)) return null;
          const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
          const dateObj = new Date(day.date);
          const labelText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="middle"
              fontFamily="inherit"
            >
              {labelText}
            </text>
          );
        })}

        {/* Area Path */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#chart-area-grad)"
          />
        )}

        {/* Line Path */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Interactive Indicator (Vertical dotted line and circle) */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <g>
            <line
              x1={points[hoveredIdx].x}
              y1={paddingTop}
              x2={points[hoveredIdx].x}
              y2={paddingTop + chartHeight}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeDasharray="2 2"
            />
            <circle
              cx={points[hoveredIdx].x}
              cy={points[hoveredIdx].y}
              r="6"
              fill={color}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <circle
              cx={points[hoveredIdx].x}
              cy={points[hoveredIdx].y}
              r="12"
              fill={color}
              fillOpacity="0.15"
            />
          </g>
        )}

        {/* Invisible Hover Zones */}
        {points.map((p, i) => {
          const zoneWidth = chartWidth / (points.length - 1);
          const x = p.x - zoneWidth / 2;
          return (
            <rect
              key={i}
              x={x}
              y={paddingTop}
              width={zoneWidth}
              height={chartHeight}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="analytics-chart-tooltip"
          style={{
            position: 'absolute',
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
            transform: 'translate(-50%, -125%)',
            pointerEvents: 'none',
            backgroundColor: '#1e293b',
            border: `1px solid ${color}44`,
            borderRadius: '6px',
            padding: '8px 12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 10px rgba(99, 102, 241, 0.1)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
            {new Date(data[hoveredIdx].date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color }}>✦</span> {data[hoveredIdx].xp} XP
          </div>
        </div>
      )}
    </div>
  );
}

interface ActivityHeatmapProps {
  activity: Array<{ date: string; xp: number }>;
}

function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; xp: number; x: number; y: number } | null>(null);

  // Heatmap Data Generation (Last 365 Days)
  const heatmapData: Array<{ date: string; xp: number }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const match = activity.find((a: any) => a.date === dateStr);
    heatmapData.push({
      date: dateStr,
      xp: match ? match.xp : 0
    });
  }

  // Weekday layout calculations (padding start)
  const firstDate = new Date(heatmapData[0].date + 'T00:00:00');
  const firstDay = firstDate.getDay(); // 0 = Sunday, 1 = Monday...
  const daysToSubtract = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0, ..., Sun = 6

  // Generate heatmap cells (including placeholders at start)
  const heatmapCells: React.ReactNode[] = [];
  
  // Add placeholder cells for the first week to align weekdays
  for (let p = 0; p < daysToSubtract; p++) {
    heatmapCells.push(
      <div 
        key={`placeholder-${p}`} 
        className="analytics-heatmap__cell analytics-heatmap__cell--placeholder" 
        style={{ opacity: 0, pointerEvents: 'none' }} 
      />
    );
  }

  // Add actual activity cells
  heatmapData.forEach((day) => {
    // Intensity mapping:
    // 0 XP -> 0
    // 1-25 XP -> 1
    // 26-50 XP -> 2
    // 51-100 XP -> 3
    // 100+ XP -> 4
    const intensity = day.xp === 0 ? 0 : day.xp <= 25 ? 1 : day.xp <= 50 ? 2 : day.xp <= 100 ? 3 : 4;
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const wrapperEl = e.currentTarget.closest('.analytics-heatmap-wrapper');
      if (wrapperEl) {
        const parentRect = wrapperEl.getBoundingClientRect();
        setHoveredCell({
          date: day.date,
          xp: day.xp,
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top
        });
      }
    };

    heatmapCells.push(
      <div
        key={day.date}
        className={`analytics-heatmap__cell analytics-heatmap__cell--${intensity}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHoveredCell(null)}
        style={{ cursor: 'pointer' }}
      />
    );
  });

  // Chunk cells (including placeholders) into columns of 7 for month labels
  const columns: Array<Array<{ date: string; xp: number } | null>> = [];
  let currentWeek: Array<{ date: string; xp: number } | null> = [];

  // Pad first week in columns representation
  for (let p = 0; p < daysToSubtract; p++) {
    currentWeek.push(null);
  }

  heatmapData.forEach((day) => {
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
  const monthLabels: Array<{ weekIdx: number; label: string }> = [];
  columns.forEach((week, weekIdx) => {
    const firstDay = week.find(d => d !== null);
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

  // Calculate grid description/dimensions for debugging
  const heatmapGrid = {
    rows: 7,
    columns: Math.ceil((daysToSubtract + heatmapData.length) / 7),
    totalCellsCount: daysToSubtract + heatmapData.length,
    startDayOfWeek: firstDay,
    paddingCellsCount: daysToSubtract
  };

  // Perform debug console logging before rendering
  console.log('📊 [Heatmap Debug Log]', {
    heatmapData,
    heatmapGrid,
    heatmapCells
  });

  return (
    <div className="analytics-heatmap-wrapper" style={{ position: 'relative' }}>
      <div className="analytics-heatmap-container">
        <div className="analytics-heatmap-weekdays" style={{ marginTop: '18px' }}>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>
        <div className="analytics-heatmap-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Month Labels */}
          <div className="analytics-heatmap-months" style={{ position: 'relative', height: '14px', userSelect: 'none' }}>
            {monthLabels.map((lbl, idx) => (
              <span
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${lbl.weekIdx * 18}px`, // 14px cell + 4px gap = 18px
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {lbl.label}
              </span>
            ))}
          </div>
          {/* Heatmap Grid */}
          <div className="analytics-heatmap-grid">
            {heatmapCells}
          </div>
        </div>
      </div>

      {/* Heatmap Tooltip */}
      {hoveredCell && (
        <div
          className="analytics-heatmap-tooltip"
          style={{
            position: 'absolute',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: 'translate(-50%, -125%)',
            pointerEvents: 'none',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '6px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
            whiteSpace: 'nowrap',
            fontSize: '11px',
            color: '#f8fafc',
            textAlign: 'center'
          }}
        >
          <div style={{ fontWeight: 600, color: '#94a3b8' }}>
            {new Date(hoveredCell.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div style={{ fontWeight: 700, marginTop: '2px', color: '#6366f1' }}>
            {hoveredCell.xp} XP earned
          </div>
        </div>
      )}
    </div>
  );
}


interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="analytics-stat-card"
      style={{ '--stat-color': color } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="analytics-stat-card__icon">{icon}</div>
      <div className="analytics-stat-card__value">{value}</div>
      <div className="analytics-stat-card__label">{label}</div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const actData = await userService.getActivity();
        setActivity(actData.activity || []);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Slice last 30 days for metrics and chart visualizer
  const dailyXpActivity = activity.slice(-30);
  const totalXpLast30 = dailyXpActivity.reduce((sum, d) => sum + d.xp, 0);
  const activeDays = dailyXpActivity.filter((d) => d.xp > 0).length;
  const bestDay = dailyXpActivity.reduce((best, d) => (d.xp > best.xp ? d : best), { xp: 0, date: '' });
  const avgXpPerActiveDay = activeDays > 0 ? Math.round(totalXpLast30 / activeDays) : 0;

  // Debugging requirement variables mapping
  const analyticsData = activity;
  const chartSeries = dailyXpActivity.map(d => ({ date: d.date, xp: d.xp }));

  // Debug logging trigger
  useEffect(() => {
    if (activity.length > 0) {
      console.log('📊 [Analytics Debug Log]', {
        analyticsData,
        dailyXpActivity,
        chartSeries
      });
    }
  }, [activity, analyticsData, dailyXpActivity, chartSeries]);

  // Weekly breakdown (last 28 days of activity)
  const weeklyData = [];
  const last28Days = activity.slice(-28);
  for (let w = 0; w < 4; w++) {
    const week = last28Days.slice(w * 7, w * 7 + 7);
    const xp = week.reduce((s, d) => s + d.xp, 0);
    const startDate = week[0]?.date ? new Date(week[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    weeklyData.push({ label: `Week ${w + 1}`, startDate, xp });
  }

  const maxWeeklyXp = Math.max(...weeklyData.map((w) => w.xp), 1);

  const isChartEmpty = dailyXpActivity.length === 0 || dailyXpActivity.every((d) => d.xp === 0);

  return (
    <PageTransition>
      <div className="analytics-page animate-fade-in">
        <PageHeader 
          title="Learning Analytics"
          description="Track your learning patterns, consistency, and XP growth over time."
          icon="📊"
        />

        <div className="container" style={{ marginTop: '0px' }}>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="analytics-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="analytics-stats">
                <StatCard icon="⚡" label="XP (Last 30 Days)" value={totalXpLast30.toLocaleString()} color="#6366f1" delay={0} />
                <StatCard icon="📅" label="Active Days" value={`${activeDays}/30`} color="#10b981" delay={0.05} />
                <StatCard icon="🔥" label="Current Streak" value={`${user?.streak || 0} days`} color="#f59e0b" delay={0.1} />
                <StatCard icon="🏆" label="Best Day XP" value={`${bestDay.xp} XP`} color="#8b5cf6" delay={0.15} />
                <StatCard icon="📈" label="Avg XP / Active Day" value={avgXpPerActiveDay} color="#06b6d4" delay={0.2} />
                <StatCard icon="💎" label="Total XP" value={(user?.xp || 0).toLocaleString()} color="#ec4899" delay={0.25} />
              </div>

              {/* Daily XP Activity Chart */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="analytics-section__title">Daily XP Activity (Last 30 Days)</h2>
                <div className="analytics-chart-container">
                  {isChartEmpty ? (
                    <div className="analytics-empty-state">
                      <div className="analytics-empty-state__icon">📈</div>
                      <h3 className="analytics-empty-state__title">No learning activity recorded yet</h3>
                      <p className="analytics-empty-state__desc">
                        Complete lessons or solve quiz challenges to start building your analytics.
                      </p>
                      <Link to="/tracks" className="btn btn--primary btn--md" style={{ textDecoration: 'none' }}>
                        Start Learning
                      </Link>
                    </div>
                  ) : (
                    <DailyActivityAreaChart data={dailyXpActivity} color="#6366f1" />
                  )}
                </div>
                {!isChartEmpty && (
                  <div className="analytics-chart-legend">
                    <span className="analytics-chart-legend__dot" style={{ background: '#6366f1' }} />
                    <span>XP Earned</span>
                  </div>
                )}
              </motion.section>

              {/* Weekly Breakdown */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="analytics-section__title">Weekly Breakdown</h2>
                <div className="analytics-weekly">
                  {weeklyData.map((week, i) => (
                    <div key={i} className="analytics-weekly__item">
                      <div className="analytics-weekly__bar-wrap">
                        <div
                          className="analytics-weekly__bar"
                          style={{
                            height: `${Math.max((week.xp / maxWeeklyXp) * 180, week.xp > 0 ? 8 : 0)}px`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                      <div className="analytics-weekly__label">{week.label}</div>
                      <div className="analytics-weekly__xp">{week.xp} XP</div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Heatmap Calendar */}
              <motion.section
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="analytics-section__title">Activity Heatmap (Last 365 Days)</h2>
                <ActivityHeatmap activity={activity} />
                <div className="analytics-heatmap-legend" style={{ marginTop: '16px' }}>
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`analytics-heatmap__cell analytics-heatmap__cell--${level}`} />
                  ))}
                  <span>More</span>
                </div>
              </motion.section>

              {/* Level Progress */}
              {user && (
                <motion.section
                  className="analytics-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <h2 className="analytics-section__title">Level Progress</h2>
                  <div className="analytics-level-card">
                    <div className="analytics-level-badge">Lv.{user.level || 1}</div>
                    <div className="analytics-level-info">
                      <div className="analytics-level-info__header">
                        <span>Level {user.level || 1}</span>
                        <span>{(user.xp || 0).toLocaleString()} XP Total</span>
                      </div>
                      <div className="analytics-level-bar">
                        <div
                          className="analytics-level-bar__fill"
                          style={{ width: `${Math.min(((user.xp || 0) % 500) / 5, 100)}%` }}
                        />
                      </div>
                      <p className="analytics-level-info__next">
                        Keep earning XP to reach Level {(user.level || 1) + 1}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
