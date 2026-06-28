import { useMemo, useState } from 'react';
import { useJiraOverdueIssues } from '@integrations/jira';
import { buildOverduePointAnalytics, buildOverduePointSummary } from '../services/overduePointAnalytics';
import type {
  OverduePointFilterState,
  OverduePointSummary,
  OverduePointAnalytics,
  OverduePointRecord,
} from '../models/overduePointModels';
import type { RawJiraIssue } from '@integrations/jira';

const toOverduePointRecord = (issue: RawJiraIssue): OverduePointRecord => ({
  developer: issue.fields.assignee?.displayName ?? 'Unassigned',
  parentIssueId: issue.fields.parent?.key ?? 'Unknown',
  parentIssueSummary: issue.fields.parent?.fields.summary ?? 'No parent summary',
  releaseVersion: issue.fields.fixVersions?.[0]?.name ?? 'No Release',
});

export interface UseOverduePointDashboardResult {
  summary: OverduePointSummary | undefined;
  analytics: OverduePointAnalytics | undefined;
  filters: OverduePointFilterState;
  setFilters: (next: OverduePointFilterState) => void;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export const useOverduePointDashboard = (
  initialFilters: OverduePointFilterState,
): UseOverduePointDashboardResult => {
  const [filters, setFilters] = useState<OverduePointFilterState>(initialFilters);

  const query = useJiraOverdueIssues(true);

  const records = useMemo<OverduePointRecord[]>(() => {
    if (!query.data) return [];
    return query.data.map(toOverduePointRecord);
  }, [query.data]);

  const summary = useMemo<OverduePointSummary | undefined>(() => {
    if (records.length === 0) return undefined;
    return buildOverduePointSummary(records, filters);
  }, [filters, records]);

  const analytics = useMemo<OverduePointAnalytics | undefined>(() => {
    if (records.length === 0) return undefined;
    return buildOverduePointAnalytics(records, filters);
  }, [filters, records]);

  return {
    summary,
    analytics,
    filters,
    setFilters,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && !query.isError && (query.data?.length ?? 0) === 0,
    error: query.error ?? null,
  };
};
