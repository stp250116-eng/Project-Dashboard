import { AxiosError, AxiosHeaders } from 'axios';
import { apiErrorHandler } from './apiErrorHandler';

const makeAxiosError = (status?: number, code?: string): AxiosError => {
  const error = new AxiosError('failed', code);
  if (status !== undefined) {
    error.response = {
      status,
      statusText: '',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return error;
};

describe('apiErrorHandler', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // apiErrorHandler intentionally logs via LoggerService, whose sanctioned
    // fallback is console.error/warn. These suite cases exercise those error
    // paths on purpose, so silence the expected output to keep test logs clean.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('maps network errors', () => {
    const result = apiErrorHandler(makeAxiosError(undefined, 'ERR_NETWORK'));
    expect(result.code).toBe('NETWORK_ERROR');
  });

  it('maps 401 to UNAUTHORIZED', () => {
    expect(apiErrorHandler(makeAxiosError(401)).code).toBe('UNAUTHORIZED');
  });

  it('maps 403 to FORBIDDEN', () => {
    expect(apiErrorHandler(makeAxiosError(403)).code).toBe('FORBIDDEN');
  });

  it('maps 404 to NOT_FOUND', () => {
    expect(apiErrorHandler(makeAxiosError(404)).code).toBe('NOT_FOUND');
  });

  it('maps 500 to SERVER_ERROR', () => {
    expect(apiErrorHandler(makeAxiosError(500)).code).toBe('SERVER_ERROR');
  });

  it('maps unknown non-axios errors', () => {
    expect(apiErrorHandler(new Error('x')).code).toBe('UNKNOWN_ERROR');
  });

  it('never leaks raw messages', () => {
    const result = apiErrorHandler(makeAxiosError(500));
    expect(result.message).not.toContain('failed');
  });

  it('maps an unexpected status to a generic HTTP code', () => {
    const result = apiErrorHandler(makeAxiosError(418));
    expect(result.code).toBe('HTTP_418');
    expect(result.status).toBe(418);
  });

  it('maps an Axios error without a status to HTTP_UNKNOWN', () => {
    const result = apiErrorHandler(makeAxiosError());
    expect(result.code).toBe('HTTP_UNKNOWN');
    expect(result.status).toBeUndefined();
  });

  it('captures the correlation id from the response headers', () => {
    const error = new AxiosError('failed');
    error.response = {
      status: 400,
      statusText: '',
      data: {},
      headers: { 'x-correlation-id': 'corr-42' },
      config: { headers: new AxiosHeaders() },
    };
    const result = apiErrorHandler(error);
    expect(result.code).toBe('HTTP_400');
    expect(result.correlationId).toBe('corr-42');
  });
});
