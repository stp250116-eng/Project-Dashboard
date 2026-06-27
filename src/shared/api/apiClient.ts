import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { appConfig } from '@shared/constants/appConfig';
import { registerInterceptors } from './interceptors';

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Factory for creating configured Axios instances. Centralizing this keeps
 * timeout, headers, and interceptor wiring consistent across the app.
 */
export const createApiClient = (baseURL: string = appConfig.apiBaseUrl): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  registerInterceptors(instance);
  return instance;
};

/** Shared default client for internal APIs. */
export const apiClient = createApiClient();

/**
 * Thin typed helpers so feature code never touches the raw Axios surface.
 */
export const httpGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient.get<T>(url, config);
  return data;
};

export const httpPost = async <T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
};
