import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserItems } from '../api/users';
import { useAuth } from '../store/AuthContext';
import ItemCard from '../components/ItemCard';
import type { UserProfile, ItemSummary } from '../types';

export default function ProfilePage() {
  const { nickname } = useParams<{ nickname: string }>();
  const { nickname: myNickname } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!nickname) return;
    setLoading(true);
    getUserProfile(nickname)
      .then((r) => setProfile(r.data))
      .catch(() => setError('사용자를 찾을 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [nickname]);

  useEffect(() => {
    if (!nickname) return;
    getUserItems(nickname, page)
      .then((r) => {
        setItems(r.data.content);
        setTotalPages(r.data.totalPages);
      })
      .catch(() => {});
  }, [nickname, page]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      로딩 중...
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--status-failed)', fontSize: 14 }}>
      {error}
    </div>
  );
  if (!profile) return null;

  const isMe = myNickname === profile.nickname;
  const avatarLetter = profile.nickname.charAt(0).toUpperCase();

  return (
    <div className="page">
      <div className="page-body compact">
        {/* Profile header */}
        <div className="mypage-header">
          <div className="profile">
            <div className="profile-avatar">{avatarLetter}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{profile.nickname}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                @{profile.nickname.toLowerCase()}
                <span style={{ marginLeft: 12 }}>
                  {new Date(profile.joinedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입
                </span>
              </div>
              <div className="profile-stats">
                <div className="stat">
                  <span className="num">{profile.itemCount}</span>
                  <span className="lbl">소장품</span>
                </div>
                <div className="stat">
                  <span className="num">{profile.totalLikes}</span>
                  <span className="lbl">받은 좋아요</span>
                </div>
                <div className="stat">
                  <span className="num">{profile.totalViews}</span>
                  <span className="lbl">총 조회수</span>
                </div>
              </div>
            </div>
          </div>
          {isMe && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/my')}>
              내 페이지로
            </button>
          )}
        </div>

        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className="tab active">
            소장품
            <span className="count">{profile.itemCount}</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
            <p style={{ margin: 0, fontSize: 14 }}>공개된 소장품이 없습니다.</p>
          </div>
        ) : (
          <div className="feed-grid cols-3">
            {items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>이전</button>
            <span className="mono" style={{ fontSize: 13, color: 'var(--text-2)' }}>{page + 1} / {totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>다음</button>
          </div>
        )}
      </div>
    </div>
  );
}
