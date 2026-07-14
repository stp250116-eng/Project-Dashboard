# Dashboard Feature

## Feature Purpose

Executive landing page aggregating KPIs, issue distribution, and recent activity
across teams and Jira projects.

## Jira Filter

- **Filter / Source:** Aggregates KPIs from multiple feature filters (see `docs/jira-filters.md` for per-feature saved filter IDs).
- **Purpose:** Executive summary; does not use a single saved filter but composes KPI sets from feature filters and internal APIs.


## Business Requirements

- Provide an at-a-glance executive summary on application start.
- Surface key KPIs (open/closed issues, velocity, critical defects).
- Visualize issue distribution by status.
- Show a feed of recent activity.

## User Flow

1. User lands on `/dashboard` (default route).
2. KPIs, status chart, and recent activity load via React Query.
3. User can apply quick filters to refine the view.

## API Endpoints

| Source                     | Notes                                     |
| -------------------------- | ----------------------------------------- |
| `dashboardService` (mock)  | Replace with internal API / Jira queries. |

## Environment Variables

None specific to this feature. Inherits global config.

## Grid Columns (Recent Activity)

| Column   | Field       |
| -------- | ----------- |
| Activity | `title`     |
| By       | `actor`     |
| When     | `timestamp` |

## Filters

- Quick Filters panel (project, team, date range — scaffolded).

## Validation Rules

None (read-only dashboard).

## Error Handling

Uses `StateView` to render loading / error / empty / success states.

## Dependencies

- `@shared/components` (KpiCard, DataChart, DataGrid, FilterPanel, StateView)
- `@tanstack/react-query`

## Jest Test Scenarios

- Renders the page title.
- Renders KPI cards after data loads.

## Playwright Test Scenarios

- Dashboard renders KPI cards on startup (see `playwright/dashboard`).

## Team Goal (new)

- **Purpose:** Show team-level complexity throughput, per-developer delivered complexity, and Pass/Fail against the team goal.
- **Jira Filter:** Uses saved filter id `13492` (GET COMPLEXITY BY YEAR).
- **Excluded Accounts:** The following Jira account IDs are excluded from the team throughput calculation:
	- `712020:1d57f2eb-225a-4bf7-9e53-55c3d2141466`
	- `712020:875170dd-e0d2-4977-b47f-d2a0fa4ef417`
	- `712020:e24f3eae-5beb-4bbf-9a7c-ca56354c370e`

See `src/features/dashboard/services/teamGoalService.ts` and `src/features/dashboard/components/TeamGoalSummary.tsx` for implementation details.
