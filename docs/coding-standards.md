# Coding Standards

## Language & Types

- TypeScript **strict mode** is mandatory.
- `any` is forbidden (`@typescript-eslint/no-explicit-any: error`).
- Prefer explicit interfaces for public contracts and domain models.

## Components

- Functional components with hooks only.
- Maximum **300 lines** per component; split when larger.
- Single responsibility; design for reuse.
- Provide accessible markup (semantic HTML, `aria-*`, keyboard support).

## State & Data

- Server state via **TanStack Query** — no manual `useEffect` fetching.
- Client state via **Zustand**; avoid large Context providers.
- Always set `queryKey`; tune `staleTime` / `gcTime` / `retry` deliberately.

## API Access

- Axios only, via `shared/api` — never call APIs directly from components.
- All errors normalized through `apiErrorHandler` into `AppError`.
- External responses mapped to internal domain models (see Jira mapper).

## Logging

- Use `LoggerService` exclusively.
- `console.log` / `console.error` are forbidden in committed code
  (enforced by ESLint `no-console: error`). The single sanctioned exception is
  inside `LoggerService` itself.

## Imports

Use path aliases: `@/`, `@app/`, `@features/`, `@integrations/`, `@shared/`.

## Formatting & Linting

- Prettier (single quotes, semicolons, trailing commas, width 100).
- ESLint must pass with no errors before a task is complete.

## Environment

- Never hardcode secrets, tokens, API keys, or URLs.
- Read configuration through `shared/constants/appConfig` only.
- `import.meta.env` is accessed in exactly one place — `shared/config/env.ts`.
  Everything else reads `appConfig`. (Jest aliases the env module to a mock.)

## Documentation

Documentation is part of the source. Any change to behavior, contracts, env
vars, structure, or tests must update the corresponding docs in the same task.
