# Reports Feature

## Feature Purpose

Catalog of reports with Excel and PDF export capabilities.

## Business Requirements

- List available reports by category and format.
- Allow Excel and PDF export.
- Respect the `VITE_ENABLE_REPORTS` feature flag.

## User Flow

1. User navigates to `/reports`.
2. Reports load via React Query.
3. User exports a report to Excel or PDF.

## API Endpoints

Report metadata + server-side export service. Currently mock data; export is scaffolded.

## Environment Variables

`VITE_ENABLE_REPORTS` (toggles the feature).

## Grid Columns

| Column   | Field      |
| -------- | ---------- |
| Report   | `name`     |
| Category | `category` |
| Format   | `format`   |
| Last Run | `lastRun`  |

## Filters

Category filter (scaffolded).

## Validation Rules

None.

## Error Handling

`StateView` for loading / error / empty / success; disabled-feature empty state.

## Dependencies

`@shared/components`, `@shared/services/logger`, `@tanstack/react-query`.

## Jest Test Scenarios

- `exportService` produces correct xlsx / pdf file names.
- Page renders heading and export buttons.

## Playwright Test Scenarios

- Navigate to Reports and verify export buttons render.
