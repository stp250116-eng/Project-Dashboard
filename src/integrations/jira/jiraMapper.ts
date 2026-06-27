import type { JiraIssue, JiraIssueStatusCategory, RawJiraIssue } from './jiraTypes';
import type { JiraDefect, RawJiraOption } from './jiraTypes';
import { JIRA_DEFECT_FIELDS } from './jiraConstants';

const STORY_POINTS_FIELD = 'customfield_10016';

const toStatusCategory = (key: string): JiraIssueStatusCategory => {
  switch (key) {
    case 'new':
    case 'undefined':
    case 'to-do':
    case 'todo':
      return 'todo';
    case 'done':
      return 'done';
    default:
      return 'in-progress';
  }
};

/** Maps a raw Jira issue to the internal {@link JiraIssue} domain model. */
export const mapJiraIssue = (raw: RawJiraIssue): JiraIssue => {
  const rawPoints = raw.fields[STORY_POINTS_FIELD];
  const storyPoints = typeof rawPoints === 'number' ? rawPoints : null;

  return {
    id: raw.id,
    key: raw.key,
    summary: raw.fields.summary,
    status: raw.fields.status.name,
    statusCategory: toStatusCategory(raw.fields.status.statusCategory.key),
    assignee: raw.fields.assignee?.displayName ?? null,
    priority: raw.fields.priority?.name ?? null,
    issueType: raw.fields.issuetype.name,
    storyPoints,
    created: raw.fields.created,
    updated: raw.fields.updated,
  };
};

export const mapJiraIssues = (raw: readonly RawJiraIssue[]): JiraIssue[] =>
  raw.map(mapJiraIssue);

const UNASSIGNED = 'Unassigned';
const UNKNOWN = 'Unknown';
const NO_RELEASE = 'No Release';

/** Reads a Jira single-select custom field value, tolerating null/shape drift. */
const readOptionValue = (raw: unknown): string | null => {
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const { value } = raw as RawJiraOption;
    return typeof value === 'string' && value.length > 0 ? value : null;
  }
  return null;
};

/**
 * Extracts the release label from Fix Version names. The OO project formats
 * versions as "OO Release v26.2.2 #R2026Q2"; the `v<major>.<minor>…` token is
 * surfaced as the release (e.g. "v26.2.2"). Falls back to {@link NO_RELEASE}
 * when no version token is present (e.g. an issue with no Fix Version).
 */
export const parseDefectRelease = (fixVersionNames: readonly string[]): string => {
  for (const name of fixVersionNames) {
    const match = name.match(/v\d+(?:\.\d+)*/i);
    if (match) return match[0];
  }
  return NO_RELEASE;
};

/**
 * Normalizes a severity label like "2 - High" to its bare level ("High").
 * Returns {@link UNKNOWN} when unset.
 */
export const normalizeSeverity = (value: string | null): string => {
  if (!value) return UNKNOWN;
  const withoutPrefix = value.replace(/^\s*\d+\s*-\s*/, '').trim();
  return withoutPrefix.length > 0 ? withoutPrefix : UNKNOWN;
};

/**
 * Normalizes a single-select root-cause label (e.g. "Coding Error"). Trims
 * surrounding whitespace and returns {@link UNKNOWN} when unset or blank.
 */
export const normalizeRootCause = (value: string | null): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : UNKNOWN;
};

/** Maps a raw Jira Bug to the internal {@link JiraDefect} analytics model. */
export const mapJiraDefect = (raw: RawJiraIssue): JiraDefect => {
  const fixVersions = (raw.fields.fixVersions ?? []).map((version) => version.name);
  const severity = normalizeSeverity(readOptionValue(raw.fields[JIRA_DEFECT_FIELDS.severity]));
  const rootCause = normalizeRootCause(readOptionValue(raw.fields[JIRA_DEFECT_FIELDS.rootCause]));

  return {
    id: raw.id,
    key: raw.key,
    summary: raw.fields.summary,
    release: parseDefectRelease(fixVersions),
    fixVersions,
    severity,
    rootCause,
    owner: raw.fields.assignee?.displayName ?? UNASSIGNED,
    created: raw.fields.created,
  };
};

export const mapJiraDefects = (raw: readonly RawJiraIssue[]): JiraDefect[] =>
  raw.map(mapJiraDefect);
