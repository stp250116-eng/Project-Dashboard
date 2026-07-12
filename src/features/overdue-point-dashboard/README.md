# Overdue Point Dashboard Feature

## Feature Purpose

Live overdue delivery analytics sourced from Jira filter **[OO] - GET OVER DUE ITEM** (id `13525`). The dashboard helps Engineering Managers identify developers who participate in delayed parent issues, monitor release impact, and surface collaboration risk.

## Jira Filter

- **Filter name / ID:** [OO] - GET OVER DUE ITEM — id `13525`
- **JQL / Saved filter:** `filter = 13525`
- **Purpose:** Primary data source for overdue delivery analytics; each parent issue counts once per developer.
- **Requested Jira fields:** `assignee`, `parent`, `fixVersions[]`, `summary`
- **Mapping rules:**
	- `parent.key` and `parent.fields.summary` → parent issue reference
	- `fixVersions[0].name` → release
- **Sample fixture:** `test/fixtures/jiraIssues.ts`
- **Owner / cadence:** saved filter maintained in Jira; page fetches live and paginates.

## Business Requirements

- Load live overdue data from Jira filter `13525`.
- Aggregate overdue points by developer, with each parent issue counting once per developer.
- Provide multi-select filters for Developer and Release Version.
- Refresh KPI cards, charts, analytics, and grid immediately when filters change.
- Support loading, empty, and error states.

## Data Source & Field Mapping

| Dashboard Field | Jira Field |
| --- | --- |
| Developer | `assignee.displayName` |
| Parent Issue ID | `parent.key` |
| Parent Issue Summary | `parent.fields.summary` |
| Release Version | `fixVersions[0].name` |

## Filters

- **Developer** — multi-select of developer names.
- **Release Version** — multi-select of release values.

## KPI Cards

- **Delayed Issues** — unique delayed parent issue count.
- **Most Overdue Developer** — developer with the highest overdue point total.
- **Most Impacted Release** — release version with the most delayed parent issues.

## Charts

- **Top Developers by Overdue Point** — bar chart sorted descending.
- **Delayed Issues by Release Version** — pie chart by release.

## Grid

- One row per developer.
- Columns: Developer, Overdue Point, Expandable details.
- Expanded details display each parent issue and its release.

## Analytics Section

- **Highest Overdue Point** — developer with the highest overdue point.
- **Most Delayed Release** — release with the most delayed parent issues.
- **Highest Collaboration Risk** — parent issue with the most developers.

## Testing

- Unit tests for analytics and filters.
- Hook-level tests cover the empty-state and mapped-data branches for the dashboard hook.
- Page-level tests for loading, empty, and error states.
