# ADR-001: Project Structure

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

The Enterprise Dashboard must scale across many feature areas (dashboard, Jira
overview, sprint board, releases, defects, capacity, reports) and integrations.
We need a structure that supports independent feature development, testability,
and clear ownership.

## Decision

Adopt a **feature-based architecture** layered over **clean architecture**:

```
src/
├── app/            # shell: layouts, providers, router, guards, styles
├── features/       # self-contained feature modules
├── integrations/   # external system integrations (jira)
├── shared/         # cross-cutting api, components, hooks, services, types
└── main.tsx
```

Each feature owns: `api / hooks / models / components / pages / services /
utils / tests / README.md`.

Path aliases (`@`, `@app`, `@features`, `@integrations`, `@shared`) decouple
modules from relative-path fragility.

## Consequences

- Features can evolve and be tested in isolation.
- Shared concerns are centralized, avoiding duplication.
- A mandatory per-feature README enforces living documentation.
- Slightly more boilerplate per feature, accepted for consistency.
