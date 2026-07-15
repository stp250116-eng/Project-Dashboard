# Architecture

## Overview

The Enterprise Dashboard is a React 19 + TypeScript single-page application built
with Vite. It aggregates data from internal APIs and Jira (boards, projects,
issues, sprints, releases) and presents it through feature-based dashboards.

## Principles

- **Clean Architecture** + **Feature-Based Architecture**
- **SOLID**, **DRY**, **KISS**, **Separation of Concerns**
- Readability and maintainability over cleverness

## Layered Structure

```
UI (features/*/pages, components)
        ↓ hooks (React Query)
Integration / Service layer (integrations/jira, feature services)
        ↓ shared/api (Axios client + interceptors)
External APIs (Internal API, Jira REST / MCP)
```

## Folder Structure

```
src/
├── app/            # shell: layouts, providers, router, guards, styles
├── features/       # feature modules (dashboard, defect-dashboard, complexity-point, developer-training-dashboard, goal-setting, overdue-point-dashboard, team-goal)
├── integrations/   # external system integrations (jira)
├── shared/         # api, components, hooks, services, constants, types, utils
└── main.tsx        # entry point
```

Each feature follows: `api / hooks / models / components / pages / services /
utils / tests / README.md`.

## Data Flow

1. A page calls a React Query hook.
2. The hook calls a service or the Jira integration.
3. Requests go through the shared Axios client (`shared/api`).
4. Interceptors attach auth + correlation headers and normalize errors.
5. Responses are mapped to internal domain models before reaching the UI.

## State Management

- **Server state:** TanStack Query (caching, retries, staleTime/gcTime).
- **Client state:** Zustand (lightweight stores; avoid large Context providers).

## Error Handling

All failures are normalized into `AppError` by `apiErrorHandler`. Every page
renders the four mandatory states via `StateView`: loading, error, empty, success.
Raw exception messages are never shown to users.

## Logging

All logging flows through `LoggerService`. Direct `console.*` usage is forbidden.

## UI Library

KendoReact provides Grid, Chart, Form, Dialog, and Layout primitives. Reusable
wrappers live in `shared/components` (`DataGrid`, `DataChart`, `KpiCard`,
`FilterPanel`) to avoid duplicated configuration.

## Security

- No secrets, tokens, or URLs hardcoded — all via environment variables.
- Jira token is server-side only and never bundled into the client.
- Auth is injected via the shared request interceptor.

## Related Decisions

- [ADR-001 Project Structure](decisions/ADR-001-project-structure.md)
- [ADR-002 Jira Integration](decisions/ADR-002-jira-integration.md)
- [ADR-003 Authentication](decisions/ADR-003-authentication.md)
