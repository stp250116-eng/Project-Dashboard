import { useMemo } from 'react';
import { useJiraDefects } from '@integrations/jira';
import type { UseQueryResult } from '@tanstack/react-query';
import type { JiraDefect } from '@integrations/jira';
import { buildDefectAnalytics } from '../services/defectAnalytics';
import type { DefectAnalytics, DefectFilterState } from '../models/defectModels';

/** Loads the live "GET ALM DEFECT" Jira filter as the dashboard's data source. */
export const useDefectRecords = (): UseQueryResult<JiraDefect[]> => useJiraDefects();

export interface UseDefectAnalyticsResult {
  analytics: DefectAnalytics | undefined;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
}

/**
 * Loads defects once via React Query, then derives all KPIs and chart datasets
 * client-side for the current filter/group-by selection. Because the heavy
 * computation is memoized on the inputs, changing a filter recomputes instantly
 * without re-fetching or reloading the page.
 *
 * Server-side filtering is handled by the Jira saved filter (the JQL); the
 * interactive multi-selects refine that result set here.
 */
export const useDefectAnalytics = (
  filters: DefectFilterState,
): UseDefectAnalyticsResult => {
  const { data, isLoading, isError, error } = useDefectRecords();

  const analytics = useMemo<DefectAnalytics | undefined>(
    () => (data ? buildDefectAnalytics(data, filters) : undefined),
    [data, filters],
  );

  return {
    analytics,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && (data?.length ?? 0) === 0,
    error: error ?? null,
  };
};
