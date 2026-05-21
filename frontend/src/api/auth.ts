import api from './axios';
import type { AuthResponse } from '../types';

export const signup = (email: string, password: string, nickname: string) =>
  api.post('/api/auth/signup', { email, password, nickname });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { email, password });

export const logout = () =>
  api.post('/api/auth/logout');
