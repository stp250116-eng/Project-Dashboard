---
description: "Use when creating or modifying a dashboard feature under src/features/** — enforces the mandatory feature folder structure, data-flow boundaries (API → mapper → React Query → UI), state conventions, and the per-feature README/test sync requirement."
applyTo: "src/features/**"
---

# Feature Authoring Rules

Applies to everything under `src/features/<feature-name>/`. For global rules see
[copilot-instructions.md](../copilot-instructions.md); read the feature's own
`README.md` before editing it (closest doc wins).

## Mandatory folder shape

Every feature must contain these folders/files (omit a folder only if truly empty):

```
<feature-name>/
├── api/         # feature-specific request builders (thin; no axios in components)
├── hooks/       # React Query hooks + feature view-model hooks
├── models/      # domain types/interfaces for this feature
├── components/  # presentational + container components (≤300 lines each)
├── pages/       # route-level entry component
├── services/    # pure, side-effect-free analytics/transform logic
├── tests/       # Jest tests (or co-located *.test.ts(x))
└── README.md    # REQUIRED — keep in sync with the code
```

## Data flow (do not bypass)

```
Jira/API → integrations or feature api/ → mapper → React Query hook → page/component
```

- Never call axios/`fetch` directly from a component. Go through a hook.
- Map external responses to feature `models/` types — never render raw API shapes.
- Keep `services/` pure (same input → same output, no I/O) so they are trivially
  unit-testable and memoizable in hooks.

## State & server data

- **Server state** → TanStack Query only. Set `queryKey`, `staleTime`, and
  `retry`; do not fetch in `useEffect`.
- **Client state** → Zustand for shared UI state; local `useState` otherwise.
  Avoid large Context providers.

## UI & quality bar

- Functional components only; single responsibility; **≤300 lines** per component.
- Every page must handle **loading / empty / error / success** (use the shared
  `StateView`). Never surface raw exception messages.
- Use shared wrappers (`@shared/components` grid/chart/form) over ad-hoc KendoReact
  config. Import via path aliases (`@features/*`, `@shared/*`, `@integrations/*`).
- No `any`. No committed `console.*` — use the logger service.

## Definition of done (per feature change)

- Update the feature `README.md` (purpose, API endpoints, filters, env vars,
  validation, test scenarios) in the **same change**.
- Add/update Jest tests (components, hooks, services, mappers) and Playwright
  coverage for new user-visible behavior.
- `npm run typecheck` and `npm run lint` pass.
