export interface User {
  nickname: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  nickname: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ItemSummary {
  id: number;
  title: string;
  categoryId: number | null;
  categoryName: string | null;
  isPublic: boolean;
  thumbnailPath: string | null;
  authorId: number;
  authorNickname: string;
  createdAt: string;
}

export interface ItemDetail {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  isPublic: boolean;
  plyPath: string | null;
  thumbnailPath: string | null;
  authorId: number;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface JobStatus {
  id: number;
  itemId: number;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  progress: number;
}
