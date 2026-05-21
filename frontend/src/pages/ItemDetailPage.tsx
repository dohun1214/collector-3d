import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItem, deleteItem, getJobStatus, uploadFiles } from '../api/items';
import { useAuth } from '../store/AuthContext';
import GaussianViewer from '../components/GaussianViewer';
import type { ItemDetail, JobStatus } from '../types';
import styles from './ItemDetailPage.module.css';

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

  useEffect(() => {
    if (!id) return;
    getItem(Number(id))
      .then((r) => setItem(r.data))
      .catch(() => setError('아이템을 찾을 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  // 작업 중일 때 폴링
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
      } catch { /* job 없을 수 있음 */ }
    };

    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [item, isLoggedIn, nickname]);

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

  if (loading) return <div className={styles.center}>로딩 중...</div>;
  if (error) return <div className={styles.center}>{error}</div>;
  if (!item) return null;

  const isOwner = isLoggedIn && item.authorNickname === nickname;

  return (
    <div className={styles.page}>
      <div className={styles.viewer}>
        {item.plyPath ? (
          <GaussianViewer plyUrl={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/uploads/${item.plyPath}`} />
        ) : (
          <div className={styles.viewerBox}>
            {uploading ? (
              <p className={styles.viewerNote}>업로드 중...</p>
            ) : job ? (
              <JobStatusBadge status={job.status} error={job.errorMessage} />
            ) : (
              <p className={styles.viewerNote}>아직 3D 파일이 없습니다.</p>
            )}
          </div>
        )}
        {isOwner && !item.plyPath && (
          <div className={styles.reuploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.jpg,.jpeg,.png"
              multiple
              onChange={handleReupload}
              className={styles.reuploadInput}
              id="reupload"
              disabled={uploading || job?.status === 'PENDING' || job?.status === 'PROCESSING'}
            />
            <label htmlFor="reupload" className={
              (uploading || job?.status === 'PENDING' || job?.status === 'PROCESSING')
                ? styles.reuploadBtnDisabled
                : styles.reuploadBtn
            }>
              {uploading ? '업로드 중...' :
               job?.status === 'PENDING' || job?.status === 'PROCESSING' ? '처리 중...' :
               job?.status === 'FAILED' ? '파일 다시 올리기' : '파일 업로드'}
            </label>
            <p className={styles.reuploadHint}>영상(mp4) 또는 사진(jpg/png) 여러 장</p>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.header}>
          <div>
            <p className={styles.category}>{item.categoryName ?? '미분류'}</p>
            <h1 className={styles.title}>{item.title}</h1>
            <p className={styles.author}>by {item.authorNickname}</p>
          </div>
          {isOwner && (
            <div className={styles.actions}>
              <Link to={`/items/${item.id}/edit`} className={styles.editBtn}>수정</Link>
              <button onClick={handleDelete} className={styles.deleteBtn}>삭제</button>
            </div>
          )}
        </div>

        {item.description && <p className={styles.desc}>{item.description}</p>}

        <div className={styles.meta}>
          <span className={item.isPublic ? styles.public : styles.private}>
            {item.isPublic ? '공개' : '비공개'}
          </span>
          <span className={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
    </div>
  );
}

function JobStatusBadge({ status, error }: { status: string; error: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:    { label: '3DGS 대기 중...', cls: 'pending' },
    PROCESSING: { label: '3DGS 처리 중...', cls: 'processing' },
    DONE:       { label: '완료', cls: 'done' },
    FAILED:     { label: '처리 실패', cls: 'failed' },
  };
  const info = map[status] ?? { label: status, cls: 'pending' };
  return (
    <div>
      <p className={`${styles.jobStatus} ${styles[info.cls]}`}>{info.label}</p>
      {error && <p className={styles.jobError}>{error}</p>}
    </div>
  );
}
