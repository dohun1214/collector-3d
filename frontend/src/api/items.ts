import api from './axios';
import type { ItemDetail, ItemSummary, JobStatus, PageResponse } from '../types';

export const getItems = (params?: { keyword?: string; categoryId?: number; page?: number; size?: number }) =>
  api.get<PageResponse<ItemSummary>>('/api/items', { params });

export const getItem = (id: number) =>
  api.get<ItemDetail>(`/api/items/${id}`);

export const getMyItems = () =>
  api.get<ItemSummary[]>('/api/items/my');

export const createItem = (data: { title: string; description?: string; categoryId?: number; isPublic: boolean }) =>
  api.post<ItemDetail>('/api/items', data);

export const updateItem = (id: number, data: { title: string; description?: string; categoryId?: number; isPublic: boolean }) =>
  api.put<ItemDetail>(`/api/items/${id}`, data);

export const deleteItem = (id: number) =>
  api.delete(`/api/items/${id}`);

export const uploadFiles = (id: number, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return api.post<JobStatus>(`/api/items/${id}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getJobStatus = (id: number) =>
  api.get<JobStatus>(`/api/items/${id}/job`);
