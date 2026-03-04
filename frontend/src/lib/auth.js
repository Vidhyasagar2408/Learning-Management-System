import apiClient from './apiClient';
import { useAuthStore } from '../store/authStore';

export async function loginUser(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  useAuthStore.getState().login(data.user, data.accessToken);
  return data;
}

export async function registerUser(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  useAuthStore.getState().login(data.user, data.accessToken);
  return data;
}

export async function logoutUser() {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    useAuthStore.getState().forceLogout();
  }
}