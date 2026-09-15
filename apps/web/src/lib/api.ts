import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true, // Send HttpOnly cookies with every request
});

// ── CSRF Token Management ────────────────────────
let csrfToken: string | null = null;

/**
 * Fetch a CSRF token from the server and cache it.
 */
async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  try {
    const { data } = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = data.csrfToken;
    return csrfToken!;
  } catch {
    return '';
  }
}

/**
 * Clear cached CSRF token (called on logout or auth failure).
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

// ── Request Interceptor ──────────────────────────
// Attach CSRF token to state-changing requests.
// No need to attach JWT — it's sent automatically via HttpOnly cookie.
api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await fetchCsrfToken();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  return config;
});

// ── Response Interceptor ─────────────────────────
// Handle 401 by attempting a cookie-based token refresh.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh — the refresh_token cookie is sent automatically
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        // Refresh succeeded — new cookies are set by the server
        // Clear cached CSRF token so we get a fresh one
        clearCsrfToken();

        // Retry the original request (new access_token cookie is now set)
        return api(originalRequest);
      } catch {
        // Refresh failed — session is dead.
        // Clear CSRF cache and let the useAuth hook / Next.js middleware handle redirect.
        clearCsrfToken();
        if (typeof window !== 'undefined') {
          // Clear only non-sensitive profile cache — JWT tokens are in HttpOnly cookies
          localStorage.removeItem('user');
          // Redirect to login; preserve current path as callbackUrl
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?callbackUrl=${callbackUrl}`;
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
