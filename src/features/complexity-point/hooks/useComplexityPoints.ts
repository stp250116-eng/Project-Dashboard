import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complexityApi } from '../api/complexityApi';
import { buildComplexityAnalytics, filterComplexityRecords } from '../services/complexityAnalytics';
import type { ComplexityFilterState } from '../models/complexityModels';
import type { ComplexitySummary } from '../models/complexityModels';

export interface UseComplexityPointsResult {
  summary: ComplexitySummary | undefined;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export const useComplexityPoints = (
  filters: ComplexityFilterState,
): UseComplexityPointsResult => {
  const query = useQuery({
    queryKey: ['complexity-points'],
    queryFn: () => complexityApi.getComplexityPoints(),
    staleTime: 60_000,
    retry: 1,
  });

  const summary = useMemo<ComplexitySummary | undefined>(() => {
    if (!query.data) {
      return undefined;
    }

    const filtered = filterComplexityRecords(query.data, filters.assignees);

    return buildComplexityAnalytics(filtered, query.data);
  }, [filters.assignees, query.data]);

  return {
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && !query.isError && (query.data?.length ?? 0) === 0,
    error: query.error ?? null,
  };
};
