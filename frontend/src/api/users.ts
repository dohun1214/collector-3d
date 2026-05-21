import api from './axios';
import type { UserProfile, ItemSummary, PageResponse } from '../types';

export const getUserProfile = (nickname: string) =>
  api.get<UserProfile>(`/api/users/${nickname}`);

export const getUserItems = (nickname: string, page = 0, size = 20) =>
  api.get<PageResponse<ItemSummary>>(`/api/users/${nickname}/items`, { params: { page, size } });
