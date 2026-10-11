import axios from 'axios';

/**
 * Dynamically resolves the backend root URL (e.g. http://localhost:8000),
 * keeping the hostname aligned with window.location if running on localhost or 127.0.0.1.
 */
export function getBackendRootUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  let root = envUrl.replace(/\/api\/?$/, '');
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === '127.0.0.1' && root.includes('localhost')) {
      root = root.replace('localhost', '127.0.0.1');
    } else if (window.location.hostname === 'localhost' && root.includes('127.0.0.1')) {
      root = root.replace('127.0.0.1', 'localhost');
    }
  }
  return root;
}

export function getApiBaseUrl(): string {
  return `${getBackendRootUrl()}/api`;
}

export const backendRootUrl = getBackendRootUrl();

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  timeout: 15000,
});

// Interceptor: When uploading FormData, remove Content-Type so browser XHR
// can auto-set the correct multipart/form-data; boundary=... header.
// IMPORTANT: Axios 1.x uses AxiosHeaders class internally — the JS `delete`
// operator does NOT reliably remove headers from it. Must use .delete() method.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // AxiosHeaders.delete() is the only reliable way to clear a header in Axios 1.x
    config.headers.delete('Content-Type');
  }
  return config;
});

/**
 * Initialize CSRF protection with Laravel Sanctum
 */
export async function getCsrfCookie(): Promise<void> {
  const root = getBackendRootUrl();
  await axios.get(`${root}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
    },
  });
}

export default api;
