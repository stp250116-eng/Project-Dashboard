import { useQuery } from '@tanstack/react-query';
import { defectService } from '../services/defectService';

export const TEAM_DEFECTS_QUERY_KEY = ['dashboard', 'defects'] as const;

export const useDefects = () =>
  useQuery({
    queryKey: TEAM_DEFECTS_QUERY_KEY,
    queryFn: () => defectService.fetchDefectSummary(),
  });
