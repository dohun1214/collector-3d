import api from './axios';
import type { Category } from '../types';

export const getCategories = () =>
  api.get<Category[]>('/api/categories');
