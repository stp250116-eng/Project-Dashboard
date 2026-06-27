# Jira Integration

This document describes how the dashboard integrates with Jira Cloud. The
implementation lives in `src/integrations/jira` (see its
[README](../src/integrations/jira/README.md)).

## Goals

- Support Jira Cloud REST API and MCP-backed access.
- Keep the UI decoupled from Jira's wire format via internal domain models.
- Use React Query for caching and retries.
- Never expose Jira credentials to the client.

## Data Flow

```
Browser → /jira (same-origin) → Vite dev proxy / BFF → Jira Cloud REST API
         → jiraApi.ts → jiraMapper.ts → React Query (jiraQueries.ts) → UI
```

The browser never calls Jira Cloud directly — Jira Cloud's REST API does not
send CORS headers, so a direct XHR fails with a network error. Instead the
client calls the same-origin path `VITE_JIRA_API_BASE` (default `/jira`), which
is proxied to `VITE_JIRA_BASE_URL` with auth injected server-side.

## Modules

| File               | Responsibility                            |
| ------------------ | ----------------------------------------- |
| `jiraApi.ts`       | REST calls via the shared Axios client    |
| `jiraQueries.ts`   | React Query hooks                         |
| `jiraMapper.ts`    | Raw → internal domain model mapping       |
| `jiraTypes.ts`     | Domain models + raw response contracts    |
| `jiraConstants.ts` | Endpoints, query keys, defaults           |

## Saved Filters — GET ALM DEFECT

The Defect Dashboard consumes the saved Jira filter **GET ALM DEFECT**
(id `11471`, JQL `project = OO AND issuetype = Bug AND summary !~ "BOD"
ORDER BY created DESC`). It is fetched on every page load via `getDefects()` /
`useJiraDefects()` using the enhanced search endpoint
`GET /rest/api/3/search/jql` (`jql = filter = 11471`, page size 100, paginated
via `nextPageToken`).

Defect field mapping:

| Field      | Jira source                                                    |
| ---------- | -------------------------------------------------------------- |
| Severity   | `customfield_10709` (`.value`, `2 - High` → `High`)            |
| Root Cause | `customfield_11886` (`.value`, e.g. `Coding Error`)            |
| Developer  | `assignee.displayName` (fallback `Unassigned`)                 |
| Release    | parsed from `fixVersions[].name` (`v<major>.<minor>…`, e.g. `v26.2.2`), else `No Release` |

## Environment Variables

| Variable                | Scope        | Purpose                                   |
| ----------------------- | ------------ | ----------------------------------------- |
| `VITE_JIRA_API_BASE`    | client       | Same-origin proxy path (default `/jira`)  |
| `VITE_JIRA_BASE_URL`    | server/proxy | Real Jira Cloud base URL (proxy target)   |
| `VITE_JIRA_PROJECT_KEY` | client       | Default project key                       |
| `VITE_ENABLE_JIRA`      | client       | Feature flag                              |
| `JIRA_EMAIL`            | server only  | Atlassian account email (Basic auth user) |
| `JIRA_API_TOKEN`        | server only  | Atlassian API token (never bundled)       |

## Authentication

The browser must never hold a Jira API token. The client calls the same-origin
`VITE_JIRA_API_BASE` path; a proxy injects credentials:

1. **Dev:** the Vite dev server proxies `/jira/*` to `VITE_JIRA_BASE_URL` and
   sets `Authorization: Basic base64(JIRA_EMAIL:JIRA_API_TOKEN)` on each
   request. Both `JIRA_EMAIL` and `JIRA_API_TOKEN` must be set in `.env` for the
   dashboard to load live data.
2. **Prod:** a server-side proxy / BFF (or MCP server, see
   `mcp/jira-mcp-config.json`) serves the same `/jira` path and injects auth.

Generate an API token at
https://id.atlassian.com/manage-profile/security/api-tokens.

## Developer Setup

See the root README "Jira configuration steps" section.

## Related Decision

- [ADR-002 Jira Integration](decisions/ADR-002-jira-integration.md)
