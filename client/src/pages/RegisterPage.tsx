import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import PageTransition from '../components/layout/PageTransition';
import { Eye, EyeOff } from 'lucide-react';
import GithubIcon from '../components/common/GithubIcon';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Registration failed');
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
      setError(err.message || 'GitHub registration failed');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Create your account</h1>
            <p>Start your learning journey today</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
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
                  placeholder="At least 6 characters"
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
              Create Account
            </Button>
          </form>

          <div className="auth-divider" style={{ margin: 'var(--space-4) 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={loading}
            onClick={handleGithubLogin}
            className="auth-submit"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}
          >
            <GithubIcon size={18} />
            <span>Continue with GitHub</span>
          </Button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
