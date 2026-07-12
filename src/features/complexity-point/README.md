# Complexity Point Feature

## Feature Purpose

A summary page for complexity points sourced from the Jira saved filter **GET COMPLEXITY BY YEAR**. The page lets users filter by developer and view a ranked summary table of complexity points per employee.

## Jira Filter

- **Filter name / ID:** GET COMPLEXITY BY YEAR (saved filter referenced in feature)
- **JQL / Saved filter:** `filter = <saved-filter-id>` (refer to Jira for exact id)
- **Purpose:** Provides the yearly complexity point set used to compute complexity totals and rankings.
- **Requested Jira fields:** `assignee`, `customfield_10704`, other fields named `complexity` (fallback)
- **Mapping rules:**
	- `customfield_10704` → complexity points (parse number, default `0`)
	- If `customfield_10704` missing, search other fields named `complexity`
- **Sample fixture:** `test/fixtures/*` (see complexity tests)
- **Owner / cadence:** saved filter maintained in Jira; page fetches live and paginates.

## Business Requirements

- Load live complexity-point data from the Jira saved filter **GET COMPLEXITY BY YEAR**.
- Expose a multi-select developer filter.
- Show KPI cards for total employees, total complexity, highest complexity, and the top contributor.
- Render a summary table ordered by descending complexity.

## User Flow

1. User navigates to `/complexity-point`.
2. The page fetches the saved Jira filter results through the feature hook.
3. The user filters by assignee and the summary table and KPI cards update immediately.

## Data Source & Field Mapping

| Concept | Jira source |
| --- | --- |
| Complexity set | Saved filter `GET COMPLEXITY BY YEAR` |
| Developer | `assignee.displayName` |
| Complexity | `customfield_10704` when present, otherwise the first Jira field whose name matches `complexity` |

## Filters

- **Developer** — multi-select of developer names.

## Validation Rules

- Complexity values are parsed as numbers; invalid, empty, or missing values default to `0`.
- When no records are present, the page shows the empty-state messaging from the shared `StateView`.

## Error Handling

The shared `StateView` handles loading, empty, error, and success states. The page shows the same empty/error messaging for the hook result.

## Jest Test Scenarios

- `complexityAnalytics.test.ts` — aggregation, sorting, filtering, and fallback parsing rules.
- `ComplexityPointPage.test.tsx` — rendering of the summary view and the empty state.
- `ComplexityFilters.test.tsx` — developer filter selection flow.
- `complexityApi.test.ts` — Jira API paging and mapping behavior.
- `useComplexityPoints.test.tsx` — hook loading, empty, and error-state behavior.
