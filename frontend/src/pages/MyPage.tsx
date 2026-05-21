import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyItems, deleteItem } from '../api/items';
import { getSavedItems } from '../api/social';
import { useAuth } from '../store/AuthContext';
import ItemCard from '../components/ItemCard';
import type { ItemSummary } from '../types';

type TabId = 'my' | 'saved' | 'drafts' | 'activity';

export default function MyPage() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('my');
  const [myItems, setMyItems] = useState<ItemSummary[]>([]);
  const [savedItems, setSavedItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyItems()
      .then((r) => setMyItems(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'saved') {
      getSavedItems()
        .then((r) => setSavedItems(r.data))
        .catch(() => setSavedItems([]));
    }
  }, [tab]);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteItem(id);
    setMyItems((prev) => prev.filter((i) => i.id !== id));
  };

  const avatarLetter = nickname ? nickname.charAt(0).toUpperCase() : 'U';

  return (
    <div className="page">
      <div className="page-body compact">
        {/* Profile header */}
        <div className="mypage-header">
          <div className="profile">
            <div className="profile-avatar">{avatarLetter}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{nickname}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>@{nickname?.toLowerCase()}</div>
              <div className="profile-stats">
                <div className="stat">
                  <span className="num">{myItems.length}</span>
                  <span className="lbl">소장품</span>
                </div>
                <div className="stat">
                  <span className="num">{savedItems.length}</span>
                  <span className="lbl">저장</span>
                </div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/items/new')}>
            + 새 소장품
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab${tab === 'my' ? ' active' : ''}`} onClick={() => setTab('my')}>
            내 소장품
            <span className="count">{myItems.length}</span>
          </button>
          <button className={`tab${tab === 'saved' ? ' active' : ''}`} onClick={() => setTab('saved')}>
            저장한 항목
            <span className="count">{savedItems.length}</span>
          </button>
          <button className={`tab${tab === 'drafts' ? ' active' : ''}`} onClick={() => setTab('drafts')}>
            임시저장
          </button>
          <button className={`tab${tab === 'activity' ? ' active' : ''}`} onClick={() => setTab('activity')}>
            활동 내역
          </button>
        </div>

        {/* Tab content */}
        {tab === 'my' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                로딩 중...
              </div>
            ) : myItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
                <p style={{ margin: '0 0 16px', fontSize: 14 }}>아직 등록한 아이템이 없습니다.</p>
                <button className="btn btn-primary" onClick={() => navigate('/items/new')}>첫 소장품 올리기</button>
              </div>
            ) : (
              <div className="feed-grid cols-3">
                {myItems.map((item) => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <ItemCard item={item} />
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 2 }}>
                      {!item.isPublic && (
                        <span className="badge" style={{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'rgba(0,0,0,0.7)' }}>
                          비공개
                        </span>
                      )}
                      <button
                        className="btn btn-sm"
                        onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}
                        style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid var(--border)', color: 'var(--status-failed)', padding: '4px 10px', backdropFilter: 'blur(8px)' }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'saved' && (
          <>
            {savedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
                <p style={{ margin: 0, fontSize: 14 }}>저장한 아이템이 없습니다.</p>
              </div>
            ) : (
              <div className="feed-grid cols-3">
                {savedItems.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            )}
          </>
        )}

        {tab === 'drafts' && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
            <p style={{ margin: 0, fontSize: 14 }}>임시저장 기능은 준비 중입니다.</p>
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
            <p style={{ margin: 0, fontSize: 14 }}>활동 내역 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
