import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import {
  JIRA_ENDPOINTS,
  JIRA_DEFAULT_MAX_RESULTS,
  JIRA_DEFECT_FILTER,
  JIRA_DEFECT_REQUEST_FIELDS,
} from './jiraConstants';
import type {
  JiraIssue,
  JiraBoard,
  JiraSprint,
  JiraDefect,
  RawJiraSearchResponse,
} from './jiraTypes';
import { mapJiraIssues, mapJiraDefects } from './jiraMapper';

/**
 * Jira API client. Talks to Jira Cloud REST API through a same-origin proxy
 * (`appConfig.jiraApiBase`, default `/jira`) so the browser is never blocked by
 * CORS. Credentials are never read here — authentication is injected by the dev
 * proxy / server-side BFF, keeping tokens out of the client bundle.
 */
const jiraClient = createApiClient(appConfig.jiraApiBase);

export const jiraApi = {
  /** Search issues via JQL and return mapped domain models. */
  async searchIssues(jql: string, maxResults = JIRA_DEFAULT_MAX_RESULTS): Promise<JiraIssue[]> {
    const { data } = await jiraClient.get<RawJiraSearchResponse>(JIRA_ENDPOINTS.search, {
      params: { jql, maxResults, fields: '*navigable' },
    });
    return mapJiraIssues(data.issues);
  },

  /** List boards available to the current user. */
  async getBoards(): Promise<JiraBoard[]> {
    const { data } = await jiraClient.get<{ values: JiraBoard[] }>(JIRA_ENDPOINTS.boards);
    return data.values;
  },

  /** List sprints for a given board. */
  async getSprints(boardId: number): Promise<JiraSprint[]> {
    const { data } = await jiraClient.get<{ values: JiraSprint[] }>(
      JIRA_ENDPOINTS.sprints(boardId),
    );
    return data.values;
  },

  /**
   * Loads every defect captured by the "GET ALM DEFECT" saved filter, mapped to
   * the {@link JiraDefect} analytics model. Querying via `filter = <id>` keeps
   * the dataset in sync with the live saved filter. Results are paginated via
   * the enhanced search endpoint's `nextPageToken` cursor so the full set is
   * returned regardless of size.
   */
  async getDefects(
    filterId: string | number = JIRA_DEFECT_FILTER.id,
    pageSize = 100,
  ): Promise<JiraDefect[]> {
    const jql = `filter = ${filterId}`;
    const defects: JiraDefect[] = [];
    let nextPageToken: string | undefined;

    do {
      const { data } = await jiraClient.get<RawJiraSearchResponse>(JIRA_ENDPOINTS.search, {
        params: {
          jql,
          maxResults: pageSize,
          fields: JIRA_DEFECT_REQUEST_FIELDS.join(','),
          ...(nextPageToken ? { nextPageToken } : {}),
        },
      });
      defects.push(...mapJiraDefects(data.issues));
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return defects;
  },
};
