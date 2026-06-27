import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export interface ReleaseRow {
  id: string;
  name: string;
  status: 'Planned' | 'In Progress' | 'Released';
  readiness: number;
  targetDate: string;
}

const fetchReleases = async (): Promise<ReleaseRow[]> =>
  Promise.resolve([
    { id: 'r1', name: '2026.06', status: 'In Progress', readiness: 72, targetDate: '2026-06-30' },
    { id: 'r2', name: '2026.07', status: 'Planned', readiness: 18, targetDate: '2026-07-31' },
    { id: 'r3', name: '2026.05', status: 'Released', readiness: 100, targetDate: '2026-05-31' },
  ]);

export const RELEASE_QUERY_KEY = ['release-dashboard'] as const;

export const useReleases = (): UseQueryResult<ReleaseRow[]> =>
  useQuery({ queryKey: RELEASE_QUERY_KEY, queryFn: fetchReleases });
