import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { jiraApi } from './jiraApi';
import { JIRA_QUERY_KEYS, JIRA_DEFECT_FILTER } from './jiraConstants';
import type { JiraBoard, JiraIssue, JiraSprint, JiraDefect } from './jiraTypes';

/** React Query hook for JQL-based issue search. */
export const useJiraIssues = (jql: string, enabled = true): UseQueryResult<JiraIssue[]> =>
  useQuery({
    queryKey: JIRA_QUERY_KEYS.issues(jql),
    queryFn: () => jiraApi.searchIssues(jql),
    enabled: enabled && jql.length > 0,
  });

/** React Query hook for boards. */
export const useJiraBoards = (enabled = true): UseQueryResult<JiraBoard[]> =>
  useQuery({
    queryKey: JIRA_QUERY_KEYS.boards(),
    queryFn: () => jiraApi.getBoards(),
    enabled,
  });

/** React Query hook for a board's sprints. */
export const useJiraSprints = (
  boardId: number | null,
): UseQueryResult<JiraSprint[]> =>
  useQuery({
    queryKey: JIRA_QUERY_KEYS.sprints(boardId ?? -1),
    queryFn: () => jiraApi.getSprints(boardId as number),
    enabled: boardId !== null,
  });

/**
 * React Query hook that pulls the live "GET ALM DEFECT" filter on every mount.
 * `staleTime` is kept short so navigating to the dashboard re-fetches fresh
 * defect data, satisfying the real-time requirement.
 */
export const useJiraDefects = (
  filterId: number = JIRA_DEFECT_FILTER.id,
  enabled = true,
): UseQueryResult<JiraDefect[]> =>
  useQuery({
    queryKey: JIRA_QUERY_KEYS.defects(filterId),
    queryFn: () => jiraApi.getDefects(filterId),
    enabled,
    staleTime: 60_000,
  });
