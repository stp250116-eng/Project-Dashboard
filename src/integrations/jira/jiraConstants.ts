/** Jira REST API endpoint paths and query configuration constants. */

export const JIRA_API = {
  /** Agile API base used for boards/sprints. */
  agileBase: '/rest/agile/1.0',
  /** Platform API base used for issues/projects/search. */
  platformBase: '/rest/api/3',
} as const;

export const JIRA_ENDPOINTS = {
  search: `${JIRA_API.platformBase}/search/jql`,
  project: (key: string) => `${JIRA_API.platformBase}/project/${key}`,
  filter: (id: string | number) => `${JIRA_API.platformBase}/filter/${id}`,
  filterSearch: `${JIRA_API.platformBase}/filter/search`,
  boards: `${JIRA_API.agileBase}/board`,
  sprints: (boardId: number) => `${JIRA_API.agileBase}/board/${boardId}/sprint`,
  sprintIssues: (sprintId: number) => `${JIRA_API.agileBase}/sprint/${sprintId}/issue`,
} as const;

/**
 * Saved Jira filter that captures developer defects per release. The dashboard
 * always queries via `filter = <id>` so it reflects the live saved filter
 * definition rather than a hardcoded JQL copy.
 *
 * Filter "GET ALM DEFECT": `project = OO AND issuetype = Bug AND summary !~ "BOD"`.
 */
export const JIRA_DEFECT_FILTER = {
  id: 11471,
  name: 'GET ALM DEFECT',
} as const;

export const JIRA_COMPLEXITY_FILTER = {
  id: 13492,
  name: 'GET COMPLEXITY BY YEAR',
  jql: `project = "Ocean Team Ocean Online" and issuetype = Task and "Team[Team]" = ee9c42a6-7384-43eb-9092-670f4585a710 and "Activity[Dropdown]" != Grooming and "Activity[Dropdown]" != "Support and Documentation" and "Complexity[Dropdown]" IS NOT EMPTY and createdDate >= startOfYear() and createdDate <= endOfYear() and status = 'Done' order by assignee asc`,
} as const;

export const JIRA_TRAINING_FILTER = {
  id: 12947,
  name: '[OO] - GET TRAINING INFORMATION',
} as const;

export const JIRA_TRAINING_FIELDS = {
  trainingType: 'customfield_11546',
  vendorType: 'customfield_11547',
} as const;

/**
 * Custom field IDs used by the OO project's defect records. Centralized here so
 * a field re-map is a single-line change. Discovered via `/rest/api/3/field`.
 */
export const JIRA_DEFECT_FIELDS = {
  /** Single-select: "2 - High" | "3 - Medium" | "4 - Low" | … */
  severity: 'customfield_10709',
  /** Single-select root cause of the defect, e.g. "Coding Error". */
  rootCause: 'customfield_11886',
} as const;

/** Issue fields requested when loading defects (keeps payloads small). */
export const JIRA_DEFECT_REQUEST_FIELDS: readonly string[] = [
  'summary',
  'created',
  'updated',
  'assignee',
  'status',
  'priority',
  'issuetype',
  'fixVersions',
  JIRA_DEFECT_FIELDS.severity,
  JIRA_DEFECT_FIELDS.rootCause,
];

/** React Query cache keys for Jira data. */
export const JIRA_QUERY_KEYS = {
  all: ['jira'] as const,
  issues: (jql: string) => ['jira', 'issues', jql] as const,
  boards: () => ['jira', 'boards'] as const,
  sprints: (boardId: number) => ['jira', 'sprints', boardId] as const,
  releases: (projectKey: string) => ['jira', 'releases', projectKey] as const,
  defects: (filterId: string | number) => ['jira', 'defects', filterId] as const,
} as const;

export const JIRA_DEFAULT_MAX_RESULTS = 50;
