const TOKEN_KEY = "zera_token";
const USER_KEY = "zera_user";

export function saveAuthSession(data) {
  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "{}");
  } catch {
    return {};
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
