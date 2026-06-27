# Dashboard Feature

## Feature Purpose

Executive landing page aggregating KPIs, issue distribution, and recent activity
across teams and Jira projects.

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
