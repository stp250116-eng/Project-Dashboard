import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export interface ReportRow {
  id: string;
  name: string;
  category: string;
  lastRun: string;
  format: 'Excel' | 'PDF';
}

const fetchReports = async (): Promise<ReportRow[]> =>
  Promise.resolve([
    { id: 'rp1', name: 'Sprint Summary', category: 'Agile', lastRun: '2026-06-12', format: 'Excel' },
    { id: 'rp2', name: 'Defect Aging', category: 'Quality', lastRun: '2026-06-11', format: 'PDF' },
    { id: 'rp3', name: 'Release Readiness', category: 'Delivery', lastRun: '2026-06-10', format: 'Excel' },
  ]);

export const REPORTS_QUERY_KEY = ['reports'] as const;

export const useReports = (): UseQueryResult<ReportRow[]> =>
  useQuery({ queryKey: REPORTS_QUERY_KEY, queryFn: fetchReports });
