import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { authService, demoAccounts } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'doctor' | 'patient') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.login(email, password);
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.loginWithGoogle();
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async (role: 'doctor' | 'patient') => {
    const acct = demoAccounts[role];
    setLoading(true);
    setError(null);
    try {
      const u = await authService.login(acct.email, acct.password);
      setUser(u);
    } catch (e) {
      console.warn('Firebase demo login failed, falling back to mock data:', e);
      // Only reload if mock mode is not already active (prevent infinite reload loop)
      if (localStorage.getItem('USE_MOCK') !== 'true') {
        localStorage.setItem('USE_MOCK', 'true');
        window.location.reload();
      } else {
        setError('Demo login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, loginWithGoogle, loginAsDemo, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
