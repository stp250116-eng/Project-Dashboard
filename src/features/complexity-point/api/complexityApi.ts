import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import { JIRA_COMPLEXITY_FILTER, JIRA_ENDPOINTS, JIRA_DEFAULT_MAX_RESULTS } from '@integrations/jira/jiraConstants';
import type { RawJiraIssue, RawJiraSearchResponse } from '@integrations/jira/jiraTypes';
import type { ComplexityRecord } from '../models/complexityModels';
import { getComplexityValueFromFields } from '../services/complexityAnalytics';

const jiraClient = createApiClient(appConfig.jiraApiBase);

const mapComplexityIssue = (issue: RawJiraIssue): ComplexityRecord => ({
  assignee: issue.fields.assignee?.displayName ?? 'Unassigned',
  complexity: getComplexityValueFromFields(issue.fields as Record<string, unknown>),
});

export const complexityApi = {
  async getComplexityPoints(): Promise<ComplexityRecord[]> {
    const records: ComplexityRecord[] = [];
    let nextPageToken: string | undefined;

    do {
      const { data } = await jiraClient.get<RawJiraSearchResponse>(JIRA_ENDPOINTS.search, {
        params: {
          jql: JIRA_COMPLEXITY_FILTER.jql,
          maxResults: 100,
          fields: 'summary,assignee,customfield_10704',
          ...(nextPageToken ? { nextPageToken } : {}),
        },
      });

      records.push(...data.issues.map(mapComplexityIssue));
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return records;
  },
};
