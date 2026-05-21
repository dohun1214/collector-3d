import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { signup } from '../api/auth';

interface Props {
  mode?: 'login' | 'signup';
}

export default function AuthPage({ mode = 'login' }: Props) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>(mode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupForm, setSignupForm] = useState({ email: '', password: '', nickname: '' });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch {
      setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (signupForm.password.length < 8) {
      setSignupError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    setSignupLoading(true);
    try {
      await signup(signupForm.email, signupForm.password, signupForm.nickname);
      setTab('login');
      setLoginEmail(signupForm.email);
    } catch (err: any) {
      setSignupError(err.response?.data?.message ?? '회원가입에 실패했습니다.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Art side */}
      <div className="auth-art">
        <div className="auth-art-grid" />
        <div className="floating f1" />
        <div className="floating f2" />
        <div className="floating f3" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo" style={{ marginBottom: 24 }}>
            <span className="logo-mark">3D</span>
            3D Collector
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            소장품을 3D로<br />공유하세요
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            피규어, 레고, 굿즈를 촬영하면<br />
            자동으로 3D 모델이 생성됩니다.
          </p>
        </div>

        <div className="auth-art-foot">
          <span>Gaussian Splatting</span>
          <span>COLMAP + gsplat</span>
          <span>RTX 4060 Ti</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-panel">
        <div className="auth-tabs">
          <button className={`t${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
            로그인
          </button>
          <button className={`t${tab === 'signup' ? ' active' : ''}`} onClick={() => setTab('signup')}>
            회원가입
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="label">이메일</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="label">비밀번호</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <div style={{ padding: '10px 14px', background: 'oklch(0.7 0.14 25 / 0.1)', border: '1px solid oklch(0.7 0.14 25 / 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--status-failed)', fontSize: 13, marginBottom: 16 }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loginLoading}
            >
              {loginLoading ? '로그인 중...' : '로그인'}
            </button>
            <div className="auth-foot">
              계정이 없으신가요?{' '}
              <a onClick={() => setTab('signup')}>회원가입</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field">
              <label className="label">이메일</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label">비밀번호</label>
              <input
                type="password"
                className="input"
                placeholder="8자 이상"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="label">닉네임</label>
              <input
                type="text"
                className="input"
                placeholder="닉네임"
                value={signupForm.nickname}
                onChange={(e) => setSignupForm({ ...signupForm, nickname: e.target.value })}
                required
              />
            </div>
            {signupError && (
              <div style={{ padding: '10px 14px', background: 'oklch(0.7 0.14 25 / 0.1)', border: '1px solid oklch(0.7 0.14 25 / 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--status-failed)', fontSize: 13, marginBottom: 16 }}>
                {signupError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={signupLoading}
            >
              {signupLoading ? '처리 중...' : '가입하기'}
            </button>
            <div className="auth-foot">
              이미 계정이 있으신가요?{' '}
              <a onClick={() => setTab('login')}>로그인</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
