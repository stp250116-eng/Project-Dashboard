# Jira Filters Index

This index lists the Jira saved filters / JQL used by each feature. Keep
this file and each feature `README.md` in sync: when a feature adds or
changes a Jira filter, update the feature README's `## Jira Filter` section
and add or adjust the line below.

Notes:
- The repo uses a server-side proxy (or MCP/BFF) under `/jira` to avoid
  exposing `JIRA_API_TOKEN` in the client. See `docs/jira-integration.md`.
- Sample fixtures referenced below live in `test/fixtures/`.

## Features & filters

- Defect Dashboard — GET ALM DEFECT (id `11471`). See `src/features/defect-dashboard/README.md`
- Developer Training Dashboard — [OO] - GET TRAINING INFORMATION (id `12947`). See `src/features/developer-training-dashboard/README.md`
- Goal Setting — aggregates multiple filters (Training `12947`, Defects `11471`, Complexity `13492`, Overdue `13525`). See `src/features/goal-setting/README.md`
 - Goal Setting — aggregates multiple filters (Training `12947`, Defects `11471`, Complexity `13492`, Overdue `13525`). See `src/features/goal-setting/README.md`
- Overdue Point Dashboard — [OO] - GET OVER DUE ITEM (id `13525`). See `src/features/overdue-point-dashboard/README.md`
- Complexity Point — GET COMPLEXITY BY YEAR (saved filter id referenced in feature). See `src/features/complexity-point/README.md`
 - Complexity Point — GET COMPLEXITY BY YEAR (id `13492`). See `src/features/complexity-point/README.md`
 - Participation Index — GET ALL DEVELOPER PARTICIPATE ISSUE SPECIFIC YEAR (id `13725`) referenced by participation/aggregation queries. See `src/features/team-goal/README.md`
- Dashboard — executive summary (aggregates KPIs from other features). See `src/features/dashboard/README.md`

## How to update

1. Edit `src/features/<feature>/README.md` and add or update the `## Jira Filter` section with the saved-filter name/ID, JQL, requested fields, mapping rules, formulas, fixture location, and owner/cadence.
2. Add or validate the feature line in this file pointing to the feature README.

This file is intentionally small and acts as a quick index for reviewers and
contributors. For full details, open the linked feature README.
