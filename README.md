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

Open http://localhost:5173.

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
├── features/       # dashboard, jira-overview, sprint-board, …
├── integrations/   # jira
├── shared/         # api, components, hooks, services, constants, types
└── main.tsx
```

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
