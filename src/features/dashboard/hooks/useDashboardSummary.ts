import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../services/dashboardService';
import type { DashboardSummary } from '../models/dashboardModels';

export const DASHBOARD_QUERY_KEY = ['dashboard', 'summary'] as const;

/** Loads the executive dashboard summary via React Query. */
export const useDashboardSummary = (): UseQueryResult<DashboardSummary> =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardSummary,
  });
