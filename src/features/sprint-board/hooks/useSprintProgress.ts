import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ChartSeriesPoint } from '@shared/types/common';

export interface SprintProgress {
  sprintName: string;
  committedPoints: number;
  completedPoints: number;
  remainingPoints: number;
  burndown: ChartSeriesPoint[];
}

const fetchSprintProgress = async (): Promise<SprintProgress> =>
  Promise.resolve({
    sprintName: 'Sprint 24',
    committedPoints: 48,
    completedPoints: 31,
    remainingPoints: 17,
    burndown: [
      { category: 'Day 1', value: 48 },
      { category: 'Day 3', value: 40 },
      { category: 'Day 5', value: 28 },
      { category: 'Day 7', value: 17 },
    ],
  });

export const SPRINT_BOARD_QUERY_KEY = ['sprint-board'] as const;

export const useSprintProgress = (): UseQueryResult<SprintProgress> =>
  useQuery({ queryKey: SPRINT_BOARD_QUERY_KEY, queryFn: fetchSprintProgress });
