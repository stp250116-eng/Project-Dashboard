import { complexityApi } from '@features/complexity-point/api/complexityApi';
import { TEAM_GOAL } from '../constants';
import type { ComplexityRecord } from '@features/complexity-point/models/complexityModels';

export interface DeveloperThroughput {
  assignee: string;
  accountId?: string | null;
  complexity: number;
  excluded?: boolean;
}

export interface TeamGoalSummary {
  rows: DeveloperThroughput[];
  teamThroughput: number;
  includedDeveloperCount: number;
  teamTarget: number;
  pass: boolean;
}

/** Fetch complexity records from Jira and compute team throughput and pass/fail. */
export const teamGoalService = {
  async fetchTeamGoalSummary(): Promise<TeamGoalSummary> {
    const records: ComplexityRecord[] = await complexityApi.getComplexityPoints();

    const byAccount = new Map<string, DeveloperThroughput>();

    for (const r of records) {
      const account = r.accountId ?? r.assignee ?? 'unknown';
      const existing = byAccount.get(account);
      if (existing) {
        existing.complexity += r.complexity;
      } else {
        byAccount.set(account, {
          assignee: r.assignee,
          accountId: r.accountId ?? null,
          complexity: r.complexity,
          excluded: TEAM_GOAL.excludedAccountIds.includes(r.accountId ?? ''),
        });
      }
    }

    const rows = Array.from(byAccount.values()).sort((a, b) => b.complexity - a.complexity);

    const includedRows = rows.filter((r) => !r.excluded);
    const teamThroughput = includedRows.reduce((s, r) => s + r.complexity, 0);
    const includedDeveloperCount = includedRows.length;
    const teamTarget = includedDeveloperCount * TEAM_GOAL.perDeveloperTarget;
    const pass = teamThroughput >= teamTarget;

    return {
      rows,
      teamThroughput,
      includedDeveloperCount,
      teamTarget,
      pass,
    };
  },
};

export default teamGoalService;
