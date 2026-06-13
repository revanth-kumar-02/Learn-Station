import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import PageTransition from '../components/layout/PageTransition';
import { Eye, EyeOff } from 'lucide-react';
import GithubIcon from '../components/common/GithubIcon';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, loginWithGithub, logout } = useAuth();
  const navigate = useNavigate();

  // If already logged in as owner, redirect to admin dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        navigate('/admin/dashboard');
      } else {
        // If logged in as student or admin, logout and show error
        logout();
        setError('Access denied: Only the owner account is permitted to access the admin command center.');
      }
    }
  }, [user, navigate, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      // Wait a moment for onAuthStateChange to fetch user profile
      if (result?.user) {
        // Auth state is processing
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGithub();
    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div 
        className="admin-login-page" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          fontFamily: 'inherit',
          padding: '24px',
        }}
      >
        <div 
          className="admin-login-card"
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1)',
            padding: '40px 32px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                color: '#3B82F6',
                marginBottom: '16px',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Midnight Command Center
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
              Administrative gateway for LearnStation
            </p>
          </div>

          {error && (
            <div 
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #EF4444',
                color: '#F8FAFC',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '12px',
                textAlign: 'left',
                lineHeight: '1.4',
                marginBottom: '24px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label 
                htmlFor="email" 
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@learnstation.com"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  color: '#F8FAFC',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label 
                htmlFor="password" 
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '12px 40px 12px 14px',
                    color: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              loading={loading}
              style={{
                marginTop: '10px',
                backgroundColor: '#3B82F6',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              }}
            >
              Sign In to Command Center
            </Button>

            <div style={{ margin: '8px 0', textAlign: 'center', color: '#64748B', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              loading={loading}
              onClick={handleGithubLogin}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#F8FAFC',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <GithubIcon size={18} />
              <span>Continue with GitHub</span>
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
