# Sprint Board Feature

## Feature Purpose

Visualize the active sprint: committed/completed/remaining points and burndown.

## Business Requirements

- Show active sprint progress KPIs.
- Render a burndown trend.

## User Flow

1. User navigates to `/sprint-board`.
2. Sprint metrics load via React Query.

## API Endpoints

Backed by `@integrations/jira` (`getSprints`). Currently mock data.

## Environment Variables

`VITE_JIRA_BASE_URL`, `VITE_JIRA_PROJECT_KEY`.

## Grid Columns

N/A (chart + KPI based).

## Filters

Sprint selector (scaffolded).

## Validation Rules

None.

## Error Handling

`StateView` for all four UI states.

## Dependencies

`@shared/components`, `@integrations/jira`, `@tanstack/react-query`.

## Jest Test Scenarios

- Renders heading.
- Renders sprint KPI cards.

## Playwright Test Scenarios

- Navigate to Sprint Board and verify burndown renders.
