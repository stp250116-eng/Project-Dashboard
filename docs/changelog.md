# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed

- **Defect Dashboard — Release-based slicing** replaces the previous Year
  dimension. The Fix Version is now surfaced as a **Release** label parsed from
  `fixVersions[].name` (e.g. `OO Release v26.2.2 #R2026Q2` → `v26.2.2`, falling
  back to `No Release`):
  - The **Year** filter is replaced by a **Release** multi-select.
  - The trend chart now plots **defects by release per developer**
    (`Defect Trend by Release`).
  - Jira integration: `JiraDefect.year` → `JiraDefect.release`, and
    `parseDefectYear` → `parseDefectRelease`.
  - Tests and fixtures updated accordingly (`jiraMapper.test.ts`,
    `defectAnalytics.test.ts`, `DefectFilters.test.tsx`,
    `DefectDashboardPage.test.tsx`, `playwright/defect/*`).

### Added

- **Defect Dashboard — Top Defect Developer KPI** card showing the developer
  with the most defects in the filtered dataset, annotated with the defect
  count (e.g. `Wasapon — 2 defects`). Recomputes with the active filters and
  falls back to `—` when there are no defects. Covered by `defectAnalytics.test.ts`,
  `DefectDashboardPage.test.tsx`, and `playwright/defect/defect-dashboard.spec.ts`.
- **Defect Dashboard — Root Cause analytics** sourced from the Jira single-select
  field `customfield_11886`:
  - New **Root Cause** multi-select filter.
  - New charts: **Root Cause Distribution** (donut).
  - Jira integration additions: `rootCause` on the `JiraDefect` model,
    `normalizeRootCause` mapper, and `JIRA_DEFECT_FIELDS.rootCause`
    (`customfield_11886`) added to the requested fields.
  - Tests updated: `defectAnalytics.test.ts`, `DefectFilters.test.tsx`,
    `DefectDashboardPage.test.tsx`, `jiraMapper.test.ts`, and the
    `playwright/defect/*` specs (fixtures + root-cause interactions).
- **Test coverage raised to 100%** (statements, branches, functions, lines)
  across all collectable source files. New/expanded Jest suites cover the app
  shell (layouts, providers, router), Jira integration (`jiraApi`,
  `jiraQueries`, `jiraConstants`, mapper edge cases), the shared API layer
  (`apiClient`, `interceptors`, `apiErrorHandler`), shared components/hooks
  (`DataChart`, `FilterPanel`, `StateView`, `useToggle`, `LoggerService`,
  `appConfig`), and every feature page (loading/empty/error/success states).
- **Custom Jest environment** (`test/helpers/jsdom-web-apis-env.cjs`) that adds
  Node Web API globals and aligns `AbortController`/`AbortSignal` so
  react-router `RouterProvider` navigation works under jsdom. Wired via
  `testEnvironment` in `jest.config.cjs`.

### Changed

- `ReportsPage` export buttons now render only when report data is present,
  removing a redundant always-disabled guard.
- `appConfig` exposes an internal `__test__.toBool` helper for unit testing the
  env-flag parsing branches.

- **Defect Dashboard** — interactive defect analytics page backed by the live
  Jira saved filter **GET ALM DEFECT** (id `11471`), fetched on every visit via
  `useJiraDefects()`:
  - Multi-select filters (Release, Developer, Severity) that recompute all
    visuals.
  - KPI cards (Total Defects, Total Developers, Most Frequent Severity) and
    charts: trend-by-release (multi-line per developer), severity (column),
    distribution by developer (donut), top developers (bar).
  - Jira integration additions: `getDefects()`, `useJiraDefects()`,
    `mapJiraDefect`/`mapJiraDefects`, `parseDefectRelease`, `normalizeSeverity`,
    and `JIRA_DEFECT_FILTER`/`JIRA_DEFECT_FIELDS` constants (severity
    `customfield_10709`, release from `fixVersions`).
  - `DataChart` extended to support `column`/`bar`/`line`/`area`/`pie`/`donut`
    with tooltips and configurable height.
  - Kanit font + Instagram-minimal, responsive styling.
  - Tests: `defectAnalytics.test.ts`, rewritten `DefectDashboardPage.test.tsx`,
    mapper defect cases, and `playwright/defect/defect-dashboard.spec.ts`.
