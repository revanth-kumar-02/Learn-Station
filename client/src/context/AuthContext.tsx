/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '../supabase';
import api from '../services/api';
import { User, UserResponse } from '../types/User';
import { syncEngine } from '../utils/syncEngine';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGithub: () => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loadUser: () => Promise<void>;
  settings: any | null;
  updateUserSettings: (updates: any) => Promise<void>;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hard startup timeout — if loading hasn't resolved in this many ms, force it
// to false so the UI is never blocked indefinitely by a hanging Supabase call.
const STARTUP_TIMEOUT_MS = 8000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Tracks whether the initial session check is done so onAuthStateChange
  // does not fire a redundant loadProfile() for the INITIAL_SESSION event.
  const initialSessionDone = useRef(false);

  const applyAppearance = useCallback((settingsData: any) => {
    if (!settingsData) return;

    // 1. Theme
    if (settingsData.theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // 2. Font Size
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large');
    document.documentElement.classList.add(`font-size-${settingsData.font_size || 'medium'}`);

    // 3. Compact Mode
    if (settingsData.compact_mode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }

    // 4. Reduce Animations
    if (settingsData.reduce_animations) {
      document.body.classList.add('reduce-animations');
    } else {
      document.body.classList.remove('reduce-animations');
    }

    // 5. High Contrast Mode
    if (settingsData.high_contrast_mode) {
      document.documentElement.classList.add('high-contrast-theme');
    } else {
      document.documentElement.classList.remove('high-contrast-theme');
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      // ── Step 1: Fetch user profile and settings in parallel ───────────────
      const [userRes, settingsRes] = await Promise.all([
        api.get<UserResponse>('/auth/me'),
        api.get<any>('/users/me/settings'),
      ]);
      // ─────────────────────────────────────────────────────────────────────

      const fetchedUser = userRes.data.user;
      setUser(fetchedUser);

      const fetchedSettings = settingsRes.data.settings;
      setSettings(fetchedSettings);
      applyAppearance(fetchedSettings);

      // ── Step 2: Fetch notification count (requires user ID from Step 1) ──
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', fetchedUser.id)
        .eq('is_read', false)
        .lte('scheduled_at', new Date().toISOString());

      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error loading user profile or settings:', err);
      setUser(null);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [applyAppearance]);

  useEffect(() => {
    // Register sync engine triggers to reload profile after background synchronizations
    syncEngine.registerSyncTriggers(() => {
      loadProfile();
    });

    // Hard startup timeout — never block the UI forever
    const startupTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('[Auth] Startup timeout reached. Forcing loading=false to unblock UI.');
          return false;
        }
        return prev;
      });
    }, STARTUP_TIMEOUT_MS);

    // 1. Get initial session — this is the ONLY place that calls loadProfile on startup.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        loadProfile().finally(() => {
          initialSessionDone.current = true;
          clearTimeout(startupTimeout);
        });
      } else {
        setUser(null);
        setSettings(null);
        setLoading(false);
        initialSessionDone.current = true;
        clearTimeout(startupTimeout);
      }
    });

    // 2. Listen to subsequent authentication changes.
    //    Skip the very first INITIAL_SESSION event because getSession() above
    //    already handles it — firing loadProfile() twice doubles startup cost.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip the initial event that mirrors getSession()
      if (!initialSessionDone.current) return;

      setSession(session);
      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(startupTimeout);
    };
  }, [loadProfile]);

  // Realtime notification listener
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const channel = supabase
      .channel(`notifications-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Recalculate unread count
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false)
            .lte('scheduled_at', new Date().toISOString());
          
          setUnreadCount(count || 0);

          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as any;
            if (new Date(newNotif.scheduled_at).getTime() <= Date.now()) {
              const event = new CustomEvent('new-notification-alert', { detail: newNotif });
              window.dispatchEvent(event);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const loginWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
    setUser(null);
    setSession(null);
    setSettings(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateUserSettings = async (updates: any) => {
    try {
      const { data } = await api.put<any>('/users/me/settings', updates);
      if (data.success) {
        setSettings(data.settings);
        applyAppearance(data.settings);
      }
    } catch (err) {
      console.error('Failed to update user settings in context:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        loginWithGithub,
        logout,
        updateUser,
        loadUser: loadProfile,
        settings,
        updateUserSettings,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
