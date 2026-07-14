import { useQuery } from '@tanstack/react-query';
import { teamGoalService } from '../services/teamGoalService';

export const TEAM_GOAL_QUERY_KEY = ['dashboard', 'teamGoal'] as const;

export const useTeamGoal = () =>
  useQuery({
    queryKey: TEAM_GOAL_QUERY_KEY,
    queryFn: () => teamGoalService.fetchTeamGoalSummary(),
  });