- **Jira dev proxy** — the browser now reaches Jira through the same-origin
  `/jira` path (new `VITE_JIRA_API_BASE`, default `/jira`). The Vite dev server
  proxies `/jira/*` to `VITE_JIRA_BASE_URL` and injects Basic auth from
  `JIRA_EMAIL` + `JIRA_API_TOKEN` server-side. Fixes the "Unable to reach the
  server" error caused by direct (CORS-blocked) Jira Cloud calls and a stale
  placeholder host in the dev env files.
- **Jira enhanced search migration** — migrated issue/defect search from the
  removed `GET /rest/api/3/search` endpoint to `GET /rest/api/3/search/jql`,
  switching pagination from `startAt`/`total` to the `nextPageToken` cursor
  (`RawJiraSearchResponse` now exposes `nextPageToken`/`isLast`). Fixes the
  `410 Gone` "An unexpected error occurred" failure.
- Initial application skeleton: React 19 + TypeScript + Vite.
- Tooling: ESLint, Prettier, Jest + React Testing Library, MSW, Playwright.
- Path aliases (`@`, `@app`, `@features`, `@integrations`, `@shared`).
- Shared infrastructure:
  - Axios API client with request/response interceptors.
  - Centralized error normalization (`apiErrorHandler` → `AppError`).
  - `LoggerService` (sanctioned logging mechanism).
  - TanStack Query client + `AppProviders`.
  - Application shell: header, left navigation, footer, routed layout.
  - Reusable KendoReact wrappers: `DataGrid`, `DataChart`, `KpiCard`,
    `FilterPanel`, plus `StateView` for the four UI states.
- Jira integration scaffolding (`jiraApi`, `jiraQueries`, `jiraMapper`,
  `jiraTypes`, `jiraConstants`, README).
- Feature modules: dashboard, jira-overview, sprint-board, release-dashboard,
  defect-dashboard, team-capacity, reports — each with pages, hooks, models,
  tests, and README.
- Jest unit/component tests for shared services and feature pages.
- Playwright smoke tests: startup, navigation, dashboard, Jira overview,
  sprint board, reports.
- Documentation: architecture, coding standards, testing guidelines, Jira
  integration, ADR-001/002/003.
- Environment files and `.env.example`.
- MCP configuration (`mcp/jira-mcp-config.json`).

### Fixed

- React 19 compatibility: restored the global `JSX` namespace via
  `src/global.d.ts` (React 19's `@types/react` moved it under `React.JSX`).
- `StateView` now accepts `AppError | Error | null` so React Query's
  `Error`-typed query errors type-check.
- Removed an unused `vitest` type reference from `vite.config.ts`.
- ESLint `no-console` rule config corrected (invalid empty `allow` array).
- Jest/ts-jest now type-check against a dedicated `tsconfig.jest.json`
  (path aliases + JSX shim).
- Centralized `import.meta.env` access in `src/shared/config/env.ts`, aliased to
  a Jest mock (`test/mocks/env.ts`) so tests compile without `import.meta`.
- Corrected the global stylesheet import path in `src/main.tsx`
  (`./app/styles/global.css`).
- Pinned Vite to `^5.4.9`; an earlier `npm audit fix --force` had force-upgraded
  it to an incompatible major (v8) that broke the React plugin and dependency
  pre-bundling. (Do not run `npm audit fix --force`.)
- Opted into React Router v7 future flags (`createBrowserRouter` future options
  and `RouterProvider` `v7_startTransition`) to silence migration warnings.
- Fixed KendoReact Charts runtime crash "Class constructor Class cannot be
  invoked without 'new'" (`ShapeBuilder`): the ESM builds of
  `@progress/kendo-charts` use ES5-style inheritance against
  `@progress/kendo-drawing`'s native `class Class`, which esbuild cannot
  reconcile. `vite.config.ts` now aliases both geometry packages to their
  internally-consistent CommonJS (`dist/npm/main.js`) builds.
