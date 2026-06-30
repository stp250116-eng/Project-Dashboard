import axios, { AxiosError, AxiosHeaders, type AxiosInstance } from 'axios';
import { registerInterceptors } from './interceptors';
import { LoggerService } from '@shared/services/logger';

interface InterceptorHandler<V> {
  fulfilled: (value: V) => V | Promise<V>;
  rejected: (error: unknown) => unknown;
}

const getHandlers = <V>(
  manager: { handlers: Array<InterceptorHandler<V>> },
): InterceptorHandler<V> => manager.handlers[0];

const makeInstance = (): AxiosInstance => {
  const instance = axios.create();
  registerInterceptors(instance);
  return instance;
};

describe('registerInterceptors — request', () => {
  beforeEach(() => {
    // The error paths below log via LoggerService's sanctioned console
    // fallback; silence the expected output to keep test logs clean.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('attaches a bearer token and correlation id when a token exists', async () => {
    sessionStorage.setItem('auth_token', 'token-123');
    const instance = makeInstance();
    const request = getHandlers(
      (instance.interceptors.request as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const config = { headers: new AxiosHeaders() };
    const result = (await request.fulfilled(config)) as typeof config;

    expect(result.headers.get('Authorization')).toBe('Bearer token-123');
    expect(result.headers.get('X-Correlation-Id')).toBeTruthy();
  });

  it('omits the Authorization header when there is no token', async () => {
    const instance = makeInstance();
    const request = getHandlers(
      (instance.interceptors.request as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const config = { headers: new AxiosHeaders() };
    const result = (await request.fulfilled(config)) as typeof config;

    expect(result.headers.get('Authorization')).toBeUndefined();
    expect(result.headers.get('X-Correlation-Id')).toBeTruthy();
  });

  it('falls back to the UUID helper when randomUUID is unavailable', async () => {
    const originalRandomUUID = (globalThis.crypto as Crypto & { randomUUID?: () => string }).randomUUID;
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    });

    const instance = makeInstance();
    const request = getHandlers(
      (instance.interceptors.request as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const config = { headers: new AxiosHeaders() };
    const result = (await request.fulfilled(config)) as typeof config;

    expect(result.headers.get('X-Correlation-Id')).toMatch(/^[0-9a-f-]{8,}$/i);

    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      value: originalRandomUUID,
      configurable: true,
    });
  });

  it('treats sessionStorage failures as an absent token', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const instance = makeInstance();
    const request = getHandlers(
      (instance.interceptors.request as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const config = { headers: new AxiosHeaders() };
    const result = (await request.fulfilled(config)) as typeof config;

    expect(result.headers.get('Authorization')).toBeUndefined();
  });

  it('normalizes request errors into an AppError', async () => {
    const instance = makeInstance();
    const request = getHandlers(
      (instance.interceptors.request as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    await expect(request.rejected(new Error('outbound failure'))).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
    });
  });
});

describe('registerInterceptors — response', () => {
  beforeEach(() => {
    // The error paths below log via LoggerService's sanctioned console
    // fallback; silence the expected output to keep test logs clean.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('passes successful responses through untouched', () => {
    const instance = makeInstance();
    const response = getHandlers(
      (instance.interceptors.response as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const payload = { data: 'ok' };
    expect(response.fulfilled(payload)).toBe(payload);
  });

  it('normalizes response errors and logs a warning', async () => {
    const warnSpy = jest.spyOn(LoggerService, 'warn').mockImplementation(() => undefined);
    const instance = makeInstance();
    const response = getHandlers(
      (instance.interceptors.response as unknown) as { handlers: InterceptorHandler<unknown>[] },
    );

    const axiosError = new AxiosError('failed', undefined, undefined, undefined, {
      status: 500,
      statusText: 'Server Error',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    });

    await expect(response.rejected(axiosError)).rejects.toMatchObject({ code: 'SERVER_ERROR' });
    expect(warnSpy).toHaveBeenCalledWith(
      'API request failed',
      expect.objectContaining({ code: 'SERVER_ERROR', status: 500 }),
    );
  });
});
