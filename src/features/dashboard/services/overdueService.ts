import { jiraApi } from '@integrations/jira/jiraApi';
import type { RawJiraIssue } from '@integrations/jira/jiraTypes';

export interface OverdueSummary {
  overdueEpicCount: number;
  totalEpicCount: number;
  ratio: number; // 0..1
  overdueParents: string[]; // parent keys
}

/**
 * Delivery Efficiency: compute number of unique overdue parent issues (epics)
 * and total unique parent epics touched by the team this year.
 */
export const overdueService = {
  async fetchOverdueSummary(): Promise<OverdueSummary> {
    // Helper: fetch all issues for a given saved filter and collect parent keys (handles pagination)
    const overdueRecords = await jiraApi.fetchAllIssues<RawJiraIssue>(`filter = ${13525}`, 'assignee,parent');
    const allRecords = await jiraApi.fetchAllIssues<RawJiraIssue>(`filter = ${13725}`, 'assignee,parent');

    const overdueParents = new Set<string>();
    for (const issue of overdueRecords ?? []) {
      const parent = issue.fields?.parent;
      const parentKey = parent?.key ?? issue.key;
      overdueParents.add(parentKey);
    }

    const allParents = new Set<string>();
    for (const issue of allRecords ?? []) {
      const parent = issue.fields?.parent;
      const parentKey = parent?.key ?? issue.key;
      allParents.add(parentKey);
    }

    const overdueEpicCount = overdueParents.size;
    const totalEpicCount = allParents.size;
    const ratio = totalEpicCount > 0 ? overdueEpicCount / totalEpicCount : 0;

    return { overdueEpicCount, totalEpicCount, ratio, overdueParents: Array.from(overdueParents) };
  },
};

export default overdueService;
