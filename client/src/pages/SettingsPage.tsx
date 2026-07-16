import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { supabase } from '../supabase';
import { 
  Settings, 
  Palette, 
  Bell, 
  Lock, 
  User, 
  BookOpen, 
  Save, 
  Loader2, 
  AlertTriangle, 
  Check, 
  ChevronRight,
  LogOut,
  Trash2
} from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';

type TabType = 'appearance' | 'notifications' | 'privacy' | 'account' | 'learning';

export default function SettingsPage() {
  const { user, settings, updateUserSettings, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const [appearanceForm, setAppearanceForm] = useState({
    theme: 'light',
    code_editor_theme: 'vs-dark',
    font_size: 'medium',
    compact_mode: false,
    reduce_animations: false,
    high_contrast_mode: false,
  });

  const [notificationForm, setNotificationForm] = useState({
    lesson_notifications: true,
    achievement_notifications: true,
    ai_notifications: true,
    certificate_notifications: true,
    announcement_notifications: true,
    email_notifications: true,
    push_notifications: false,
  });

  const [privacyForm, setPrivacyForm] = useState({
    public_profile: true,
    show_xp: true,
    show_badges: true,
    show_certificates: true,
    show_learning_history: true,
    show_current_track: true,
  });

  const [learningForm, setLearningForm] = useState({
    daily_goal: 50,
    reminder_time: '20:00',
    preferred_learning_time: 'evening',
    preferred_learning_track: '',
    weekly_goal: 250,
  });

  // Account actions states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync state with settings context
  useEffect(() => {
    if (settings) {
      setAppearanceForm({
        theme: settings.theme || 'light',
        code_editor_theme: settings.code_editor_theme || 'vs-dark',
        font_size: settings.font_size || 'medium',
        compact_mode: !!settings.compact_mode,
        reduce_animations: !!settings.reduce_animations,
        high_contrast_mode: !!settings.high_contrast_mode,
      });

      setNotificationForm({
        lesson_notifications: !!settings.lesson_notifications,
        achievement_notifications: !!settings.achievement_notifications,
        ai_notifications: !!settings.ai_notifications,
        certificate_notifications: !!settings.certificate_notifications,
        announcement_notifications: !!settings.announcement_notifications,
        email_notifications: !!settings.email_notifications,
        push_notifications: !!settings.push_notifications,
      });

      setPrivacyForm({
        public_profile: !!settings.public_profile,
        show_xp: !!settings.show_xp,
        show_badges: !!settings.show_badges,
        show_certificates: !!settings.show_certificates,
        show_learning_history: !!settings.show_learning_history,
        show_current_track: !!settings.show_current_track,
      });

      setLearningForm({
        daily_goal: settings.daily_goal || 50,
        reminder_time: settings.reminder_time || '20:00',
        preferred_learning_time: settings.preferred_learning_time || 'evening',
        preferred_learning_track: settings.preferred_learning_track || '',
        weekly_goal: settings.weekly_goal || 250,
      });
    }
  }, [settings]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveSettings = async (section: TabType, formData: any) => {
    setLoading(true);
    try {
      await updateUserSettings(formData);
      
      // If learning preferences daily goal is changed, also update daily goal in profile table
      if (section === 'learning' && formData.daily_goal !== settings?.daily_goal) {
        await userService.updateProfile({ dailyXpGoal: formData.daily_goal });
      }

      setToast('🎉 Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setToast('❌ Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      if (error) throw error;

      setPasswordSuccess('🎉 Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type the confirmation phrase exactly.');
      return;
    }

    setDeleteLoading(true);
    try {
      await userService.deleteAccount();
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Failed to delete account. Please try logging in again first.');
      setDeleteLoading(false);
    }
  };

  const handleToggle = (form: string, field: string) => {
    if (form === 'appearance') {
      setAppearanceForm(prev => {
        const next = { ...prev, [field]: !((prev as any)[field]) };
        handleSaveSettings('appearance', next);
        return next;
      });
    } else if (form === 'notification') {
      setNotificationForm(prev => {
        const next = { ...prev, [field]: !((prev as any)[field]) };
        handleSaveSettings('notifications', next);
        return next;
      });
    } else if (form === 'privacy') {
      setPrivacyForm(prev => {
        const next = { ...prev, [field]: !((prev as any)[field]) };
        handleSaveSettings('privacy', next);
        return next;
      });
    }
  };

  const menuItems = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Lock size={16} /> },
    { id: 'learning', label: 'Learning Preferences', icon: <BookOpen size={16} /> },
    { id: 'account', label: 'Account Actions', icon: <User size={16} /> },
  ];

  const providerName = user?.provider || 'Email/Password';

  return (
    <PageTransition>
      <div className="settings-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)', margin: 0 }}>
            Settings Center
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-8)', alignItems: 'start' }} className="settings-grid">
            
            {/* Left Nav Tabs */}
            <div className="card" style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-lg)' }}>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: activeTab === item.id ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === item.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontWeight: activeTab === item.id ? 600 : 500,
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (activeTab !== item.id) e.currentTarget.style.backgroundColor = 'var(--border-light)';
                  }}
                  onMouseLeave={e => {
                    if (activeTab !== item.id) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon}
                    {item.label}
                  </div>
                  <ChevronRight size={14} style={{ opacity: activeTab === item.id ? 1 : 0 }} />
                </button>
              ))}
            </div>

            {/* Right Form Fields */}
            <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              
              {/* TAB 1: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Appearance Preferences</h2>
                  
                  <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Theme */}
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Application Theme</span>
                      <select 
                        value={appearanceForm.theme} 
                        onChange={e => {
                          const next = { ...appearanceForm, theme: e.target.value };
                          setAppearanceForm(next);
                          handleSaveSettings('appearance', next);
                        }}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="light">☀️ Light Theme (Clean White)</option>
                        <option value="dark">🌙 Dark Theme (Midnight Blue)</option>
                      </select>
                    </div>

                    {/* Editor Theme */}
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Code Editor Theme</span>
                      <select 
                        value={appearanceForm.code_editor_theme} 
                        onChange={e => {
                          const next = { ...appearanceForm, code_editor_theme: e.target.value };
                          setAppearanceForm(next);
                          handleSaveSettings('appearance', next);
                        }}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="vs-dark">Dark (VS Dark)</option>
                        <option value="light">Light (VS Light)</option>
                      </select>
                    </div>

                    {/* Font Size */}
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Global Font Size</span>
                      <select 
                        value={appearanceForm.font_size} 
                        onChange={e => {
                          const next = { ...appearanceForm, font_size: e.target.value };
                          setAppearanceForm(next);
                          handleSaveSettings('appearance', next);
                        }}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="small">Small (14px)</option>
                        <option value="medium">Medium (16px)</option>
                        <option value="large">Large (18px)</option>
                        <option value="extra-large">Extra Large (20px)</option>
                      </select>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '10px 0' }} />

                    {/* Compact Mode Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>Compact Interface Mode</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tighter layouts and reduced paddings across all cards.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={appearanceForm.compact_mode} 
                        onChange={() => handleToggle('appearance', 'compact_mode')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Reduce Animations Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>Reduce Motion / Animations</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mutes framer-motion transitions for faster performance.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={appearanceForm.reduce_animations} 
                        onChange={() => handleToggle('appearance', 'reduce_animations')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    {/* High Contrast Mode Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>High Contrast Mode</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enhance legibility with high contrast borders and solid background contrasts.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={appearanceForm.high_contrast_mode} 
                        onChange={() => handleToggle('appearance', 'high_contrast_mode')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Notification Channels & Preferences</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {[
                      { field: 'lesson_notifications', title: 'Lesson & Progression Alerts', desc: 'Notify when lessons are completed, XP is earned, or daily goals are achieved.' },
                      { field: 'achievement_notifications', title: 'Achievements & Milestones', desc: 'Get notified when you level up or unlock new badges.' },
                      { field: 'ai_notifications', title: 'AI Workspace Notifications', desc: 'Alert when a custom generative track finishes compiling.' },
                      { field: 'certificate_notifications', title: 'Certificates Generation', desc: 'Notify when new technical certificates are generated.' },
                      { field: 'announcement_notifications', title: 'Announcements & News', desc: 'System-wide announcements and updates from the administrators.' },
                      { field: 'email_notifications', title: 'Email Digest Alerts', desc: 'Send daily learning summaries to your registered email address.' },
                      { field: 'push_notifications', title: 'Browser Push Notifications', desc: 'Receive real-time desktop push notifications.' }
                    ].map(item => (
                      <div key={item.field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>{item.title}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={(notificationForm as any)[item.field]} 
                          onChange={() => handleToggle('notification', item.field)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* TAB 3: PRIVACY & SECURITY */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Privacy & Security Preferences</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {[
                      { field: 'public_profile', title: 'Enable Public Profile', desc: 'Allows other users to view your portfolio at /u/username.' },
                      { field: 'show_xp', title: 'Display Total XP & Level', desc: 'Show your current level progress and accumulated XP points.' },
                      { field: 'show_badges', title: 'Show Earned Achievements', desc: 'Display unlocked milestones and rare badges on your profile.' },
                      { field: 'show_certificates', title: 'Show Certificates', desc: 'List your technical graduation credentials publicly.' },
                      { field: 'show_learning_history', title: 'Show Activity Calendar', desc: 'Allow public viewing of your contribution activity heatmap.' },
                      { field: 'show_current_track', title: 'Show Current Focus Track', desc: 'Display what language or course track you are currently active on.' }
                    ].map(item => (
                      <div key={item.field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>{item.title}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={(privacyForm as any)[item.field]} 
                          onChange={() => handleToggle('privacy', item.field)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* TAB 4: LEARNING PREFERENCES */}
              {activeTab === 'learning' && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Learning Configuration</h2>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('learning', learningForm); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Daily XP Goal */}
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Daily XP Goal</span>
                      <select 
                        value={learningForm.daily_goal} 
                        onChange={e => setLearningForm({ ...learningForm, daily_goal: parseInt(e.target.value, 10) })}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      >
                        <option value="20">20 XP (Casual)</option>
                        <option value="50">50 XP (Regular)</option>
                        <option value="100">100 XP (Serious)</option>
                        <option value="200">200 XP (Insane)</option>
                      </select>
                    </div>

                    {/* Weekly XP Goal */}
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Weekly XP Target</span>
                      <select 
                        value={learningForm.weekly_goal} 
                        onChange={e => setLearningForm({ ...learningForm, weekly_goal: parseInt(e.target.value, 10) })}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      >
                        <option value="100">100 XP / week</option>
                        <option value="250">250 XP / week</option>
                        <option value="500">500 XP / week</option>
                        <option value="1000">1000 XP / week</option>
                      </select>
                    </div>

                    {/* Preferred Learning Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Preferred Learning Time</span>
                      <select 
                        value={learningForm.preferred_learning_time} 
                        onChange={e => setLearningForm({ ...learningForm, preferred_learning_time: e.target.value })}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      >
                        <option value="morning">Morning (5:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                        <option value="evening">Evening (5:00 PM - 9:00 PM)</option>
                        <option value="night">Night owl (9:00 PM - 4:00 AM)</option>
                      </select>
                    </div>

                    {/* Reminder Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Daily Reminder Time</span>
                      <input 
                        type="time" 
                        value={learningForm.reminder_time}
                        onChange={e => setLearningForm({ ...learningForm, reminder_time: e.target.value })}
                        style={{
                          maxWidth: '200px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn--primary btn--md"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Preferences
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* TAB 5: ACCOUNT ACTIONS */}
              {activeTab === 'account' && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Account Information & Security</h2>
                  
                  {/* Account Information */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img 
                        src={user?.avatarUrl || 'https://via.placeholder.com/64'} 
                        alt="Avatar" 
                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-blue)' }} 
                      />
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 600, display: 'block' }}>{user?.name}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block' }}>Email: {user?.email}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Login Provider: {providerName}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '20px 0' }} />

                  {/* Change Password Form (Only show for Email provider) */}
                  {providerName === 'Email/Password' && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Change Account Password</h3>
                      
                      {passwordError && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px' }}>
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px' }}>
                          {passwordSuccess}
                        </div>
                      )}

                      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>New Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="Enter new password"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="Re-type new password"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="btn btn--secondary btn--md"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                          >
                            {passwordLoading && <Loader2 className="animate-spin" size={14} />}
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '20px 0' }} />

                  {/* Account Actions */}
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: '16px' }}>Danger Zone</h3>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => { logout(); window.location.href = '/'; }} 
                        className="btn btn--secondary btn--md"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      >
                        <LogOut size={16} /> Sign Out Session
                      </button>
                      
                      <button 
                        onClick={() => setShowDeleteConfirm(true)} 
                        className="btn btn--danger btn--md"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} /> Delete Account
                      </button>
                    </div>

                    {showDeleteConfirm && (
                      <div className="card" style={{ marginTop: '20px', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.02)', padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <AlertTriangle className="text-red-500" style={{ flexShrink: 0 }} />
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, display: 'block' }}>Permanently Delete Your Account</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                              Warning: This action is irreversible. All your level stats, streaks, activity contributions, generated AI tracks, and earned technical certificates will be permanently wiped out.
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 500 }}>Type <strong style={{ color: 'var(--accent-rose)' }}>DELETE MY ACCOUNT</strong> to confirm:</label>
                          <input 
                            type="text" 
                            placeholder="Type the confirmation phrase"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            style={{
                              maxWidth: '300px',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                          
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button
                              disabled={deleteLoading || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                              onClick={handleDeleteAccount}
                              className="btn btn--danger btn--sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                            >
                              {deleteLoading && <Loader2 className="animate-spin" size={14} />}
                              Confirm Deletion
                            </button>
                            
                            <button
                              onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                              className="btn btn--secondary btn--sm"
                              style={{ cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </PageTransition>
  );
}
