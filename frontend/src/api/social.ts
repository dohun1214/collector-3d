import api from './axios';
import type { LikeResponse, SaveResponse, CommentResponse, ItemSummary } from '../types';

export const toggleLike = (itemId: number) =>
  api.post<LikeResponse>(`/api/items/${itemId}/like`);

export const toggleSave = (itemId: number) =>
  api.post<SaveResponse>(`/api/items/${itemId}/save`);

export const getComments = (itemId: number) =>
  api.get<CommentResponse[]>(`/api/items/${itemId}/comments`);

export const addComment = (itemId: number, content: string) =>
  api.post<CommentResponse>(`/api/items/${itemId}/comments`, { content });

export const deleteComment = (commentId: number) =>
  api.delete(`/api/comments/${commentId}`);

export const getSavedItems = () =>
  api.get<ItemSummary[]>('/api/items/saved');
