import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { complexityApi } from '../api/complexityApi';
import { useComplexityPoints } from '../hooks/useComplexityPoints';
import { EMPTY_COMPLEXITY_FILTERS } from '../models/complexityModels';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../api/complexityApi', () => ({
  complexityApi: {
    getComplexityPoints: jest.fn(),
  },
}));

describe('useComplexityPoints', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a summary and marks the state as empty when no records are available', () => {
    const queryFn = jest.fn().mockResolvedValue([]);
    jest.mocked(useQuery).mockImplementation((options: any) => {
      queryFn.mockImplementation(options.queryFn);
      return {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as never;
    });

    const { result } = renderHook(() => useComplexityPoints(EMPTY_COMPLEXITY_FILTERS));

    expect(result.current.summary).toBeDefined();
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.summary?.rows).toEqual([]);
  });

  it('executes the query callback and exposes the resulting summary', async () => {
    const records = [];
    let queryFn: (() => Promise<unknown>) | undefined;

    jest.mocked(complexityApi.getComplexityPoints).mockResolvedValue(records as never);
    jest.mocked(useQuery).mockImplementation((options: any) => {
      queryFn = options.queryFn;

      return {
        data: records,
        isLoading: false,
        isError: false,
        error: null,
      } as never;
    });

    const { result } = renderHook(() => useComplexityPoints(EMPTY_COMPLEXITY_FILTERS));

    await expect(queryFn?.()).resolves.toEqual(records);
    expect(complexityApi.getComplexityPoints).toHaveBeenCalled();
    expect(result.current.summary).toBeDefined();
    expect(result.current.isEmpty).toBe(true);
  });

  it('returns an error state when the query fails', () => {
    const error = new Error('boom');
    jest.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    } as never);

    const { result } = renderHook(() => useComplexityPoints(EMPTY_COMPLEXITY_FILTERS));

    expect(result.current.isEmpty).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.summary).toBeUndefined();
  });
});
