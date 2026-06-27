import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export interface TeamMemberCapacity {
  id: string;
  name: string;
  assignedPoints: number;
  capacityPoints: number;
  utilization: number;
}

const fetchCapacity = async (): Promise<TeamMemberCapacity[]> =>
  Promise.resolve([
    { id: 't1', name: 'A. Patel', assignedPoints: 18, capacityPoints: 20, utilization: 90 },
    { id: 't2', name: 'M. Chen', assignedPoints: 22, capacityPoints: 20, utilization: 110 },
    { id: 't3', name: 'R. Gomez', assignedPoints: 12, capacityPoints: 20, utilization: 60 },
  ]);

export const TEAM_CAPACITY_QUERY_KEY = ['team-capacity'] as const;

export const useTeamCapacity = (): UseQueryResult<TeamMemberCapacity[]> =>
  useQuery({ queryKey: TEAM_CAPACITY_QUERY_KEY, queryFn: fetchCapacity });
