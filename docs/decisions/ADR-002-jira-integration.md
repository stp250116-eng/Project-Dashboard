# ADR-002: Jira Integration

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

The dashboard depends heavily on Jira data (issues, boards, sprints, releases).
Jira's REST responses are verbose and may change; credentials must never reach
the browser bundle.

## Decision

Encapsulate all Jira access in `src/integrations/jira` with a strict pipeline:

```
Jira API / MCP → jiraApi → jiraMapper → React Query (jiraQueries) → UI
```

- `jiraApi` uses the shared Axios client.
- `jiraMapper` converts raw responses into internal domain models
  (`jiraTypes`), so the UI never depends on Jira's wire format.
- React Query hooks provide caching and retries.
- Authentication is handled by a **server-side proxy/BFF** or an **MCP server**;
  `JIRA_API_TOKEN` is server-side only.

## Consequences

- UI is insulated from Jira schema changes (only the mapper changes).
- Credentials remain server-side, satisfying security requirements.
- Same `jiraApi` surface works against REST or MCP transports.
- Requires a proxy/MCP deployment for production Jira access.
