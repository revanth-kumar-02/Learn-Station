import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import PageTransition from '../components/layout/PageTransition';
import { Eye, EyeOff } from 'lucide-react';
import GithubIcon from '../components/common/GithubIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@learnstation.com', 'demopass123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Demo login failed');
    } finally {
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
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Welcome back</h1>
            <p>Continue your learning journey</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', paddingRight: '40px' }}
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
                    color: 'var(--text-secondary)',
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
            <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
              Log in
            </Button>
          </form>

          <div className="auth-divider" style={{ margin: 'var(--space-4) 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              loading={loading}
              onClick={handleGithubLogin}
              className="auth-submit"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <GithubIcon size={18} />
              <span>Continue with GitHub</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              loading={loading}
              onClick={handleDemoLogin}
              className="auth-submit"
            >
              Try Demo Account ✨
            </Button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
