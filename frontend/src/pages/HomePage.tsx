import { useState, useEffect, useCallback } from 'react';
import { getItems } from '../api/items';
import { getCategories } from '../api/categories';
import ItemCard from '../components/ItemCard';
import type { ItemSummary, Category } from '../types';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getItems({ keyword: keyword || undefined, categoryId, page, size: 20 });
      setItems(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryId, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="아이템 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>검색</button>
        </form>
        <div className={styles.categories}>
          <button
            className={categoryId === undefined ? styles.catActive : styles.cat}
            onClick={() => { setCategoryId(undefined); setPage(0); }}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={categoryId === c.id ? styles.catActive : styles.cat}
              onClick={() => { setCategoryId(c.id); setPage(0); }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>등록된 아이템이 없습니다.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>이전</button>
          <span>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>다음</button>
        </div>
      )}
    </div>
  );
}
