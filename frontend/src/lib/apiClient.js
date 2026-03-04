import axios from 'axios';
import { API_BASE_URL } from './config';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const isRefreshCall = String(original.url || '').includes('/auth/refresh');

    if (error?.response?.status !== 401 || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = apiClient.post('/auth/refresh').then((res) => res.data.accessToken);
      }
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      useAuthStore.getState().setAccessToken(newAccessToken);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(original);
    } catch (refreshErr) {
      refreshPromise = null;
      useAuthStore.getState().forceLogout();
      return Promise.reject(refreshErr);
    }
  }
);

export default apiClient;