import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadFiles } from '../api/items';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import styles from './ItemCreatePage.module.css';

export default function ItemCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', isPublic: true });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'uploading' | 'processing'>('form');

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('아이템 이름을 입력해주세요.'); return; }
    if (files.length === 0) { setError('파일을 선택해주세요.'); return; }

    try {
      setStep('uploading');
      const { data: item } = await createItem({
        title: form.title,
        description: form.description || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        isPublic: form.isPublic,
      });

      setStep('processing');
      await uploadFiles(item.id, files);
      navigate(`/items/${item.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '등록에 실패했습니다.');
      setStep('form');
    }
  };

  if (step !== 'form') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>{step === 'uploading' ? '파일 업로드 중...' : '3DGS 처리 요청 중...'}</p>
        <p className={styles.sub}>완료 후 아이템 페이지로 이동합니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>아이템 등록</h1>
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

        <label className={styles.label}>파일 업로드 * <span className={styles.hint}>(영상 mp4 또는 사진 jpg/png)</span></label>
        <input
          type="file"
          accept=".mp4,.mov,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className={styles.fileInput}
        />
        {files.length > 0 && (
          <p className={styles.fileCount}>{files.length}개 파일 선택됨</p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.btn}>등록하기</button>
      </form>
    </div>
  );
}
