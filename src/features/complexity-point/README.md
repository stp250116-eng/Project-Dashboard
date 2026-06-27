# Complexity Point Feature

## Feature Purpose

A summary page for complexity points sourced from the Jira saved filter **GET COMPLEXITY BY YEAR**. The page lets users filter by developer and view a ranked summary table of complexity points per employee.

## Business Requirements

- Load live complexity-point data from the Jira saved filter **GET COMPLEXITY BY YEAR**.
- Expose a multi-select developer filter.
- Show KPI cards for total employees, total complexity, highest complexity, and the top contributor.
- Render a summary table ordered by descending complexity.

## User Flow

1. User navigates to `/complexity-point`.
2. The page fetches the saved Jira filter results.
3. The user filters by assignee and the summary table updates immediately.

## Data Source & Field Mapping

| Concept | Jira source |
| --- | --- |
| Complexity set | Saved filter `GET COMPLEXITY BY YEAR` |
| Developer | `assignee.displayName` |
| Complexity | `customfield_10016` (story points) |

## Filters

- **Developer** — multi-select of developer names.

## Validation Rules

- Complexity values are parsed as numbers; invalid/missing values default to `0`.

## Error Handling

The shared `StateView` handles loading, empty, error, and success states.

## Jest Test Scenarios

- `complexityAnalytics.test.ts` — aggregation, sorting, and assignee filtering.
