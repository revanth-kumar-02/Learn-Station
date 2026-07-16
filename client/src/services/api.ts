import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from '../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Session token cache ─────────────────────────────────────────────────────
// We keep a module-level token so every axios request does NOT have to call
// supabase.auth.getSession() (an async round-trip) before it can even start.
// The token is updated immediately whenever Supabase fires an auth state change.
let _cachedToken: string | null = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  _cachedToken = session?.access_token ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  _cachedToken = session?.access_token ?? null;
});
// ────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach cached token (no async getSession call)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_cachedToken) {
      config.headers.Authorization = `Bearer ${_cachedToken}`;
    }
    return config;
  },
  (error) => {
    console.error('🌐 [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    console.error(
      `❌ [API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      { message: error.message, status: error.response?.status }
    );

    if (error.response?.status === 401) {
      // Token may be stale — try a fresh fetch before redirecting
      const { data: { session } } = await supabase.auth.getSession();
      _cachedToken = session?.access_token ?? null;
      if (!session) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
