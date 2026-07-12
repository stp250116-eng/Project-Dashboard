import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiErrorHandler } from './apiErrorHandler';
import { LoggerService } from '@shared/services/logger';
import { generateUUIDv4 } from '@shared/utils/uuid';

/**
 * Registers request/response interceptors on an Axios instance:
 *  - attaches auth + correlation headers on the way out
 *  - normalizes errors into AppError on the way back
 */
export const registerInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      const maybeCrypto = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto;
      const correlationId = maybeCrypto && typeof maybeCrypto.randomUUID === 'function'
        ? maybeCrypto.randomUUID()
        : generateUUIDv4();
      config.headers.set('X-Correlation-Id', correlationId);
      return config;
    },
    (error) => Promise.reject(apiErrorHandler(error)),
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      const appError = apiErrorHandler(error);
      LoggerService.warn('API request failed', { code: appError.code, status: appError.status });
      return Promise.reject(appError);
    },
  );
};

/**
 * Resolves the current auth token. Replace with the real auth provider
 * integration (e.g. MSAL/OIDC). Kept side-effect free for testability.
 */
const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem('auth_token');
  } catch {
    return null;
  }
};
