import { useState, useEffect } from 'react';
import { getMyItems, deleteItem } from '../api/items';
import { useAuth } from '../store/AuthContext';
import ItemCard from '../components/ItemCard';
import type { ItemSummary } from '../types';
import styles from './MyPage.module.css';

export default function MyPage() {
  const { nickname } = useAuth();
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    getMyItems()
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{nickname}의 컬렉션</h1>
        <span className={styles.count}>{items.length}개</span>
      </div>

      {loading ? (
        <div className={styles.empty}>로딩 중...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>아직 등록한 아이템이 없습니다.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.cardWrapper}>
              <ItemCard item={item} />
              {!item.isPublic && <span className={styles.privateBadge}>비공개</span>}
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(item.id)}
              >삭제</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
