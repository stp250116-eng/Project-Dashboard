import { useQuery } from '@tanstack/react-query';
import { upskillingService } from '../services/upskillingService';

export const TEAM_UPSKILLING_QUERY_KEY = ['dashboard', 'upskilling'] as const;

export const useUpskilling = () =>
  useQuery({
    queryKey: TEAM_UPSKILLING_QUERY_KEY,
    queryFn: () => upskillingService.fetchUpskillingSummary(),
  });
