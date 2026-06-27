# Enterprise Dashboard Project - Copilot Instructions

## IMPORTANT: Instruction Hierarchy and Documentation Governance
This project uses a hierarchical documentation model.

Before making ANY code changes, Copilot MUST read all applicable instruction files and documentation.

### Global Instructions
Always read first:

```
.github/copilot-instructions.md

docs/architecture.md
docs/coding-standards.md
docs/testing-guidelines.md
docs/jira-integration.md
docs/changelog.md
```

### Feature Instructions
Always read before modifying a feature:

```
src/features/**/README.md
src/integrations/**/README.md
```

### Instruction Precedence
Priority order:

1. Feature README.md
2. Integration README.md
3. Global Copilot Instructions
4. General Coding Standards

If conflicts exist, the closest documentation to the code being modified takes precedence.

Never modify code without first reviewing applicable documentation.

---

# Documentation Synchronization Rule (MANDATORY)
Documentation is part of the source code.

Whenever code changes affect:

- Business rules
- Feature behavior
- User workflow
- API contracts
- Environment variables
- Architecture
- Folder structure
- Database schema
- Configuration
- Authentication
- Authorization
- Jira integrations
- Testing strategy

Copilot MUST update the corresponding documentation during the same task.

Examples:

If a new environment variable is added:

- Update .env.example
- Update README
- Update architecture documentation if required

If a new API endpoint is added:

- Update API documentation
- Update feature README

If a new dashboard widget is added:

- Update feature README
- Update test scenarios

If a feature is removed:

- Remove obsolete documentation

A task is NOT complete until documentation is synchronized.

---

# Mandatory Completion Checklist
Before considering any task complete:

□ Read global instructions

□ Read feature documentation

□ Read integration documentation

□ Update implementation

□ Update Jest tests

□ Update Playwright tests

□ Update documentation

□ Verify TypeScript strict compliance

□ Verify lint compliance

□ Verify no obsolete documentation remains

Never skip this checklist.

---

# Project Goal
Build a modern Enterprise Dashboard application using React and TypeScript.

The application aggregates data from:

- Internal APIs
- Jira Boards
- Jira Projects
- Jira Issues
- Jira Sprints
- Jira Releases
- Future integrations

The application must be:

- Enterprise-grade
- Maintainable
- Testable
- Scalable
- Production-ready

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- KendoReact
- React Hook Form
- Zod
- Zustand
- date-fns

## Testing

- Jest
- React Testing Library
- MSW
- Playwright

## Code Quality

- ESLint
- Prettier
- TypeScript Strict Mode

## Integrations

- Jira REST API
- Jira MCP Server
- GitHub MCP Server
- Filesystem MCP Server
- Playwright MCP Server

---

# Architecture Principles
Follow:

- SOLID
- DRY
- KISS
- Separation of Concerns
- Clean Architecture
- Feature-Based Architecture

Prioritize:

- Readability
- Maintainability
- Reusability
- Testability

Never prioritize clever code over understandable code.

---

# Folder Structure
Create and maintain:

```
.
├── .github
│   └── copilot-instructions.md
│
├── docs
│   ├── architecture.md
│   ├── coding-standards.md
│   ├── testing-guidelines.md
│   ├── jira-integration.md
│   ├── changelog.md
│   └── decisions
│       ├── ADR-001-project-structure.md
│       ├── ADR-002-jira-integration.md
│       └── ADR-003-authentication.md
│
├── mcp
│   ├── jira-mcp-config.json
│   └── README.md
│
├── src
│   ├── app
│   │   ├── layouts
│   │   ├── providers
│   │   ├── router
│   │   └── guards
│   │
│   ├── features
│   │   ├── dashboard
│   │   ├── jira-overview
│   │   ├── sprint-board
│   │   ├── release-dashboard
│   │   ├── defect-dashboard
│   │   ├── team-capacity
│   │   └── reports
│   │
│   ├── integrations
│   │   └── jira
│   │
│   ├── shared
│   │   ├── api
│   │   ├── components
│   │   ├── hooks
│   │   ├── services
│   │   ├── constants
│   │   ├── types
│   │   ├── layouts
│   │   └── utils
│   │
│   └── main.tsx
│
├── playwright
│   ├── dashboard
│   ├── jira
│   ├── sprint
│   ├── reports
│   └── shared
│
└── test
	├── mocks
	├── fixtures
	└── helpers
```

---

# Feature Structure
Every feature must follow:

```
feature-name
│
├── api
├── hooks
├── models
├── components
├── pages
├── services
├── utils
├── tests
└── README.md
```
README.md is mandatory.

---

# README Template
Every feature README must contain:

