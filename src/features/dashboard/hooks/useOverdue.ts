import { useQuery } from '@tanstack/react-query';
import { overdueService } from '../services/overdueService';

export const TEAM_OVERDUE_QUERY_KEY = ['dashboard', 'overdue'] as const;

export const useOverdue = () =>
  useQuery({
    queryKey: TEAM_OVERDUE_QUERY_KEY,
    queryFn: () => overdueService.fetchOverdueSummary(),
  });
