import { useState } from 'react';
import { Sparkles, Stethoscope, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, loginWithGoogle, loginAsDemo, loading, error, clearError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brandArea}>
          <Sparkles size={40} className={styles.brandIcon} />
          <h1 className={styles.brandTitle}>MediConnect</h1>
          <p className={styles.brandSubtitle}>
            Smart healthcare management for doctors and patients.
            Book appointments, track health, and get AI-powered insights.
          </p>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureEmoji}>📅</span>
            <span>Seamless appointment scheduling</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureEmoji}>🤖</span>
            <span>AI-powered smart assistant</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureEmoji}>🔒</span>
            <span>Secure patient data management</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureEmoji}>📊</span>
            <span>Google Calendar integration</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Sign in</h2>
          <p className={styles.formSubtitle}>Welcome back — choose how you want to log in.</p>

          {error && (
            <div className={styles.error} role="alert">
              {error}
              <button onClick={clearError} className={styles.errorDismiss} aria-label="Dismiss error">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@mediconnect.com"
              icon={<Mail size={18} />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock size={18} />}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <Button variant="secondary" fullWidth onClick={loginWithGoogle} icon={
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          }>
            Google Sign-In
          </Button>

          <div className={styles.demoSection}>
            <p className={styles.demoLabel}>Quick demo access:</p>
            <div className={styles.demoButtons}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Stethoscope size={16} />}
                onClick={() => loginAsDemo('doctor')}
                loading={loading}
              >
                Doctor Demo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<User size={16} />}
                onClick={() => loginAsDemo('patient')}
                loading={loading}
              >
                Patient Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
