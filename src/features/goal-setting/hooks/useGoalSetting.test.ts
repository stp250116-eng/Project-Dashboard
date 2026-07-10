/**
 * Unit tests for useGoalSetting hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useGoalSetting } from './useGoalSetting';
import * as requests from '../api/goalSettingRequests';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import React from 'react';

jest.mock('../api/goalSettingRequests');

const mockFetchGoalSettingData = requests.fetchGoalSettingData as jest.MockedFunction<
  typeof requests.fetchGoalSettingData
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGoalSetting', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches goal data successfully', async () => {
    const mockData = [
      {
        developerId: 'dev-1',
        name: 'Alice',
        role: 'Engineer',
        team: 'Platform',
        goals: {} as any,
        overallScore: 85.5,
        rank: 1,
      },
    ];

    mockFetchGoalSettingData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useGoalSetting(2026), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('uses default current year when no year provided', async () => {
    const mockData: any[] = [];
    mockFetchGoalSettingData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useGoalSetting(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchGoalSettingData).toHaveBeenCalledWith(new Date().getFullYear());
  });

  it('refetches when year changes', async () => {
    const mockData: any[] = [];
    mockFetchGoalSettingData.mockResolvedValue(mockData);

    const { result, rerender } = renderHook((year) => useGoalSetting(year), {
      initialProps: 2025,
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchGoalSettingData).toHaveBeenCalledWith(2025);

    // Change year
    rerender(2026);

    await waitFor(() => {
      expect(mockFetchGoalSettingData).toHaveBeenCalledWith(2026);
    });

    expect(mockFetchGoalSettingData).toHaveBeenCalledTimes(2);
  });
});
