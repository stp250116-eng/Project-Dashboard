import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { appConfig } from '@shared/constants/appConfig';
import type { JiraIssue } from '@integrations/jira';

export interface IssueStatusBucket {
  category: string;
  value: number;
}

export interface JiraOverviewData {
  issues: JiraIssue[];
  statusBreakdown: IssueStatusBucket[];
  openCount: number;
  closedCount: number;
}

/**
 * Mock overview source. In production this composes `useJiraIssues` results.
 * Deterministic data keeps tests and smoke runs stable while the Jira proxy
 * is being provisioned.
 */
const fetchOverview = async (): Promise<JiraOverviewData> => {
  const issues: JiraIssue[] = [
    {
      id: '1', key: `${appConfig.jiraProjectKey}-101`, summary: 'Add SSO support',
      status: 'In Progress', statusCategory: 'in-progress', assignee: 'A. Patel',
      priority: 'High', issueType: 'Story', storyPoints: 5,
      created: '2026-06-01T10:00:00Z', updated: '2026-06-12T10:00:00Z',
    },
    {
      id: '2', key: `${appConfig.jiraProjectKey}-102`, summary: 'Fix grid pagination',
      status: 'To Do', statusCategory: 'todo', assignee: 'M. Chen',
      priority: 'Medium', issueType: 'Bug', storyPoints: 3,
      created: '2026-06-03T10:00:00Z', updated: '2026-06-11T10:00:00Z',
    },
    {
      id: '3', key: `${appConfig.jiraProjectKey}-103`, summary: 'Export to Excel',
      status: 'Done', statusCategory: 'done', assignee: 'R. Gomez',
      priority: 'Low', issueType: 'Story', storyPoints: 8,
      created: '2026-05-20T10:00:00Z', updated: '2026-06-10T10:00:00Z',
    },
  ];

  const openCount = issues.filter((i) => i.statusCategory !== 'done').length;
  const closedCount = issues.filter((i) => i.statusCategory === 'done').length;

  return Promise.resolve({
    issues,
    openCount,
    closedCount,
    statusBreakdown: [
      { category: 'To Do', value: issues.filter((i) => i.statusCategory === 'todo').length },
      { category: 'In Progress', value: issues.filter((i) => i.statusCategory === 'in-progress').length },
      { category: 'Done', value: closedCount },
    ],
  });
};

export const JIRA_OVERVIEW_QUERY_KEY = ['jira-overview'] as const;

export const useJiraOverview = (): UseQueryResult<JiraOverviewData> =>
  useQuery({ queryKey: JIRA_OVERVIEW_QUERY_KEY, queryFn: fetchOverview });
