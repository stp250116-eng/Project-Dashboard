import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { developerTrainingApi } from '../api/developerTrainingApi';
import { mapTrainingRecords } from '../services/developerTrainingMapper';
import { buildDeveloperTrainingSummary } from '../services/developerTrainingAnalytics';
import type {
  DeveloperTrainingFilterState,
  DeveloperTrainingSummary,
} from '../models/developerTrainingModels';

export interface UseDeveloperTrainingResult {
  summary: DeveloperTrainingSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export const useDeveloperTraining = (
  filters: DeveloperTrainingFilterState,
): UseDeveloperTrainingResult => {
  const query = useQuery({
    queryKey: ['developer-training'],
    queryFn: async () => {
      const raw = await developerTrainingApi.getTrainingRecords();
      return mapTrainingRecords(raw);
    },
    staleTime: 60_000,
    retry: 1,
  });

  const summary = useMemo<DeveloperTrainingSummary | undefined>(() => {
    if (!query.data) return undefined;
    return buildDeveloperTrainingSummary(query.data, filters);
  }, [filters, query.data]);

  const normalizedError: Error | null = (() => {
    if (!query.error) return null;
    if (query.error instanceof Error) return query.error;
    // Coerce unknown errors into an Error with a sensible message
    try {
      const maybeMessage = (query.error as any)?.message ?? String(query.error);
      return new Error(maybeMessage);
    } catch (e) {
      return new Error('Unknown error');
    }
  })();

  return {
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && !query.isError && (query.data?.length ?? 0) === 0,
    error: normalizedError,
  };
};
