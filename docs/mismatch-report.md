# Mismatch Report — Docs vs Code

Date: 2026-07-15

Summary: this file lists documentation statements that do not match the current codebase, their impact, current status, and recommended remediation.

- Missing .env.example referenced in docs
  - Impact: Developer onboarding/docs reference a file that didn't exist.
  - Status: Created `./.env.example` with canonical defaults.
  - Action: None (already resolved).

- `console.*` usage in code (coding standard violation)
  - Impact: Project forbids direct `console.log/error` outside `LoggerService`.
  - Status: Fixed (`src/features/goal-setting/api/goalSettingRequests.ts` now uses `LoggerService.error`).
  - Action: None (resolved).

- `any` / typing gaps in `goalSettingRequests.ts`
  - Impact: ESLint and TS strict rules flagged `any` usages.
  - Status: Replaced `any` with typed `axios.get` responses and guards.
  - Action: None (resolved).

- Dynamic `require()` in Jest setup
  - Impact: ESLint rule `no-require-imports` and maintainability.
  - Status: Rewrote `test/helpers/setupTests.ts` to use static import and lifecycle registration.
  - Action: None (resolved).

- MSW dependency not installed in some environments
  - Impact: Tests failed when `msw` can't be resolved.
  - Status: Added fallback shim in `test/mocks/server.ts` to a no-op server when `msw` is unavailable.
  - Action: Recommend keeping `msw` as devDependency and documenting `npm ci` in README; fallback should remain short-term.

- Doc: references to `LoggerService` usage and `shared/api` interceptors
  - Impact: Docs assert implementation exists; code contains these modules but ensure docs map to exact file paths.
  - Status: Verified presence of `src/shared/services/logger/LoggerService.ts` and `src/shared/api/apiClient.ts`.
  - Action: None immediate; propose small doc edits to point to exact module paths if desired.

 Recommended next steps (completed)
 
 1. Review and approve the mismatch report contents. (complete — user approved edits)
 2. Applied doc edits: `README.md`, `docs/jira-integration.md`, and `docs/changelog.md`. (complete)
 3. Add a short note to `README.md` recommending `npm ci` and `node >= 18.18.0` for contributors. (complete)
 4. When you're ready, I can open a branch and create a PR containing these changes. (pending)
 
 If you want me to open a branch and prepare a PR with these edits, say "open PR" and I'll commit the changes and push a branch; otherwise I can continue reviewing additional documents.
