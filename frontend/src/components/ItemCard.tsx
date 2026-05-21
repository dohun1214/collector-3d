import { Link } from 'react-router-dom';
import type { ItemSummary } from '../types';
import styles from './ItemCard.module.css';

interface Props {
  item: ItemSummary;
}

export default function ItemCard({ item }: Props) {
  return (
    <Link to={`/items/${item.id}`} className={styles.card}>
      <div className={styles.thumbnail}>
        {item.thumbnailPath ? (
          <img src={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/uploads/${item.thumbnailPath}`} alt={item.title} />
        ) : (
          <div className={styles.placeholder}>3D</div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.category}>{item.categoryName ?? '미분류'}</p>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.author}>{item.authorNickname}</p>
      </div>
    </Link>
  );
}
