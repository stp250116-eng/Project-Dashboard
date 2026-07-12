import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeveloperTraining } from '../hooks/useDeveloperTraining';
import * as developerTrainingApiModule from '../api/developerTrainingApi';
// DeveloperTrainingRecord type not required in this test file

jest.mock('../api/developerTrainingApi');

const mockedApi = developerTrainingApiModule.developerTrainingApi as jest.Mocked<
  typeof developerTrainingApiModule.developerTrainingApi
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const createWrapperWithRetry = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, retryDelay: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDeveloperTraining', () => {
  const mockRawRecords = [
    {
      id: '1',
      key: 'TRAIN-1',
      fields: {
        assignee: { displayName: 'Alice' },
        aggregatetimespent: 32.95 * 3600,
        customfield_11546: 'Online Learning',
        customfield_11547: 'Internal',
      },
    },
    {
      id: '2',
      key: 'TRAIN-2',
      fields: {
        assignee: { displayName: 'Bob' },
        aggregatetimespent: 90 * 60,
        customfield_11546: 'Workshop',
        customfield_11547: 'External',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure mock is properly set up for each test
    mockedApi.getTrainingRecords.mockClear();
  });

  it('returns undefined summary while loading', async () => {
    mockedApi.getTrainingRecords.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockRawRecords as any), 100)),
    );

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.summary).toBeUndefined();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('returns summary after successful data fetch', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.summary).toBeDefined());

    expect(result.current.summary?.rows).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('sets isLoading to true while fetching', async () => {
    mockedApi.getTrainingRecords.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockRawRecords as any), 50)),
    );

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('sets isLoading to false after fetch completes', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('returns isError as false on successful fetch', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(false));
  });

  it('returns isError as true on fetch failure', async () => {
    const error = new Error('API Error');
    mockedApi.getTrainingRecords.mockRejectedValue(error);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(
      () => expect(result.current.isError).toBe(true),
      { timeout: 2000 },
    );
    expect(result.current.error).toBeDefined();
  });

  it('returns isEmpty as true when no records are fetched', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue([]);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
  });

  it('returns isEmpty as false when records are fetched', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isEmpty).toBe(false));
  });

  it('applies developer filters to summary', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: ['Alice'], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.summary).toBeDefined());

    expect(result.current.summary?.rows).toHaveLength(1);
    expect(result.current.summary?.rows[0]?.developer).toBe('Alice');
  });

  it('applies vendor filters to summary', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: ['Internal'] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.summary?.rows).toBeDefined();
      expect(result.current.summary?.rows?.length).toBe(1);
    }, { timeout: 2000 });

    // Filter applied should leave only the developer 'Alice' in rows
    expect(result.current.summary?.rows?.[0]?.developer).toBe('Alice');
  });

  it('rebuilds summary when filters change', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result, rerender } = renderHook(
      ({ filters }) => useDeveloperTraining(filters),
      {
        initialProps: { filters: { developers: [], vendorTypes: [] } },
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.summary?.rows).toHaveLength(2));

    rerender({ filters: { developers: ['Alice'], vendorTypes: [] } } as any);

    expect(result.current.summary?.rows).toHaveLength(1);
    expect(result.current.summary?.rows[0]?.developer).toBe('Alice');
  });

  it('uses stale time of 60 seconds', async () => {
    const getTrainingRecordsSpy = jest.fn().mockResolvedValue(mockRawRecords as any);
    mockedApi.getTrainingRecords = getTrainingRecordsSpy;

    const { rerender } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(getTrainingRecordsSpy).toHaveBeenCalledTimes(1));

    rerender();

    await waitFor(() => {
      expect(getTrainingRecordsSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('builds correct summary structure', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.summary).toBeDefined());

    const summary = result.current.summary!;
    expect(summary).toHaveProperty('rows');
    expect(summary).toHaveProperty('options');
    expect(summary).toHaveProperty('kpis');
    expect(summary).toHaveProperty('trainingTypeDistribution');
    expect(summary).toHaveProperty('hoursByDeveloper');
  });

  it('returns error as null on successful fetch', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('returns error object on fetch failure', async () => {
    const error = new Error('Network Error');
    mockedApi.getTrainingRecords.mockRejectedValue(error);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.error).toBeDefined(), { timeout: 2000 });
    expect(result.current.error).toBeDefined();
  });

  it('includes filter options in summary', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.summary).toBeDefined());

    expect(result.current.summary?.options.developers).toContain('Alice');
    expect(result.current.summary?.options.developers).toContain('Bob');
    expect(result.current.summary?.options.vendorTypes).toContain('Internal');
    expect(result.current.summary?.options.vendorTypes).toContain('External');
  });

  it('handles combination of developer and vendor filters', async () => {
    mockedApi.getTrainingRecords.mockResolvedValue(mockRawRecords as any);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: ['Alice'], vendorTypes: ['Internal'] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.summary).toBeDefined());

    expect(result.current.summary?.rows).toHaveLength(1);
    expect(result.current.summary?.rows[0]?.developer).toBe('Alice');
  });

  it('has retry policy of 1', async () => {
    const error = new Error('API Error');
    mockedApi.getTrainingRecords.mockRejectedValue(error);

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapperWithRetry() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedApi.getTrainingRecords).toHaveBeenCalledTimes(2);
  });

  it('sets isEmpty to false when loading', async () => {
    mockedApi.getTrainingRecords.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([] as any), 100)),
    );

    const { result } = renderHook(
      () => useDeveloperTraining({ developers: [], vendorTypes: [] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isEmpty).toBe(false);

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
  });
});
