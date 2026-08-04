import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API } from '@/constants';

/**
 * Axios instance configured for the AFC API.
 * - Sends HTTP-only cookies with every request (withCredentials).
 * - Silently refreshes the access token once on a 401 via the refresh endpoint,
 *   then retries the original request.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API.baseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<boolean> | null = null;

const tryRefresh = async (): Promise<boolean> => {
  try {
    const res = await axios.post(`${API.baseUrl}/auth/refresh`, null, {
      withCredentials: true,
      timeout: 10000,
    });
    return res.status === 200;
  } catch {
    return false;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && config && !config._retried && !config.url?.includes('/auth/')) {
      config._retried = true;
      refreshPromise ??= tryRefresh().finally(() => {
        refreshPromise = null;
      });
      const ok = await refreshPromise;
      if (ok) {
        return apiClient.request(config);
      }
      // Force a client-side re-auth by dispatching a custom event the auth
      // store listens to.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('afc:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
