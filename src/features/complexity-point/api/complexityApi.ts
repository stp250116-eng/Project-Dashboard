import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import { JIRA_COMPLEXITY_FILTER, JIRA_ENDPOINTS } from '@integrations/jira/jiraConstants';
import type { RawJiraIssue, RawJiraSearchResponse } from '@integrations/jira/jiraTypes';
import type { ComplexityRecord } from '../models/complexityModels';
import { getComplexityValueFromFields } from '../services/complexityAnalytics';

const mapComplexityIssue = (issue: RawJiraIssue): ComplexityRecord => {
  const assignee = issue.fields.assignee?.displayName ?? 'Unassigned';
  const accountId = issue.fields.assignee?.accountId;
  const complexity = getComplexityValueFromFields(issue.fields as Record<string, unknown>);

  const base: ComplexityRecord = { assignee, complexity };
  if (typeof accountId === 'string' && accountId.length > 0) {
    base.accountId = accountId;
  }
  return base;
};

export const complexityApi = {
  async getComplexityPoints(): Promise<ComplexityRecord[]> {
    const jiraClient = createApiClient(appConfig.jiraApiBase);
    const records: ComplexityRecord[] = [];
    let nextPageToken: string | undefined;

    do {
      const { data } = await jiraClient.get<RawJiraSearchResponse>(JIRA_ENDPOINTS.search, {
        params: {
          jql: JIRA_COMPLEXITY_FILTER.jql,
          maxResults: 100,
          // Request both known candidate fields so the canonical parser can
          // extract complexity regardless of field id used in the Jira filter.
          fields: 'summary,assignee,customfield_10704,customfield_11530',
          ...(nextPageToken ? { nextPageToken } : {}),
        },
      });

      records.push(...data.issues.map(mapComplexityIssue));
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return records;
  },
};
