import { API_BASE } from './api';

// Keep credentials in the current browser session; never persist the password.
export function saveToken(token, expiresIn) {
  clearAuth();
  sessionStorage.setItem('access_token', token);
  sessionStorage.setItem('token_expires_at', String(Date.now() + expiresIn * 1000));
}

export function getToken() {
  return sessionStorage.getItem('access_token');
}

export function isTokenExpired() {
  const expiresAt = Number(sessionStorage.getItem('token_expires_at'));
  return !Number.isFinite(expiresAt) || Date.now() >= expiresAt;
}

export function clearAuth() {
  for (const key of ['access_token', 'token_expires_at', 'user_info']) {
    sessionStorage.removeItem(key);
    // Remove credentials left by the previous demo implementation as well.
    localStorage.removeItem(key);
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const messages = {
        401: '電子郵件或密碼不正確，請再試一次。',
        422: '請填寫有效的電子郵件與密碼。',
        429: '嘗試次數過多，請稍後再試。',
      };
      return { success: false, error: messages[response.status] || '登入服務暫時無法使用，請稍後再試。' };
    }
    const data = await response.json();
    if (!data.access_token || !data.user || !Number.isFinite(data.expires_in)) {
      return { success: false, error: '登入回應異常，請稍後再試。' };
    }
    saveToken(data.access_token, data.expires_in);
    sessionStorage.setItem('user_info', JSON.stringify(data.user));
    return { success: true, data };
  } catch {
    return { success: false, error: '無法連線至登入服務，請確認網路後重試。' };
  }
}

export function logout() {
  clearAuth();
}

export async function getCurrentUser() {
  if (!getToken() || isTokenExpired()) {
    clearAuth();
    return null;
  }
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) clearAuth();
      return null;
    }
    const user = await response.json();
    sessionStorage.setItem('user_info', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export function getCachedUserInfo() {
  if (!isAuthenticated()) return null;
  try { return JSON.parse(sessionStorage.getItem('user_info')); }
  catch { return null; }
}

export function isAuthenticated() {
  return Boolean(getToken()) && !isTokenExpired();
}

export async function fetchWithAuth(url, options = {}) {
  if (!isAuthenticated()) {
    clearAuth();
    throw new Error('登入已過期，請重新登入。');
  }
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${getToken()}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearAuth();
    throw new Error('登入已失效，請重新登入。');
  }
  return response;
}
