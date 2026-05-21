import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, updateItem } from '../api/items';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import styles from './ItemCreatePage.module.css';

export default function ItemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', isPublic: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getItem(Number(id)),
      getCategories(),
    ]).then(([itemRes, catRes]) => {
      const item = itemRes.data;
      setForm({
        title: item.title,
        description: item.description ?? '',
        categoryId: item.categoryId ? String(item.categoryId) : '',
        isPublic: item.isPublic,
      });
      setCategories(catRes.data);
    }).catch(() => {
      setError('아이템을 불러올 수 없습니다.');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('아이템 이름을 입력해주세요.'); return; }

    try {
      setSaving(true);
      await updateItem(Number(id), {
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        isPublic: form.isPublic,
      });
      navigate(`/items/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>아이템 수정</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>아이템 이름 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={styles.input}
          placeholder="아이템 이름을 입력하세요"
          required
        />

        <label className={styles.label}>설명</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={styles.textarea}
          placeholder="아이템에 대한 설명을 입력하세요"
          rows={3}
        />

        <label className={styles.label}>카테고리</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className={styles.input}
        >
          <option value="">카테고리 선택</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className={styles.label}>공개 설정</label>
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={form.isPublic ? styles.toggleActive : styles.toggle}
            onClick={() => setForm({ ...form, isPublic: true })}
          >공개</button>
          <button
            type="button"
            className={!form.isPublic ? styles.toggleActive : styles.toggle}
            onClick={() => setForm({ ...form, isPublic: false })}
          >비공개</button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.btn} disabled={saving}>
          {saving ? '저장 중...' : '수정하기'}
        </button>
      </form>
    </div>
  );
}
