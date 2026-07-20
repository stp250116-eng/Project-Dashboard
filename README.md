# Enterprise Dashboard

A modern, enterprise-grade dashboard built with **React 19**, **TypeScript**, and
**Vite**. It aggregates data from internal APIs and **Jira** (boards, projects,
issues, sprints, releases).

## Tech Stack

- React 19, TypeScript (strict), Vite, React Router
- TanStack Query, Axios, Zustand
- React Hook Form, Zod, date-fns
- KendoReact (Grid, Chart, Form, Dialog, Layout)
- Jest, React Testing Library, MSW, Playwright
- ESLint, Prettier

## Getting Started

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev
```

Open http://10.225.7.25:5689.

## Developer prerequisites

This repository expects Node >= 18.18.0 and standard npm install flows. To ensure deterministic installs and avoid missing devDependencies (MSW, Playwright, etc.), use:

```bash
# install exact versions from package-lock.json
npm ci

# if you don't have a lockfile yet
npm install

# then copy example env and run dev
cp .env.example .env.local
npm run dev
```

If tests fail locally with module-resolution errors for `msw`, run `npm ci` to restore devDependencies.

## Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite dev server            |
| `npm run build`         | Type-check and build for production  |
| `npm run preview`       | Preview the production build         |
| `npm run lint`          | Run ESLint                           |
| `npm run format`        | Format with Prettier                 |
| `npm test`              | Run Jest unit/component tests        |
| `npm run test:coverage` | Run tests with coverage              |
| `npm run e2e`           | Run Playwright smoke tests           |
| `npm run typecheck`     | Type-check without emitting          |

## Project Structure

See [docs/architecture.md](docs/architecture.md). Summary:

```
src/
├── app/            # shell: layouts, providers, router, styles
├── features/       # dashboard, defect-dashboard, complexity-point,
│                  # developer-training-dashboard, goal-setting,
│                  # overdue-point-dashboard
├── integrations/   # jira
├── shared/         # api, components, hooks, services, constants, types
└── main.tsx
```

### Removed features

- The following feature modules were removed in the recent refactor and
   their routes, pages, and tests were deleted: `jira-overview`,
   `sprint-board`, `release-dashboard`, `team-capacity`, and `reports`.
   See `docs/changelog.md` for details and migration notes.

## Documentation

- [Architecture](docs/architecture.md)
- [Coding Standards](docs/coding-standards.md)
- [Testing Guidelines](docs/testing-guidelines.md)
- [Jira Integration](docs/jira-integration.md)
- [Changelog](docs/changelog.md)
- ADRs: [001](docs/decisions/ADR-001-project-structure.md),
  [002](docs/decisions/ADR-002-jira-integration.md),
  [003](docs/decisions/ADR-003-authentication.md)

## Jira Configuration (Developer Steps)

1. Create a Jira API token at
   https://id.atlassian.com/manage-profile/security/api-tokens.
2. Provision a **server-side proxy/BFF** or the **Jira MCP server** that holds
   the token. The browser must never hold `JIRA_API_TOKEN`.
3. Set environment variables in `.env.local`:
   - `VITE_JIRA_BASE_URL` → your Jira Cloud URL or proxy/MCP endpoint
   - `VITE_JIRA_PROJECT_KEY` → e.g. `DASH`
   - `VITE_ENABLE_JIRA=true`
   - `JIRA_API_TOKEN` → **only** on the server / MCP host, never the client
4. (Optional) Configure MCP via [mcp/jira-mcp-config.json](mcp/jira-mcp-config.json).

## License

Proprietary — internal use only.

## Theme / Dark Mode

The dashboard ships with a full **Light / Dark mode** toggle located in the header (top-right navbar).

| Feature | Details |
|---------|---------|
| Toggle control | Sun/Moon icon button in the header navbar |
| Persistence | `localStorage` key `theme` (`'light'` or `'dark'`) |
| CSS mechanism | Adds/removes the `.dark-theme` class on the `<html>` element |
| Variables file | `src/app/styles/global.css` |
| Contrast | WCAG AA — light text (`#ecf0f6`) on dark background (`#121820`) |
| Coverage | All app shell, KPI cards, surfaces, filters, KendoReact grids/inputs, scrollbars |
| Transition | Smooth 300ms background/color transition on toggle |

### How it works

1. The `<Header>` component (`src/app/layouts/Header.tsx`) holds a `useState` hook initialised from `localStorage`.
2. A `useEffect` applies or removes the `dark-theme` class on the document root whenever the state changes.
3. CSS custom properties (variables) in `:root` define light defaults; `.dark-theme` overrides them.
4. Additional dark-specific rules override hardcoded colours (active sidenav, error backgrounds, KendoReact widgets, page gradients).

### Customising colours

Edit the `.dark-theme { ... }` block in `src/app/styles/global.css`. All component styles reference `var(--color-*)` tokens, so a single change propagates everywhere.
