# ADR-003: Authentication

- **Status:** Proposed
- **Date:** 2026-06-13

## Context

The dashboard calls internal APIs and Jira. Tokens (especially the Jira token)
must never be exposed in the client bundle, and requests need consistent auth
and traceability.

## Decision

- The client authenticates the **user** and obtains a short-lived bearer token
  (e.g. via OIDC/MSAL). The token is held in `sessionStorage` and read by the
  shared Axios request interceptor.
- The interceptor attaches `Authorization: Bearer <token>` and an
  `X-Correlation-Id` to every outbound request.
- Jira access is brokered by a **server-side proxy/BFF or MCP server** that holds
  `JIRA_API_TOKEN`. The browser never holds the Jira token.
- `apiErrorHandler` maps `401` to a re-authentication flow.

## Consequences

- Secrets stay server-side; the client only carries a user bearer token.
- Centralized interceptor keeps auth/correlation consistent and testable.
- Requires an identity provider and a proxy/MCP layer to be provisioned.
- The concrete IdP wiring is intentionally deferred (status: Proposed).