- Feature Purpose
- Business Requirements
- User Flow
- API Endpoints
- Environment Variables
- Grid Columns
- Filters
- Validation Rules
- Error Handling
- Dependencies
- Jest Test Scenarios
- Playwright Test Scenarios

---

# Environment Variables
Create:

```
.env
.env.local
.env.development
.env.production
.env.example
```
Create .env.example:

```
VITE_APP_NAME=Enterprise Dashboard

VITE_API_BASE_URL=https://localhost:5001/api

VITE_JIRA_BASE_URL=https://your-company.atlassian.net

VITE_JIRA_PROJECT_KEY=DASH

VITE_ENABLE_JIRA=true

VITE_ENABLE_REPORTS=true

JIRA_API_TOKEN=
```
Never hardcode:

- Secrets
- Tokens
- API keys
- URLs

Always use environment variables.

---

# Jira Integration
Create:

```
src/integrations/jira
│
├── jiraApi.ts
├── jiraQueries.ts
├── jiraMapper.ts
├── jiraTypes.ts
├── jiraConstants.ts
└── README.md
```
Rules:

- Support Jira Cloud.
- Support Jira REST API.
- Support MCP integration.
- Use React Query.
- Use strongly typed interfaces.
- Map external responses to internal domain models.
- Never expose Jira credentials.

Flow:

Jira API / MCP
↓
jiraApi.ts
↓
jiraMapper.ts
↓
React Query
↓
UI Component

---

# API Layer
Create:

```
shared/api
│
├── apiClient.ts
├── interceptors.ts
└── apiErrorHandler.ts
```
Rules:

- Axios only
- Strong typing
- Centralized error handling
- Retry support
- Authentication support

Never call APIs directly from React components.

---

# React Query Rules
All server communication must use TanStack Query.

Use:

- queryKey
- staleTime
- cacheTime
- retry

Avoid manual data fetching via useEffect.

---

# State Management
Use:

- React Query for server state
- Zustand for client state

Avoid large Context providers.

---

# Component Standards
Use:

- Functional Components
- Hooks
- Composition

Rules:

- Maximum 300 lines per component
- Single responsibility
- Reusable design

Split large components.

---

# KendoReact Standards
Use KendoReact for:

- Grid
- Chart
- Form
- Dialog
- Layout

Create reusable wrappers:

```
shared/components/grid
shared/components/chart
shared/components/form
```
Avoid duplicated grid configuration.

---

# Error Handling
Every page must support:

- Loading
- Empty State
- Error State
- Success State

Never expose raw exception messages.

---

# Logging
Create:

```
shared/services/logger
```
Never commit:

```
console.log()
console.error()
```
Use LoggerService.

---

# Accessibility
Support:

- Keyboard Navigation
- Screen Readers
- aria-labels
- Semantic HTML

Accessibility is required.

---

# Performance
Use:

- React.memo
- useMemo
- useCallback

only when justified.

Use:

- Lazy loading
- Grid virtualization
- Query caching

for performance optimization.

---

# Unit Testing Standards
Frameworks:

- Jest
- React Testing Library

Coverage Target:

- Minimum 80%

Test:

- Components
- Hooks
- Services
- API Mappers
- Utilities

Every feature must include tests.

---

# API Mocking
Use:

- MSW

Never mock fetch directly.

Use realistic API responses.

---

# Playwright Standards
Test:

- Navigation
- Dashboard Loading
- Jira Integration
- Filtering
- Sorting
- Exporting
- Error Handling
- Authentication

Naming:

```
dashboard.spec.ts
jira-overview.spec.ts
sprint-board.spec.ts
```
Every new feature requires Playwright coverage.

---

# Architecture Decision Records (ADR)
Every significant architecture decision must create or update an ADR document.

Examples:

- New authentication strategy
- New state management strategy
- New integration approach
- New deployment architecture

Store ADRs in:

```
docs/decisions
```

---

# Initial Dashboard Modules
Dashboard

- KPI Cards
- Executive Summary
- Charts
- Recent Activity

Jira Overview

- Open Issues
- Closed Issues
- Assigned Issues
- Status Breakdown

Sprint Board

- Active Sprint
- Sprint Progress
- Burndown Metrics

Release Dashboard

- Release Readiness
- Release Status

Defect Dashboard

- Critical Defects
- Defect Aging
- Defect Trends

Team Capacity

- Velocity
- Workload
- Capacity Planning

Reports

- Excel Export
- PDF Export

---

# Code Generation Rules
Whenever generating code:

- Use TypeScript Strict Mode.
- Avoid any.
- Generate interfaces.
- Generate reusable hooks.
- Generate Jest tests.
- Generate Playwright tests.
- Generate README documentation.
- Generate production-ready code.

Never generate placeholder code if a complete implementation can be created.

Always ensure implementation, tests, and documentation remain synchronized.
