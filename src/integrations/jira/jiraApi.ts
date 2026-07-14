import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import {
  JIRA_ENDPOINTS,
  JIRA_DEFAULT_MAX_RESULTS,
  JIRA_DEFECT_FILTER,
  JIRA_DEFECT_REQUEST_FIELDS,
  JIRA_OVERDUE_FILTER,
  JIRA_TRAINING_FILTER,
} from './jiraConstants';
import type {
  JiraIssue,
  JiraBoard,
  JiraSprint,
  JiraDefect,
  RawDeveloperTrainingIssue,
  RawJiraIssue,
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
  /** Generic helper: fetch all matching issues for a JQL using enhanced search pagination or startAt pagination. */
  async fetchAllIssues<T = RawJiraIssue>(jql: string, fields = '*navigable', pageSize = JIRA_DEFAULT_MAX_RESULTS): Promise<T[]> {
    const records: T[] = [];
    let nextPageToken: string | undefined;

    // Try enhanced search (cursor-based) first. If server doesn't return cursor fields,
    // fall back to classic startAt/total paging.
    try {
      do {
        const { data } = await jiraClient.get<RawJiraSearchResponse<T>>(JIRA_ENDPOINTS.search, {
          params: {
            jql,
            maxResults: pageSize,
            fields,
            ...(nextPageToken ? { nextPageToken } : {}),
          },
        });
        records.push(...(data.issues ?? []));
        if (typeof data.isLast === 'boolean') {
          nextPageToken = data.isLast ? undefined : data.nextPageToken;
        } else {
          // server didn't use enhanced cursor model; throw to use fallback paging path
          throw new Error('no-cursor');
        }
      } while (nextPageToken);
    } catch {
      // fallback to classic startAt/total pagination
      let startAt = 0;
      let total = Number.POSITIVE_INFINITY;
      while (startAt < total) {
        const { data } = await jiraClient.get<RawJiraSearchResponse<T> & { total?: number; maxResults?: number }>(JIRA_ENDPOINTS.search, {
          params: { jql, startAt, maxResults: pageSize, fields },
        });
        records.push(...(data.issues ?? []));
        total = typeof data.total === 'number' ? data.total : total;
        startAt += data.maxResults || pageSize;
      }
    }

    return records;
  },

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

  async getTrainingInformation(pageSize = 100): Promise<RawDeveloperTrainingIssue[]> {
    const records: RawDeveloperTrainingIssue[] = [];
    let nextPageToken: string | undefined;

    do {
      const { data } = await jiraClient.get<RawJiraSearchResponse<RawDeveloperTrainingIssue>>(
        JIRA_ENDPOINTS.search,
        {
          params: {
            jql: `filter = ${JIRA_TRAINING_FILTER.id}`,
            maxResults: pageSize,
            fields: 'assignee,aggregatetimespent,customfield_11546,customfield_11547',
            ...(nextPageToken ? { nextPageToken } : {}),
          },
        },
      );
      records.push(...data.issues);
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return records;
  },

  async getOverdueIssues(pageSize = 100): Promise<RawJiraIssue[]> {
    const records: RawJiraIssue[] = [];
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
      records.push(...data.issues);
      nextPageToken = data.isLast ? undefined : data.nextPageToken;
    } while (nextPageToken);

    return records;
  },
};
