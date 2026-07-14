import { jiraApi } from '@integrations/jira/jiraApi';
import { JIRA_DEFECT_FILTER, JIRA_DEFECT_REQUEST_FIELDS } from '@integrations/jira/jiraConstants';
import { TEAM_GOAL } from '../constants';

interface RawIssueAssignee {
  displayName?: string;
  accountId?: string;
}

interface RawIssue {
  id: string;
  key: string;
  fields: Record<string, unknown> & { assignee?: RawIssueAssignee | null };
}

export interface DefectRow {
  developer: string;
  accountId?: string | null;
  counts: { low: number; medium: number; high: number; critical: number };
  excluded?: boolean;
}

export interface DefectSummary {
  rows: DefectRow[];
  totalDefects: number;
}

const readSeverity = (raw: unknown): string | null => {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null && 'value' in raw) return String(((raw as { value?: unknown }).value ?? null));
  return null;
};

const normalizeSeverity = (value: string | null): 'critical' | 'high' | 'medium' | 'low' => {
  if (!value) return 'low';
  const v = value.replace(/^\s*\d+\s*-\s*/i, '').trim().toLowerCase();
  if (v.includes('critical')) return 'critical';
  if (v.includes('high')) return 'high';
  if (v.includes('medium')) return 'medium';
  return 'low';
};

export const defectService = {
  async fetchDefectSummary(): Promise<DefectSummary> {
    const issues: RawIssue[] = await jiraApi.fetchAllIssues<RawIssue>(`filter = ${JIRA_DEFECT_FILTER.id}`, JIRA_DEFECT_REQUEST_FIELDS.join(','));

    const rowsMap = new Map<string, DefectRow>();
    const excludedIds = TEAM_GOAL.excludedAccountIds as readonly string[];

    for (const issue of issues ?? []) {
      const assignee = issue.fields?.assignee ?? null;
      const accountId = assignee?.accountId ?? null;
      const dev = assignee?.displayName ?? accountId ?? 'Unassigned';

      const severityRaw = issue.fields?.[JIRA_DEFECT_REQUEST_FIELDS.find((f) => f.includes('customfield')) ?? ''] ?? null;
      const severityVal = readSeverity(severityRaw);
      const severity = normalizeSeverity(severityVal);

      const key = accountId ?? dev;
      const existing = rowsMap.get(key);
      if (existing) {
        existing.counts[severity] += 1;
      } else {
        const row: DefectRow = {
          developer: dev,
          accountId: accountId ?? null,
          counts: { low: 0, medium: 0, high: 0, critical: 0 },
          excluded: accountId ? excludedIds.includes(accountId) : false,
        };
        row.counts[severity] = 1;
        rowsMap.set(key, row);
      }
    }

    const rows = Array.from(rowsMap.values());
    const totalDefects = rows.reduce((sum, r) => sum + Object.values(r.counts).reduce((s, v) => s + v, 0), 0);

    return { rows, totalDefects };
  },
};

export default defectService;
