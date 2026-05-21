import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/auth';

interface AuthState {
  isLoggedIn: boolean;
  nickname: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: !!localStorage.getItem('accessToken'),
    nickname: localStorage.getItem('nickname'),
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('nickname', data.nickname);
    setAuth({ isLoggedIn: true, nickname: data.nickname });
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('nickname');
    setAuth({ isLoggedIn: false, nickname: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
