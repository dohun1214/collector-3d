import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
  const { isLoggedIn, nickname, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="logo">
          <span className="logo-mark">3D</span>
          3D Collector
          <small>beta</small>
        </Link>
        <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>탐색</Link>
        {isLoggedIn && (
          <Link to="/my" className={`nav-link${isActive('/my') ? ' active' : ''}`}>마이페이지</Link>
        )}
      </div>

      <div className="nav-right">
        <div className="search-wrap">
          <span className="search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="아이템 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                navigate(`/?keyword=${encodeURIComponent(search.trim())}`);
              }
            }}
          />
        </div>

        {isLoggedIn ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/items/new')}>
              + 등록하기
            </button>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), oklch(0.5 0.16 50))',
                display: 'grid', placeItems: 'center',
                color: '#18130a', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', border: '1px solid var(--border-strong)',
                flexShrink: 0,
              }}
              onClick={() => navigate('/my')}
              title={nickname ?? ''}
            >
              {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">로그인</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}
