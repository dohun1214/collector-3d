import { Link } from 'react-router-dom';
import type { ItemSummary } from '../types';

interface Props {
  item: ItemSummary;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Pending', cls: 'badge-pending' },
    PROCESSING: { label: 'Processing', cls: 'badge-processing' },
    DONE: { label: 'Done', cls: 'badge-done' },
    FAILED: { label: 'Failed', cls: 'badge-failed' },
  };
  const info = map[status] ?? { label: status, cls: 'badge-pending' };
  return (
    <span className={`badge ${info.cls}`}>
      <span className="badge-dot" />
      {info.label}
    </span>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export default function ItemCard({ item }: Props) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-thumb">
        {item.thumbnailPath ? (
          <img src={`${API_BASE}/uploads/${item.thumbnailPath}`} alt={item.title} />
        ) : (
          <div className="item-thumb-placeholder" />
        )}
        <span className="item-thumb-label">3DGS</span>
      </div>
      <div className="item-meta">
        <div className="item-title">{item.title}</div>
        <div className="item-sub">
          <span className="author-dot" />
          <Link
            to={`/users/${item.authorNickname}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
          >
            {item.authorNickname}
          </Link>
          {item.categoryName && (
            <>
              <span style={{ color: 'var(--text-4)' }}>·</span>
              <span>{item.categoryName}</span>
            </>
          )}
        </div>
        <div className="item-stats">
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {item.viewCount ?? 0}
          </span>
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {item.likeCount ?? 0}
          </span>
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {item.commentCount ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
