import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { Logo } from '../components/Logo';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleTestLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-bg min-h-screen flex items-center justify-center relative p-4 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-custom-12 card-bg border border-light-border dark:border-dark-border hover:bg-light-card-hover dark:hover:bg-dark-card-hover transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-stagger-in">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo size="lg" className="mb-4 drop-shadow-xl" />
          <h1 className="text-display text-primary tracking-tight">Welcome Back</h1>
          <p className="text-body text-secondary mt-1">Sign in to your Operations Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="card p-8 space-y-5 border border-light-border dark:border-dark-border shadow-2xl">
          <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3 mb-2">
            <span className="card-eyebrow text-accent">OPERATOR SIGN IN</span>
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>

          {error && (
            <div className="flex gap-3 p-3.5 bg-rose-500/10 border border-status-negative rounded-custom-12 text-sm text-status-negative">
              <AlertCircle className="w-5 h-5 text-status-negative flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="card-eyebrow">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your operator username"
              className="input-base w-full"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="card-eyebrow">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security password"
              className="input-base w-full"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In to Ops Portal'
            )}
          </button>
        </form>

        {/* Test Credentials Buttons */}
        <div className="mt-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-light-border dark:border-dark-border flex-1" />
            <span className="text-caption text-secondary font-medium uppercase tracking-wider">Test Credentials</span>
            <div className="h-px bg-light-border dark:border-dark-border flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTestLogin('admin', 'admin123')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-custom-12 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold transition-colors"
            >
              <Key className="w-4 h-4" />
              Admin
            </button>
            <button
              onClick={() => handleTestLogin('sales', 'sales123')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-custom-12 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Sales
            </button>
            <button
              onClick={() => handleTestLogin('warehouse', 'warehouse123')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-custom-12 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Warehouse
            </button>
            <button
              onClick={() => handleTestLogin('accounts', 'accounts123')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-custom-12 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Accounts
            </button>
          </div>
        </div>

        <p className="text-caption text-muted text-center mt-6">
          Protected System • Role-Based Access Control
        </p>
      </div>
    </div>
  );
}
