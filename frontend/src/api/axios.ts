import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nickname');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
