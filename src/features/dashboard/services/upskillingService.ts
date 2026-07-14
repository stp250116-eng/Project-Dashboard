import { developerTrainingApi } from '@features/developer-training-dashboard/api/developerTrainingApi';
import { TEAM_TRAINING, TEAM_GOAL } from '../constants';

export interface UpskillingRow {
  developer: string;
  accountId?: string | null;
  totalTrainingHours: number;
  excluded?: boolean;
}

export interface UpskillingSummary {
  rows: UpskillingRow[];
  totalTrainingHours: number;
  includedDeveloperCount: number;
  teamTarget: number;
  pass: boolean;
}

export const upskillingService = {
  async fetchUpskillingSummary(): Promise<UpskillingSummary> {
    const raw = await developerTrainingApi.getTrainingRecords();

    const byAccount = new Map<string, UpskillingRow>();

    for (const rec of raw) {
      const assignee = (rec.fields.assignee as any) ?? null;
      const accountId = assignee?.accountId ?? null;
      const displayName = assignee?.displayName ?? 'Unassigned';
      const secs = (rec.fields.aggregatetimespent ?? 0) as number;
      const hours = Math.round(((secs ?? 0) / 3600) * 100) / 100;

      const key = accountId ?? displayName;
      const existing = byAccount.get(key);
      if (existing) {
        existing.totalTrainingHours += hours;
      } else {
        byAccount.set(key, {
          developer: displayName,
          accountId,
          totalTrainingHours: hours,
          excluded: TEAM_GOAL.excludedAccountIds.includes(accountId ?? ''),
        });
      }
    }

    const rows = Array.from(byAccount.values()).sort((a, b) => b.totalTrainingHours - a.totalTrainingHours);
    const includedRows = rows.filter((r) => !r.excluded);
    const totalTrainingHours = Math.round(includedRows.reduce((s, r) => s + r.totalTrainingHours, 0) * 100) / 100;
    const includedDeveloperCount = includedRows.length;
    const teamTarget = includedDeveloperCount * TEAM_TRAINING.perDeveloperTrainingHours;
    const pass = totalTrainingHours >= teamTarget;

    return { rows, totalTrainingHours, includedDeveloperCount, teamTarget, pass };
  },
};

export default upskillingService;
