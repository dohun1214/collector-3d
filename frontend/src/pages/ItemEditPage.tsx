import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, updateItem } from '../api/items';
import { getCategories } from '../api/categories';
import type { Category } from '../types';

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
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-body" style={{ paddingTop: 36, maxWidth: 600 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow">Edit Item</div>
          <h1 className="h1">아이템 수정</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">아이템 이름 *</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="아이템 이름을 입력하세요"
              required
            />
          </div>

          <div className="field">
            <label className="label">설명</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="아이템에 대한 설명을 입력하세요"
            />
          </div>

          <div className="field">
            <label className="label">카테고리</label>
            <select
              className="select"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">카테고리 선택</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">공개 설정</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn btn-sm btn-outline${form.isPublic ? ' btn-active' : ''}`}
                onClick={() => setForm({ ...form, isPublic: true })}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                공개
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-outline${!form.isPublic ? ' btn-active' : ''}`}
                onClick={() => setForm({ ...form, isPublic: false })}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                비공개
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'oklch(0.7 0.14 25 / 0.1)', border: '1px solid oklch(0.7 0.14 25 / 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--status-failed)', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              {saving ? '저장 중...' : '수정하기'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
