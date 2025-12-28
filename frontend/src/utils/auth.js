/**
 * 認證工具函式
 * 處理 JWT token 的儲存、取得、驗證等功能
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:11451";

/**
 * 儲存 access token 到 localStorage
 * @param {string} token - JWT access token
 * @param {number} expiresIn - token 有效期間（秒）
 */
export function saveToken(token, expiresIn) {
  localStorage.setItem("access_token", token);
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem("token_expires_at", expiresAt.toString());
}

/**
 * 從 localStorage 取得 access token
 * @returns {string|null} JWT access token 或 null
 */
export function getToken() {
  return localStorage.getItem("access_token");
}

/**
 * 檢查 token 是否已過期
 * @returns {boolean} true 表示已過期或不存在
 */
export function isTokenExpired() {
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
}

/**
 * 清除所有認證相關的 localStorage 資料
 */
export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("user_info");
}

/**
 * 使用者登入
 * @param {string} username - 使用者名稱
 * @param {string} password - 密碼
 * @returns {Promise<Object>} 登入結果
 */
export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();

    if (data.access_token) {
      saveToken(data.access_token, data.expires_in);
      return { success: true, data };
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 使用者登出
 */
export function logout() {
  clearAuth();
  // 可以選擇導向到登入頁面
  // window.location.href = "/login";
}

/**
 * 獲取當前使用者資訊
 * @returns {Promise<Object|null>} 使用者資訊或 null
 */
export async function getCurrentUser() {
  const token = getToken();

  if (!token || isTokenExpired()) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
      }
      return null;
    }

    const userInfo = await response.json();
    localStorage.setItem("user_info", JSON.stringify(userInfo));
    return userInfo;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

/**
 * 從 localStorage 取得快取的使用者資訊
 * @returns {Object|null} 使用者資訊或 null
 */
export function getCachedUserInfo() {
  const userInfoStr = localStorage.getItem("user_info");
  if (!userInfoStr) return null;
  try {
    return JSON.parse(userInfoStr);
  } catch {
    return null;
  }
}

/**
 * 檢查使用者是否已登入
 * @returns {boolean} true 表示已登入且 token 有效
 */
export function isAuthenticated() {
  return !!getToken() && !isTokenExpired();
}

/**
 * 使用 token 發送 API 請求
 * @param {string} url - API endpoint URL
 * @param {Object} options - fetch options
 * @returns {Promise<Response>} fetch response
 */
export async function fetchWithAuth(url, options = {}) {
  const token = getToken();

  // 如果 token 過期，清除並可選擇導向登入頁
  if (isTokenExpired()) {
    clearAuth();
    // window.location.href = "/login";
    throw new Error("Token expired");
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  // 如果有 token，加入 Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 如果回應是 401，清除認證資料
  if (response.status === 401) {
    clearAuth();
    // window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}
