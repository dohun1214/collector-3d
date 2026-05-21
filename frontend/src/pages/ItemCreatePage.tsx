import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadFiles } from '../api/items';
import { getCategories } from '../api/categories';
import type { Category } from '../types';

export default function ItemCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', isPublic: true });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'uploading' | 'processing'>('form');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    const urls = incoming.map((f) => {
      if (f.type.startsWith('image/')) return URL.createObjectURL(f);
      return '';
    });
    setPreviews(urls);
  };

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
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
            {step === 'uploading' ? '파일 업로드 중...' : '3DGS 처리 요청 중...'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            완료 후 아이템 페이지로 이동합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-body" style={{ paddingTop: 36 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow">New Item</div>
          <h1 className="h1">소장품 등록</h1>
          <p className="muted">3D로 만들 소장품의 영상이나 사진을 업로드하세요.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="upload-grid">
            {/* Left: Dropzone */}
            <div>
              <div
                className={`dropzone${dragOver ? ' drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(Array.from(e.dataTransfer.files));
                }}
              >
                <div className="dropzone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="dropzone-title">
                  {files.length > 0 ? `${files.length}개 파일 선택됨` : '파일을 드래그하거나 클릭'}
                </div>
                <div className="dropzone-sub">
                  영상 (mp4, mov) 또는 사진 (jpg, png)<br />
                  여러 장 선택 가능
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.jpg,.jpeg,.png"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
                />
              </div>

              {/* Preview tray */}
              {files.length > 0 && (
                <>
                  <div className="upload-tray">
                    {files.map((f, i) => (
                      <div key={i} className="upload-thumb">
                        {previews[i] ? (
                          <img src={previews[i]} alt={f.name} />
                        ) : (
                          <span style={{ textAlign: 'center', padding: 4 }}>
                            {f.name.split('.').pop()?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="upload-summary">
                    <span style={{ color: 'var(--text-2)' }}>{files.length}개 파일</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setFiles([]); setPreviews([]); }}
                    >
                      모두 제거
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right: Form fields */}
            <div>
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
                <p className="helper">비공개 설정 시 본인만 열람할 수 있습니다.</p>
              </div>

              {error && (
                <div style={{ padding: '12px 14px', background: 'oklch(0.7 0.14 25 / 0.1)', border: '1px solid oklch(0.7 0.14 25 / 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--status-failed)', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                등록하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
