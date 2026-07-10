/**
 * React Query hook for Goal Setting data.
 * Wraps fetchGoalSettingData() with TanStack Query configuration.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchGoalSettingData } from '../api/goalSettingRequests';
import type { DeveloperGoalData } from '../models/goalModels';

const GOAL_SETTING_QUERY_KEY = 'goal-setting' as const;

/**
 * Hook to fetch and manage goal setting data for all developers.
 * @param year The year to fetch goals for (e.g., 2026)
 * @returns Query result with goal data, loading state, and error
 */
export function useGoalSetting(year: number = new Date().getFullYear()): UseQueryResult<DeveloperGoalData[], Error> {
  return useQuery<DeveloperGoalData[], Error>({
    queryKey: [GOAL_SETTING_QUERY_KEY, year],
    queryFn: () => fetchGoalSettingData(year),
    staleTime: 60_000, // 1 minute
    retry: 1,
    enabled: !!year,
  });
}

export { GOAL_SETTING_QUERY_KEY };
