# MCP Server Configuration

This directory holds Model Context Protocol (MCP) server configuration used by
the Enterprise Dashboard tooling.

## Servers

| Server     | Purpose                                        |
| ---------- | ---------------------------------------------- |
| jira       | Jira Cloud access (boards, issues, sprints)    |
| github     | Repository, PR, and issue access               |
| filesystem | Local workspace file access                    |
| playwright | Browser automation for E2E flows               |

## Configuration

See [jira-mcp-config.json](jira-mcp-config.json). Secrets are injected from
environment variables and are **never** committed:

- `VITE_JIRA_BASE_URL`
- `JIRA_API_TOKEN`
- `GITHUB_TOKEN`

## Security

- Tokens are read from the environment at runtime only.
- Never hardcode credentials in this file or the JSON config.
- The Jira token is server-side only and must not reach the client bundle.
