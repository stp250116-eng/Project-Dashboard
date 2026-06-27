import { apiClient, httpGet, httpPost, createApiClient } from './apiClient';

describe('apiClient', () => {
  afterEach(() => jest.restoreAllMocks());

  it('creates an Axios instance with the provided base URL', () => {
    const instance = createApiClient('https://example.test/api');
    expect(instance.defaults.baseURL).toBe('https://example.test/api');
    expect(instance.defaults.timeout).toBe(30_000);
  });

  it('httpGet returns the response body', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({ data: { value: 42 } });
    await expect(httpGet<{ value: number }>('/thing')).resolves.toEqual({ value: 42 });
    expect(apiClient.get).toHaveBeenCalledWith('/thing', undefined);
  });

  it('httpPost sends the body and returns the response body', async () => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 'abc' } });
    await expect(httpPost<{ id: string }>('/thing', { name: 'x' })).resolves.toEqual({
      id: 'abc',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/thing', { name: 'x' }, undefined);
  });
});
