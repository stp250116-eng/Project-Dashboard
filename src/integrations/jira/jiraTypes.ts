/**
 * Internal domain models for Jira data. Raw Jira REST responses are mapped to
 * these shapes by {@link file://./jiraMapper.ts} so the UI is decoupled from
 * Jira's wire format.
 */

export type JiraIssueStatusCategory = 'todo' | 'in-progress' | 'done';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  statusCategory: JiraIssueStatusCategory;
  assignee: string | null;
  priority: string | null;
  issueType: string;
  storyPoints: number | null;
  created: string;
  updated: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string | null;
  endDate: string | null;
  completeDate: string | null;
  goal: string | null;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
}

export interface JiraRelease {
  id: string;
  name: string;
  released: boolean;
  releaseDate: string | null;
  description: string | null;
}

/**
 * A developer defect record, distilled from the "GET ALM DEFECT" saved filter.
 * One record per Jira Bug, denormalized for analytics (year is derived from the
 * Fix Version, owner from the assignee).
 */
export interface JiraDefect {
  id: string;
  key: string;
  summary: string;
  /** Release label parsed from the Fix Version, e.g. "v26.2.3". */
  release: string;
  /** Raw Fix Version name(s), e.g. "OO Release v26.2.3 #R2026Q2". */
  fixVersions: string[];
  /** Normalized severity label, e.g. "High" | "Medium" | "Low". */
  severity: string;
  /** Normalized root-cause label, e.g. "Coding Error". "Unknown" when unset. */
  rootCause: string;
  /** Owning developer (assignee display name). */
  owner: string;
  created: string;
}

/** Raw (partial) Jira REST response contracts — used only inside the mapper. */
export interface RawJiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: { name: string; statusCategory: { key: string } };
    assignee: { displayName: string } | null;
    priority: { name: string } | null;
    issuetype: { name: string };
    created: string;
    updated: string;
    fixVersions?: Array<{ id: string; name: string }> | null;
    [customField: string]: unknown;
  };
}

export interface RawDeveloperTrainingFieldSet {
  aggregatetimespent: number | null;
  customfield_11546: string | { value: string } | null;
  customfield_11547: string | { value: string } | null;
  [customField: string]: unknown;
}

export interface RawDeveloperTrainingIssue extends RawJiraIssue {
  fields: RawJiraIssue['fields'] & RawDeveloperTrainingFieldSet;
}

/** A Jira single-select custom field value (`{ value: '…' }`). */
export interface RawJiraOption {
  value: string;
  id?: string;
}

export interface RawJiraSearchResponse<IssueType = RawJiraIssue> {
  issues: IssueType[];
  /** Opaque cursor for the next page; absent on the final page. */
  nextPageToken?: string;
  /** True when this is the last page (enhanced search endpoint). */
  isLast?: boolean;
}
