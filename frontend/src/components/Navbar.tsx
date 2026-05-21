import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isLoggedIn, nickname, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>3D Collector</Link>
      <div className={styles.right}>
        {isLoggedIn ? (
          <>
            <Link to="/items/new" className={styles.btn}>+ 등록</Link>
            <Link to="/my" className={styles.link}>{nickname}</Link>
            <button onClick={handleLogout} className={styles.btnOutline}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>로그인</Link>
            <Link to="/signup" className={styles.btn}>회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}
