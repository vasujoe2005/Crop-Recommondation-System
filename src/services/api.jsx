import axios from 'axios';
import { buildStaticRecommendation } from '../utils/mockRecommendations';
import {
  getAuthToken,
  getRecommendationHistoryStorage,
  saveRecommendationRecord,
} from '../utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.11.7.105:8000';
const USE_STATIC_RECOMMENDATIONS = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
  if (USE_STATIC_RECOMMENDATIONS) {
    const recommendation = buildStaticRecommendation(payload);
    await saveRecommendationRecord(recommendation);
    return recommendation;
  }

  const response = await api.post('/recommend', payload);
  return response.data;
};

export const getHistory = async () => {
  if (USE_STATIC_RECOMMENDATIONS) {
    return getRecommendationHistoryStorage();
  }

  return getRecommendationHistoryStorage();
};

export default api;
