// /src/api/client.ts
import axios from 'axios';
import { ENV } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
});

apiClient.interceptors.request.use(async config => {
  // Skip attaching JWT for auth exchange
  if (config.url?.includes('/auth/firebase-login')) {
    return config;
  }

  const jwt = await AsyncStorage.getItem('AUTH_TOKEN');

  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }

  return config;
});