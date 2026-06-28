import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import { JIRA_ENDPOINTS, JIRA_OVERDUE_FILTER } from '@integrations/jira/jiraConstants';
import type { RawJiraIssue, RawJiraSearchResponse } from '@integrations/jira/jiraTypes';
import type { OverduePointRecord } from '../models/overduePointModels';

const jiraClient = createApiClient(appConfig.jiraApiBase);

const toOverduePointRecord = (issue: RawJiraIssue): OverduePointRecord => ({
  developer: issue.fields.assignee?.displayName ?? 'Unassigned',
  parentIssueId: issue.fields.parent?.key ?? 'Unknown',
  parentIssueSummary: issue.fields.parent?.fields.summary ?? 'No parent summary',
  releaseVersion:
    issue.fields.fixVersions?.[0]?.name ?? 'No Release',
});

export const overduePointApi = {
  async getOverduePointRecords(pageSize = 100): Promise<OverduePointRecord[]> {
    const records: OverduePointRecord[] = [];
    let nextPageToken: string | undefined;

    do {
      const { data } = await jiraClient.get<RawJiraSearchResponse>(JIRA_ENDPOINTS.search, {
        params: {
          jql: `filter = ${JIRA_OVERDUE_FILTER.id}`,
          maxResults: pageSize,
          fields: 'assignee,parent,fixVersions',
          ...(nextPageToken ? { nextPageToken } : {}),
        },
      });

      records.push(...data.issues.map(toOverduePointRecord));
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return records;
  },
};
