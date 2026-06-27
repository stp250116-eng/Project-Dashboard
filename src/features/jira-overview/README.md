# Jira Overview Feature

## Feature Purpose

Consolidated view of Jira issues: open vs. closed counts, status breakdown, and
a sortable/pageable issue grid.

## Business Requirements

- Show open, closed, and assigned issue counts.
- Visualize status breakdown.
- List issues with key, summary, status, assignee, priority.

## User Flow

1. User navigates to `/jira-overview`.
2. Issues and aggregates load via React Query.
3. User sorts/pages through the issue grid.

## API Endpoints

Backed by `@integrations/jira` (`searchIssues` via JQL). Currently mock data.

## Environment Variables

`VITE_JIRA_BASE_URL`, `VITE_JIRA_PROJECT_KEY`, `VITE_ENABLE_JIRA`.

## Grid Columns

| Column   | Field      |
| -------- | ---------- |
| Key      | `key`      |
| Summary  | `summary`  |
| Status   | `status`   |
| Assignee | `assignee` |
| Priority | `priority` |

## Filters

Status / assignee filters (scaffolded for extension).

## Validation Rules

None (read-only).

## Error Handling

`StateView` for loading / error / empty / success.

## Dependencies

`@integrations/jira`, `@shared/components`, `@tanstack/react-query`.

## Jest Test Scenarios

- Renders heading.
- Shows open and closed KPI cards.

## Playwright Test Scenarios

- Navigate to Jira Overview and verify grid renders.
