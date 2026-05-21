import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getItems } from '../api/items';
import { getCategories } from '../api/categories';
import ItemCard from '../components/ItemCard';
import type { ItemSummary, Category } from '../types';
import { useAuth } from '../store/AuthContext';

type SortMode = 'trending' | 'latest' | 'views';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getItems({ keyword: keyword || undefined, categoryId, page, size: 20, sort: sortMode });
      setItems(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryId, page, sortMode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // sync keyword from URL param
  useEffect(() => {
    const kw = searchParams.get('keyword') ?? '';
    setKeyword(kw);
    setPage(0);
  }, [searchParams]);

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,200,120,0.06), transparent 70%)' }}>
        <div className="page-body" style={{ paddingBottom: 40, paddingTop: 48 }}>
          <div className="eyebrow">3D Collector</div>
          <h1 className="h1">소장품을 3D로 공유</h1>
          <p className="muted" style={{ marginBottom: 28 }}>
            피규어, 레고, 굿즈를 촬영하면 자동으로 3D 모델이 생성됩니다.
          </p>
          {isLoggedIn ? (
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/items/new')}>
              내 소장품 올리기
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                시작하기
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
                로그인
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="page-body compact">
        {/* Category chips */}
        <div className="chips-row">
          <button
            className={`category-chip${categoryId === undefined ? ' active' : ''}`}
            onClick={() => { setCategoryId(undefined); setPage(0); }}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-chip${categoryId === c.id ? ' active' : ''}`}
              onClick={() => { setCategoryId(c.id); setPage(0); }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div style={{ flex: 1, display: 'flex', gap: 6 }}>
            {(['trending', 'latest', 'views'] as SortMode[]).map((m) => (
              <button
                key={m}
                className={`btn btn-sm btn-ghost${sortMode === m ? ' btn-active' : ''}`}
                onClick={() => { setSortMode(m); setPage(0); }}
              >
                {m === 'trending' ? '트렌딩' : m === 'latest' ? '최신순' : '조회순'}
              </button>
            ))}
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {items.length}개 항목
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            로딩 중...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <p style={{ margin: 0, fontSize: 14 }}>등록된 아이템이 없습니다.</p>
          </div>
        ) : (
          <div className="feed-grid">
            {items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              이전
            </button>
            <span className="mono" style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
