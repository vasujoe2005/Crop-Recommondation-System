import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'crop_ai_token';
const USER_KEY = 'crop_ai_user';
const HISTORY_KEY = 'crop_ai_recommendation_history';

function sanitizeUserSegment(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildUserHistoryKey(user) {
  const identity =
    sanitizeUserSegment(user?.email) ||
    sanitizeUserSegment(user?.phone) ||
    sanitizeUserSegment(user?.name);

  return identity ? `${HISTORY_KEY}_${identity}` : HISTORY_KEY;
}

async function getCurrentHistoryKey() {
  const user = await getStoredUser();
  return buildUserHistoryKey(user);
}

export async function saveSession({ token, user }) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user || {})],
  ]);
}

export async function getAuthToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser() {
  const rawUser = await AsyncStorage.getItem(USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getRecommendationHistoryStorage() {
  const historyKey = await getCurrentHistoryKey();
  const rawHistory = await AsyncStorage.getItem(historyKey);
  return rawHistory ? JSON.parse(rawHistory) : [];
}

export async function saveRecommendationRecord(record) {
  const historyKey = await getCurrentHistoryKey();
  const existing = await getRecommendationHistoryStorage();
  const nextHistory = [record, ...existing].slice(0, 30);
  await AsyncStorage.setItem(historyKey, JSON.stringify(nextHistory));
  return nextHistory;
}
