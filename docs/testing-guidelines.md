# Testing Guidelines

## Frameworks

- **Jest** + **React Testing Library** for unit/component tests.
- **MSW** is available for HTTP-level mocking, but the unit suite mocks at the
  **module boundary** instead (see _Mocking_ below).
- **Playwright** for end-to-end smoke tests.

## Jest environment

The suite runs under a custom environment, `test/helpers/jsdom-web-apis-env.cjs`
(wired via `testEnvironment` in `jest.config.cjs`). It extends
`jest-environment-jsdom` and injects the Node Web API globals
(`Request`/`Response`/`Headers`/`fetch`/streams/`TextEncoder`, etc.) and aligns
`AbortController`/`AbortSignal` with Node's implementations. This is required so
react-router's `createBrowserRouter`/`RouterProvider` can build request objects
during navigation inside jsdom.

## Coverage

- The full unit suite is at **100%** statements, branches, functions, and lines.
- The enforced CI threshold remains lower and ratchets up; do not lower it.
- Test components, hooks, services, API mappers, and utilities.
- Every feature must include tests.
- Generate the report with `npm run test:coverage` (json-summary +
  text-summary). The machine-readable totals live in
  `coverage/coverage-summary.json`.

## Unit / Component Tests

- Co-locate tests under each feature's `tests/` folder or beside the unit.
- Render React Query consumers with a fresh `QueryClient` (retry disabled).
- Assert on accessible roles/labels, not implementation details.
- Use fixtures from `test/fixtures` and MSW handlers from `test/mocks`.

Run:

```
npm test
npm run test:coverage
```

## Mocking

The unit suite mocks at the **module boundary** for determinism and speed:

- **Jira data access**: mock `@shared/api`'s `createApiClient` (e.g. in
  `jiraApi.test.ts`) or the `jiraApi`/`useJira*` hooks (e.g. in
  `jiraQueries.test.tsx`, `DefectDashboardPage.test.tsx`).
- **Page data hooks**: mock the feature hook (`useReleases`, `useTeamCapacity`,
  `useReports`) and drive loading/empty/error/success states via the mocked
  `UseQueryResult`. Exercise the real hook separately with `jest.requireActual`
  + `renderHook` to keep the hook itself covered.
- **KendoReact widgets**: replace heavy inputs (e.g. `MultiSelect`) with light
  stand-ins when a handler needs to be triggered (see `DefectFilters.test.tsx`).
- Use realistic fixtures from `test/fixtures` (e.g. `jiraIssues.ts`,
  `jiraDefects.ts`).

MSW handlers (`test/mocks/handlers.ts`, `test/mocks/server.ts`) remain available
for HTTP-level scenarios; prefer boundary mocking for unit tests.

## End-to-End Tests

- Located in `playwright/<area>/*.spec.ts`.
- Cover: application startup, navigation, dashboard rendering, Jira integration,
  filtering, sorting, exporting, error handling, authentication.
- The Playwright config auto-starts the Vite dev server.

Run:

```
npm run e2e
npm run e2e:ui
```

## Naming

- Unit: `<Subject>.test.ts(x)`
- E2E: `<area>.spec.ts` (e.g. `dashboard.spec.ts`, `jira-overview.spec.ts`)

## Definition of Done (testing)

- New/changed behavior has Jest coverage.
- New features/flows have Playwright coverage.
- `npm test` and `npm run e2e` pass locally.
