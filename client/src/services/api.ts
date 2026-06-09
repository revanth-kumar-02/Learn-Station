import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { supabase } from '../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token and log
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log(`🌐 [API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, {
      payload: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('🌐 [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 and log
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error(`❌ [API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
