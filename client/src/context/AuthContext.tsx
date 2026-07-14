/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../supabase';
import api from '../services/api';
import { User, UserResponse } from '../types/User';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const applyAppearance = useCallback((settingsData: any) => {
    if (!settingsData) return;

    // 1. Theme
    if (settingsData.theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // 2. Font Size
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
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
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get<UserResponse>('/auth/me');
      setUser(data.user);

      // Load settings
      const { data: settingsData } = await api.get<any>('/users/me/settings');
      setSettings(settingsData.settings);
      applyAppearance(settingsData.settings);

      // Load initial unread count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user.id)
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
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile();
      } else {
        setUser(null);
        setSettings(null);
        setLoading(false);
      }
    });

    // 2. Listen to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
