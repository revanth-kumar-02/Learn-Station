import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash, Search, Filter, Loader2, Sparkles, Trophy, Award, Flame, Inbox } from 'lucide-react';
import { notificationService, NotificationItem } from '../services/notificationService';
import PageTransition from '../components/layout/PageTransition';

const FILTERS = ['All', 'Learning', 'Achievement', 'XP', 'Level Up', 'Badge', 'Certificate', 'AI', 'Announcement', 'Admin', 'Leaderboard', 'Streak'];

const TYPE_ICONS: Record<string, any> = {
  Learning: <Inbox className="text-blue-500" size={18} />,
  Achievement: <Trophy className="text-amber-500" size={18} />,
  XP: <Sparkles className="text-yellow-500" size={18} />,
  'Level Up': <Trophy className="text-violet-500" size={18} />,
  Badge: <Award className="text-indigo-500" size={18} />,
  Certificate: <Award className="text-green-500" size={18} />,
  AI: <Sparkles className="text-purple-500" size={18} />,
  Announcement: <Bell className="text-teal-500" size={18} />,
  Admin: <Bell className="text-rose-500" size={18} />,
  Leaderboard: <Trophy className="text-orange-500" size={18} />,
  Streak: <Flame className="text-red-500" size={18} />
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  const fetchNotifications = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = reset ? 0 : offset;
      const data = await notificationService.getAll(
        activeFilter,
        searchQuery,
        limit,
        currentOffset
      );

      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      setHasMore(data.hasMore);
      setTotalCount(data.count);
      setOffset(currentOffset + limit);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, searchQuery, offset]);

  // Refetch when filter or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotifications(true);
    }, 250); // debounce search input

    return () => clearTimeout(delayDebounce);
  }, [activeFilter, searchQuery]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await notificationService.delete(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const res = await notificationService.deleteAll();
      if (res.success) {
        setNotifications([]);
        setTotalCount(0);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <PageTransition>
      <div className="notifications-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container container--narrow">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                Notification Center <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>({totalCount} total)</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                Keep track of your technical achievements, quiz answers, and learning updates.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleMarkAllRead} 
                className="btn btn--secondary btn--sm"
                disabled={notifications.every(n => n.is_read)}
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Check size={14} /> Mark all read
              </button>
              <button 
                onClick={handleDeleteAll} 
                className="btn btn--danger btn--sm"
                disabled={notifications.length === 0}
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Trash size={14} /> Clear all
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} size={18} />
              <input
                type="text"
                placeholder="Search title, message, contents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Filter pills scrollable */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', whiteSpace: 'nowrap' }} className="no-scrollbar">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: activeFilter === f ? 'var(--accent-blue)' : 'var(--border)',
                    backgroundColor: activeFilter === f ? 'var(--accent-blue-glow)' : 'transparent',
                    color: activeFilter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 className="animate-spin text-blue-500" style={{ margin: '0 auto' }} size={32} />
                <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No notifications yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '300px', margin: '8px auto 0' }}>
                  When you complete lessons, earn badges, or receive announcements, they'll show up here.
                </p>
              </div>
            ) : (
              <div>
                <AnimatePresence initial={false}>
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                        position: 'relative',
                        transition: 'background var(--duration-fast) ease'
                      }}
                    >
                      {/* Unread indicator bar */}
                      {!n.is_read && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          backgroundColor: 'var(--accent-blue)',
                          borderRadius: '2px 0 0 2px'
                        }} />
                      )}

                      {/* Icon */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {TYPE_ICONS[n.type] || <Inbox size={18} />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                          <span style={{ fontSize: '14px', fontWeight: n.is_read ? 500 : 600, color: 'var(--text-primary)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {formatTime(n.created_at)}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                          {n.message}
                        </p>

                        {/* Action Link */}
                        {n.action_url && (
                          <a
                            href={n.action_url}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--accent-blue)',
                              fontWeight: 500,
                              textDecoration: 'none',
                              marginTop: '8px'
                            }}
                          >
                            View details →
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '4px', alignSelf: 'center' }}>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            title="Mark as read"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '6px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          title="Delete notification"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '6px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: 'var(--accent-rose)'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More Button */}
                {hasMore && (
                  <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => fetchNotifications(false)}
                      disabled={loadingMore}
                      className="btn btn--secondary btn--md"
                      style={{ minWidth: '150px', cursor: 'pointer' }}
                    >
                      {loadingMore ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Loader2 className="animate-spin" size={16} />
                          Loading more...
                        </div>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
