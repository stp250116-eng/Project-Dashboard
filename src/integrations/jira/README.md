# Jira Integration

Integration layer between the Enterprise Dashboard and Jira Cloud. All Jira
access flows through this module so the rest of the app depends only on internal
domain models, never on Jira's wire format.

## Data Flow

```
Jira API / MCP
   ↓
jiraApi.ts        → HTTP calls (Axios via shared client)
   ↓
jiraMapper.ts     → map raw Jira responses → internal domain models
   ↓
jiraQueries.ts    → React Query hooks (caching, retries)
   ↓
UI Component
```

## Files

| File               | Responsibility                                            |
| ------------------ | --------------------------------------------------------- |
| `jiraApi.ts`       | REST calls to Jira Cloud / MCP proxy (incl. `getDefects`) |
| `jiraQueries.ts`   | React Query hooks (`useJiraIssues`, `useJiraDefects`, …)  |
| `jiraMapper.ts`    | Maps raw Jira payloads to internal models (incl. defects) |
| `jiraTypes.ts`     | Internal domain models + raw response contracts           |
| `jiraConstants.ts` | Endpoints, query keys, defaults, defect filter/fields     |

## Defect Filter (GET ALM DEFECT)

The defect dashboard reads the saved Jira filter **GET ALM DEFECT** (id `11471`,
JQL `project = OO AND issuetype = Bug AND summary !~ "BOD"`).

| Function / Hook    | Responsibility                                               |
| ------------------ | ------------------------------------------------------------ |
| `getDefects()`     | `GET /rest/api/3/search/jql` (`filter = 11471`, token paging) |
| `useJiraDefects()` | React Query hook (`staleTime` 60s) returning `JiraDefect[]`  |
| `mapJiraDefects()` | Maps raw issues → `JiraDefect` domain records                |

Defect field mapping:

| Field      | Source                                                         |
| ---------- | -------------------------------------------------------------- |
| Severity   | `customfield_10709` (`.value`, `2 - High` → `High`)            |
| Root Cause | `customfield_11886` (`.value`, e.g. `Coding Error`)            |
| Developer  | `assignee.displayName` (fallback `Unassigned`)                 |
| Release    | parsed from `fixVersions[].name` (`v<major>.<minor>…`, e.g. `v26.2.2`), else `No Release` |

## Overdue Filter (GET OVER DUE ITEM)

The overdue point dashboard consumes the saved Jira filter **[OO] - GET OVER DUE ITEM**
(id `13525`) and maps overdue records to a developer-centric analytics model.

| Field               | Source |
| ------------------- | ------ |
| Developer           | `assignee.displayName` |
| Parent Issue ID     | `parent.key` |
| Parent Issue Summary| `parent.fields.summary` |
| Release Version     | `fixVersions[0].name` |

## Environment Variables

| Variable                | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `VITE_JIRA_API_BASE`    | Same-origin proxy path (default `/jira`)      |
| `VITE_JIRA_BASE_URL`    | Real Jira Cloud base URL (proxy target)       |
| `VITE_JIRA_PROJECT_KEY` | Default project key (e.g. `OO`)               |
| `VITE_ENABLE_JIRA`      | Feature flag to toggle integration            |
| `JIRA_EMAIL`            | **Server-side only** — Basic auth user        |
| `JIRA_API_TOKEN`        | **Server-side only** — never exposed          |

## Security Rules

- Never expose Jira credentials to the client bundle.
- The browser calls the same-origin `VITE_JIRA_API_BASE` path; the dev proxy /
  BFF injects `Authorization: Basic base64(JIRA_EMAIL:JIRA_API_TOKEN)`.
- `JIRA_EMAIL` / `JIRA_API_TOKEN` are only used server-side (Vite proxy, BFF,
  or MCP server).

## MCP Integration

The same `jiraApi` surface can be backed by the Jira MCP server. Point
`VITE_JIRA_BASE_URL` at the MCP proxy endpoint; no UI changes are required.

## Testing

- `jiraMapper.test.ts` — verifies raw → domain mapping (status categories,
  story points, null assignees) and defect mapping (release parsing, severity
  normalization, root-cause normalization, null handling, collection mapping).
- Query hooks are covered indirectly through feature hook tests using MSW.

## How to test saved filters locally (dev server)

During development the Vite dev server proxies same-origin `/jira/*` requests
to the Jira Cloud instance configured via `VITE_JIRA_BASE_URL` and injects the
`Authorization` header using `JIRA_EMAIL` + `JIRA_API_TOKEN` from the local
environment. Use the following examples to validate saved filters used by the
dashboard.

Replace `5178` with the dev server port if different (check the terminal
output when the dev server starts).

Example: fetch one issue from the `GET ALM DEFECT` saved filter (id `11471`):

```
curl -i "http://localhost:5178/jira/rest/api/3/search/jql?jql=filter%3D11471&maxResults=1"
```

Example: fetch training issues (filter id `12947`):

```
curl -i "http://localhost:5178/jira/rest/api/3/search/jql?jql=filter%3D12947&maxResults=5"
```

If the proxy and credentials are configured correctly you should receive a
`200 OK` JSON response containing an `issues` array. Common responses:

- `200 OK` — success, response body contains issues
- `401/403` — authentication/permission issue (check `JIRA_EMAIL` + `JIRA_API_TOKEN`)
- `410 Gone` — wrong endpoint; the dashboard uses `/rest/api/3/search/jql` with a
   `jql` query parameter (e.g. `filter = 11471`).

If you see network errors like `ERR_CONNECTION_REFUSED` the application may be
trying to call the backend API base (`VITE_API_BASE_URL`) instead of the Jira
proxy path — make sure code calls go through the Jira client or use the
`/jira` prefix in requests.

Saved filter IDs referenced by the Goal Setting feature:

| Goal | Filter ID |
|------|-----------|
| Training | 12947 |
| Defects (Low/High) | 11471 |
| Complexity | 13492 |
| Overdue | 13525 |

