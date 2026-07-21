# Team Goal Feature (Integration Test with Github and JIRA Round#7 Deployment Master)

## Feature Purpose

The Team Goal feature surfaces team-level metrics derived from individual developer
goal scoring. It aggregates complexity throughput, team capacity, and pass/fail
status against a configured team target to help managers monitor collective
health and delivery readiness.

## Business Requirements

- Aggregate individual developer scores into team-level KPIs.
- Show total complexity points delivered by the team over a selected period.
- Show pass/fail against a configurable team goal and list contributing members.
- Support filtering by release and team, and allow drill-down to per-developer
  contributions.

## User Flow

1. User navigates to the Team Goal page.
2. The page fetches team-level aggregates via `useTeamGoal()` (wraps team goal API).
3. User selects release / team filters; KPIs and charts update instantly.
4. User can click a team row to view per-developer contributions.

## API Endpoints

- `teamGoalService.getTeamGoals(release?: string)` — aggregates per-developer
  scores into team-level metrics (implemented in `src/features/team-goal/api`).

## Environment Variables

None specific to this feature. Inherits global `appConfig` values and Jira proxy.

## Grid Columns

| Column | Field |
| ------ | ----- |
| Team   | `teamName` |
| Total Complexity | `totalComplexity` |
| Pass/Fail | `meetsTeamGoal` |
| Top Contributors | `topContributors` |

## Filters

- Release (multi-select)
- Team (searchable dropdown)

## Validation Rules

- Numeric values for complexity are parsed and default to `0` on invalid input.
- Team goal targets must be positive integers; invalid targets fall back to the
  global default defined in `src/features/team-goal/constants`.

## Error Handling

Renders `StateView` for loading/empty/error/success. Errors are normalized via
`apiErrorHandler` and shown as friendly messages.

## Dependencies

- `@shared/components` (KpiCard, DataChart, StateView)
- `@features/goal-setting` (for per-developer score calculations)
- `@tanstack/react-query`

## Jest Test Scenarios

- `teamGoalService.test.ts` — aggregation and pass/fail logic.
- `TeamGoalPage.test.tsx` — rendering of KPIs, charts, filters, empty state.

## Playwright Test Scenarios

- `playwright/team-goal.spec.ts` — renders KPIs and verifies filter-driven updates.

## Implementation Notes

- Data is derived from the `goal-setting` feature's per-developer computations
  to avoid duplication of scoring logic.
- Team-level aggregations are memoized for performance and updated when
  underlying per-developer data changes.

## Related Files

- `src/features/team-goal/services/teamGoalService.ts`
- `src/features/team-goal/hooks/useTeamGoal.ts`
- `src/features/team-goal/pages/TeamGoalPage.tsx`


