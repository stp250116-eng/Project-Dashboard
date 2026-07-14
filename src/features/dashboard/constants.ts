export const TEAM_GOAL = {
  /** Jira saved filter id used to fetch complexity records. */
  complexityFilterId: 13492,
  /** Per-developer target points for the year. */
  perDeveloperTarget: 220,
  /** Jira account IDs to exclude from team throughput calculations. */
  excludedAccountIds: [
    '712020:1d57f2eb-225a-4bf7-9e53-55c3d2141466',
    '712020:875170dd-e0d2-4977-b47f-d2a0fa4ef417',
    '712020:e24f3eae-5beb-4bbf-9a7c-ca56354c370e',
  ] as const,
} as const;

export const TEAM_TRAINING = {
  /** Jira saved filter id used to fetch training records. */
  trainingFilterId: 12947,
  /** Per-developer training hours target for the year. */
  perDeveloperTrainingHours: 40,
} as const;

export type ExcludedAccountId = (typeof TEAM_GOAL)['excludedAccountIds'][number];
