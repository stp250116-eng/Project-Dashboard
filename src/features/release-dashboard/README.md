# Release Dashboard Feature

## Feature Purpose

Track release readiness and status across upcoming and past releases.

## Business Requirements

- Show release readiness percentage and status.
- List releases with target dates.

## User Flow

1. User navigates to `/release-dashboard`.
2. Releases load via React Query.

## API Endpoints

Backed by Jira releases (project versions). Currently mock data.

## Environment Variables

`VITE_JIRA_PROJECT_KEY`.

## Grid Columns

| Column      | Field        |
| ----------- | ------------ |
| Release     | `name`       |
| Status      | `status`     |
| Readiness % | `readiness`  |
| Target Date | `targetDate` |

## Filters

Status filter (scaffolded).

## Validation Rules

None.

## Error Handling

`StateView` for loading / error / empty / success.

## Dependencies

`@shared/components`, `@tanstack/react-query`.

## Jest Test Scenarios

- Renders heading.
- Renders the releases grid.

## Playwright Test Scenarios

- Navigate to Release Dashboard and verify grid renders.
