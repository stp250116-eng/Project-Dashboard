# Team Capacity Feature

## Feature Purpose

Plan and monitor team capacity: velocity, workload distribution, utilization.

## Business Requirements

- Show per-member assigned vs. capacity points and utilization.
- Visualize workload distribution.

## User Flow

1. User navigates to `/team-capacity`.
2. Capacity data loads via React Query.

## API Endpoints

Backed by Jira sprint/assignee aggregation. Currently mock data.

## Environment Variables

`VITE_JIRA_PROJECT_KEY`.

## Grid Columns

| Column        | Field            |
| ------------- | ---------------- |
| Member        | `name`           |
| Assigned      | `assignedPoints` |
| Capacity      | `capacityPoints` |
| Utilization % | `utilization`    |

## Filters

Team / sprint filters (scaffolded).

## Validation Rules

None.

## Error Handling

`StateView` for loading / error / empty / success.

## Dependencies

`@shared/components`, `@tanstack/react-query`.

## Jest Test Scenarios

- Renders heading.
- Renders the capacity grid.

## Playwright Test Scenarios

- Navigate to Team Capacity and verify grid renders.
