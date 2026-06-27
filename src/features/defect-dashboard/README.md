# Defect Dashboard Feature

## Feature Purpose

An interactive data-analytics dashboard for analyzing developer defects. Every
time the page loads it pulls live data from the Jira saved filter
**"GET ALM DEFECT"** (filter id `11471`) and lets the user slice the data by
release, developer, and severity, then explore trends and distributions.

## Business Requirements

- Pull real-time defects from the Jira filter **GET ALM DEFECT** on every visit
  (no stale snapshots; React Query `staleTime` of 60s with auto-refetch).
- Provide multi-select filters for **Release**, **Developer (Owner)**,
  **Severity**, and **Root Cause** that update every chart immediately.
- Show KPI cards: Total Defects, Total Developers, the Most Frequent
  Severity, and the Top Defect Developer (developer with the most defects,
  annotated with the defect count).
- Visualize: defect **trend by release** (one line per developer), defects
  **by severity**, **distribution** by developer, **top developers** with
  most defects, and **root cause distribution**.
- Instagram-minimal UI using the Kanit font, rounded cards, and a responsive
  (mobile-friendly) layout.

## User Flow

1. User navigates to `/defect-dashboard`.
2. The page calls `useJiraDefects()` which fetches `filter = 11471` from Jira.
3. Raw issues are mapped to `DefectRecord`s and analyzed client-side.
4. The user adjusts filters; all charts and KPIs recompute instantly.

## Data Source & Field Mapping

| Concept       | Jira source                                                     |
| ------------- | -------------------------------------------------------------- |
| Defect set    | Saved filter `GET ALM DEFECT` (id `11471`)                     |
| JQL           | `project = OO AND issuetype = Bug AND summary !~ "BOD"`        |
| Severity      | `customfield_10709` (`.value`, e.g. `2 - High` → `High`)       |
| Root Cause    | `customfield_11886` (`.value`, e.g. `Coding Error`)            |
| Developer     | `assignee.displayName` (fallback `Unassigned`)                 |
| Release       | parsed from `fixVersions[].name` (`v<major>.<minor>…`, e.g. `v26.2.2`), else `No Release` |

> The browser never calls Jira Cloud directly (CORS). Requests go to the
> same-origin `/jira` path, which the Vite dev proxy (or a production BFF)
> forwards to Jira with auth injected server-side.

## API Endpoints

- `GET /jira/rest/api/3/search?jql=filter = 11471&fields=…` (paginated, page
  size 100) via `jiraApi.getDefects()` and the `useJiraDefects()` React Query
  hook. `/jira` is proxied to Jira Cloud.

## Environment Variables

`VITE_JIRA_API_BASE` (client proxy path, default `/jira`), `VITE_JIRA_BASE_URL`
(proxy target), `VITE_JIRA_PROJECT_KEY`, `VITE_ENABLE_JIRA`. `JIRA_EMAIL` and
`JIRA_API_TOKEN` are server-side only (used by the proxy for Basic auth, never
in the bundle).

## Filters

- **Release** — multi-select (parsed from each defect's Fix Version).
- **Developer** — multi-select of assignee display names.
- **Severity** — multi-select (`Critical`/`High`/`Medium`/`Low`/`Unknown`).
- **Root Cause** — multi-select of root-cause labels (`Unknown` when unset).

## Charts / Visualizations

| Visualization     | Type        |
| ----------------- | ----------- |
| Trend by release  | multi-line  |
| By severity       | column      |
| Distribution      | donut       |
| Top developers    | bar         |
| Root cause dist.  | donut       |

## Validation Rules

None (read-only analytics).

## Error Handling

`StateView` covers loading, empty, error, and success states. The empty state
reads "No defects found for the GET ALM DEFECT filter." Raw exceptions are never
surfaced.

## Dependencies

`@integrations/jira` (`useJiraDefects`, mappers), `@shared/components`
(`KpiCard`, `DataChart`, `StateView`), `@progress/kendo-react-charts`,
`@progress/kendo-react-dropdowns`, `@tanstack/react-query`.

## Jest Test Scenarios

- `defectAnalytics.test.ts` — `collectFilterOptions`, `filterDefects`, and
  `buildDefectAnalytics` (KPIs, trend series, severity ordering, root-cause
  options/aggregation, top-N).
- `DefectDashboardPage.test.tsx` — heading, KPI cards, filters render (incl.
  Root Cause), and the empty state when no defects are returned.
- Mapper coverage in `jiraMapper.test.ts` — release parsing, severity
  normalization, root-cause normalization, defect mapping, null handling,
  collection mapping.

## Playwright Test Scenarios

`playwright/defect/defect-dashboard.spec.ts` (intercepts `/rest/api/3/search`
with a fixture, including the CORS preflight):

- Renders the heading and the KPI cards.
- Renders the trend, severity, top-developers, and root-cause-distribution
  charts.
- Filters by severity and shows the selected token.
- Filters by root cause and shows the selected token.

`playwright/defect/defect-dashboard-components.spec.ts` (same fixture/stub;
attaches a PNG screenshot of each key state to the HTML report):

- Release dropdown opens and lists release options.
- Developer dropdown opens and lists developers.
- Severity dropdown opens, selects an option, and renders the chip.
- Root cause dropdown opens, selects an option, and renders the chip.
- Reset clears the selected filter chip.
