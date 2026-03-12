import { login, register } from './api';
import {
  clearSession,
  getAuthToken,
  getStoredUser,
  saveSession,
} from '../utils/storage';

function normalizeUser(response, fallbackPayload = {}) {
  return (
    response?.user || {
      name: fallbackPayload.name || response?.name || '',
      email: fallbackPayload.email || response?.email || '',
      phone: fallbackPayload.phone || response?.phone || '',
    }
  );
}

function normalizeToken(response) {
  return response?.access_token || response?.token || response?.jwt;
}

export async function loginUser(credentials) {
  const response = await login(credentials);
  const token = normalizeToken(response);

  if (!token) {
    throw new Error('Token missing in login response.');
  }

  const session = {
    token,
    user: normalizeUser(response, credentials),
  };

  await saveSession(session);
  return session;
}

export async function registerUser(payload) {
  return register(payload);
}

export async function hydrateSession() {
  const token = await getAuthToken();
  const user = await getStoredUser();

  if (!token) {
    return null;
  }

  return { token, user };
}

export async function logoutUser() {
  await clearSession();
}
