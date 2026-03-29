import { Platform } from 'react-native';
import axios from 'axios';
import {
  getAuthToken,
  getRecommendationHistoryStorage,
  saveRecommendationRecord,
} from '../utils/storage';

function getExpoHostIp() {
  try {
    // eslint-disable-next-line global-require
    const Constants = require('expo-constants').default;
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost;

    if (!hostUri || typeof hostUri !== 'string') {
      return null;
    }

    return hostUri.split(':')[0];
  } catch {
    return null;
  }
}

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }

  const expoHostIp = getExpoHostIp();
  if (expoHostIp) {
    return `http://${expoHostIp}:8000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://127.0.0.1:8000';
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const login = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const getRecommendation = async (payload) => {
  const response = await api.post('/recommend', payload);
  const recommendation = {
    ...response.data,
    id: response.data?.id || `live-${Date.now()}`,
    created_at: response.data?.created_at || new Date().toISOString(),
  };

  await saveRecommendationRecord(recommendation);
  return recommendation;
};

export const getHistory = async () => getRecommendationHistoryStorage();

export default api;
