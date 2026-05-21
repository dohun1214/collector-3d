import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItem, deleteItem, getJobStatus, uploadFiles } from '../api/items';
import { toggleLike, toggleSave, getComments, addComment, deleteComment } from '../api/social';
import { useAuth } from '../store/AuthContext';
import GaussianViewer from '../components/GaussianViewer';
import { StatusBadge } from '../components/ItemCard';
import type { ItemDetail, JobStatus, CommentResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, nickname } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getItem(Number(id))
      .then((r) => {
        setItem(r.data);
        setLiked(r.data.isLiked ?? false);
        setLikeCount(r.data.likeCount ?? 0);
        setSaved(r.data.isSaved ?? false);
        setSaveCount(r.data.saveCount ?? 0);
      })
      .catch(() => setError('아이템을 찾을 수 없습니다.'))
      .finally(() => setLoading(false));

    getComments(Number(id))
      .then((r) => setComments(r.data))
      .catch(() => {});
  }, [id]);

  // Job polling
  useEffect(() => {
    if (!item || !isLoggedIn || item.authorNickname !== nickname) return;
    if (item.plyPath) return;

    const poll = async () => {
      try {
        const { data } = await getJobStatus(item.id);
        setJob(data);
        if (data.status === 'DONE') {
          getItem(item.id).then((r) => setItem(r.data));
        }
      } catch { /* job may not exist yet */ }
    };

    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [item, isLoggedIn, nickname]);

  const handleLike = async () => {
    if (!item || !isLoggedIn) return;
    try {
      const { data } = await toggleLike(item.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const handleSave = async () => {
    if (!item || !isLoggedIn) return;
    try {
      const { data } = await toggleSave(item.id);
      setSaved(data.saved);
      setSaveCount(data.saveCount);
    } catch {}
  };

  const handleAddComment = async () => {
    if (!item || !commentText.trim() || !isLoggedIn) return;
    setSubmittingComment(true);
    try {
      const { data } = await addComment(item.id, commentText.trim());
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch {} finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {}
  };

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!item || !e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    setError('');
    try {
      await uploadFiles(item.id, files);
      setJob(null);
      const { data } = await getItem(item.id);
      setItem(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteItem(item.id);
    navigate('/my');
  };

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
  if (!item) return null;

  const isOwner = isLoggedIn && item.authorNickname === nickname;
  const isProcessing = job?.status === 'PENDING' || job?.status === 'PROCESSING';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-body" style={{ paddingTop: 36 }}>
        <div className="detail-grid">
          {/* Left: Viewer */}
          <div>
            {item.plyPath ? (
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <GaussianViewer plyUrl={`${API_BASE}/uploads/${item.plyPath}`} />
              </div>
            ) : (
              <div className="viewer">
                <div className="viewer-grid" />
                <div className="viewer-hud">
                  <span className="pill">3DGS</span>
                  <span className="pill">{item.categoryName ?? '미분류'}</span>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    {uploading ? (
                      <p style={{ color: 'var(--text-2)', fontSize: 14 }}>업로드 중...</p>
                    ) : job ? (
                      <StatusBadge status={job.status} />
                    ) : (
                      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>아직 3D 파일이 없습니다.</p>
                    )}
                    {job?.errorMessage && (
                      <p style={{ color: 'var(--status-failed)', fontSize: 12, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                        {job.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reupload area for owner */}
            {isOwner && !item.plyPath && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleReupload}
                  style={{ display: 'none' }}
                  id="reupload"
                  disabled={uploading || isProcessing}
                />
                <label
                  htmlFor="reupload"
                  className={`btn btn-outline${uploading || isProcessing ? '' : ''}`}
                  style={{
                    opacity: uploading || isProcessing ? 0.5 : 1,
                    pointerEvents: uploading || isProcessing ? 'none' : 'auto',
                    cursor: 'pointer',
                  }}
                >
                  {uploading ? '업로드 중...' :
                   isProcessing ? '처리 중...' :
                   job?.status === 'FAILED' ? '파일 다시 올리기' : '파일 업로드'}
                </label>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>영상(mp4) 또는 사진(jpg/png)</span>
              </div>
            )}
          </div>

          {/* Right: Detail side */}
          <div className="detail-side">
            {/* Header badges + save */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {job && !item.plyPath && <StatusBadge status={job.status} />}
                {item.categoryName && (
                  <span className="badge" style={{ color: 'var(--text-2)', borderColor: 'var(--border)' }}>
                    {item.categoryName}
                  </span>
                )}
                <span className="badge" style={{ color: item.isPublic ? 'var(--status-done)' : 'var(--text-3)', borderColor: 'var(--border)' }}>
                  {item.isPublic ? '공개' : '비공개'}
                </span>
              </div>
              <button
                className={`btn btn-sm btn-ghost`}
                onClick={handleSave}
                disabled={!isLoggedIn}
                title={saved ? '저장 취소' : '저장'}
                style={{ color: saved ? 'var(--accent)' : 'var(--text-3)', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {saveCount}
              </button>
            </div>

            {/* Title + description */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2 }}>{item.title}</h1>
                {isOwner && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link to={`/items/${item.id}/edit`} className="btn btn-outline btn-sm">수정</Link>
                    <button onClick={handleDelete} className="btn btn-sm" style={{ color: 'var(--status-failed)', borderColor: 'var(--border)' }}>삭제</button>
                  </div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{item.description}</p>
              )}
            </div>

            <hr className="divider" />

            {/* Author */}
            <div className="detail-block" style={{ padding: '16px 18px' }}>
              <Link to={`/users/${item.authorNickname}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="author-card" style={{ cursor: 'pointer' }}>
                  <div className="author-avatar">
                    {item.authorNickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="author-name">{item.authorNickname}</div>
                    <div className="author-handle">@{item.authorNickname.toLowerCase()}</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Meta info */}
            <div className="detail-block">
              <div className="meta-row">
                <span className="k">조회수</span>
                <span className="v mono">{item.viewCount ?? 0}</span>
              </div>
              <div className="meta-row">
                <span className="k">좋아요</span>
                <span className="v mono">{likeCount}</span>
              </div>
              <div className="meta-row">
                <span className="k">댓글</span>
                <span className="v mono">{comments.length}</span>
              </div>
              <div className="meta-row">
                <span className="k">저장</span>
                <span className="v mono">{saveCount}</span>
              </div>
              <div className="meta-row">
                <span className="k">등록일</span>
                <span className="v">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* Like + comment buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className={`btn btn-outline${liked ? ' btn-active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleLike}
                disabled={!isLoggedIn}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                좋아요 {likeCount}
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                댓글 {comments.length}
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center', color: copied ? 'var(--status-done)' : undefined }}
                onClick={handleCopy}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {copied
                    ? <path d="M20 6 9 17l-5-5" />
                    : <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>
                  }
                </svg>
                {copied ? '복사됨!' : '링크 복사'}
              </button>
            </div>

            {/* Comments section */}
            <div className="detail-block">
              <div className="h3" style={{ marginBottom: 16 }}>댓글</div>
              {comments.length > 0 ? (
                <div className="comment-list">
                  {comments.map((c) => (
                    <div key={c.id} className="comment-item">
                      <div className="author-avatar" style={{ width: 30, height: 30, fontSize: 12, flexShrink: 0 }}>
                        {c.authorNickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-author">
                          {c.authorNickname}
                          <span className="comment-time">
                            {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                          {isLoggedIn && c.authorNickname === nickname && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-4)', fontSize: 11, cursor: 'pointer', marginLeft: 'auto' }}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        <div className="comment-text">{c.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: 13, margin: 0 }}>아직 댓글이 없습니다.</p>
              )}

              {isLoggedIn ? (
                <div className="comment-input-row">
                  <input
                    className="input"
                    placeholder="댓글을 입력하세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleAddComment(); }}
                    disabled={submittingComment}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                  >
                    등록
                  </button>
                </div>
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 16 }}>
                  댓글을 달려면 <Link to="/login" style={{ color: 'var(--accent)' }}>로그인</Link>하세요.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
