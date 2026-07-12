
# Goal Setting Feature

## Overview

The Goal Setting feature provides a comprehensive dashboard for tracking and managing annual developer goals across five key metrics:

1. **Resource Upskilling** (Training) - Track training hours (target: 40 hrs/year)
2. **Low-Level Defect Rate** - Monitor defects categorized as low severity (threshold: ≤5)
3. **High-Level Defect Rate** - Monitor defects categorized as high/medium severity (threshold: ≤2)
4. **High-Impact Delivery** - Track completed complex initiatives (target: ≥60 points)
5. **Delivery Efficiency** - Monitor overdue items (threshold: ≤3)

Each goal has an associated:
- **Status**: `on-track`, `at-risk`, or `off-track`
- **Sub-score**: 0-100 based on actual vs. target/threshold
- **Weight**: Contribution to overall developer score (sums to 100%)

---

## Business Rules

### Goal Status Logic

**Complexity (High-Impact Delivery)** — bespoke boundaries:
- `on-track`: actual ≥ target × 0.65 (65% of target)
- `at-risk`: actual ≥ target × 0.45 (45% of target)
- `off-track`: actual < target × 0.45 (45% of target)

Note: Complexity uses a product-defined banding to reflect delivery cadence and enable earlier remediation signals for high-impact work.

**Training (hours)** — bespoke boundaries:
- `on-track`: actual ≥ target × 0.75 (75% of target)
- `at-risk`: actual ≥ target × 0.41 (41% of target)
- `off-track`: actual ≤ target × 0.40 (40% of target)

Note: Training uses a looser on-track threshold and a finer at-risk cutoff to provide earlier remediation signals for upskilling progress.

**Must-Not-Exceed Goals** (Defects, Overdue):
- `on-track`: actual ≤ threshold
- `at-risk`: actual > threshold AND ≤ threshold × 1.5
- `off-track`: actual > threshold × 1.5

**Low-Level Defect Rate (bespoke bands)**
- Passing threshold: 8% (developer must not exceed 8% to pass)
- `on-track`: defectRate% ≤ 5%
- `at-risk`: defectRate% > 5% AND ≤ 8%
- `off-track`: defectRate% > 8% (>=9% considered off-track)

These bands are enforced as a special-case for the Low-Level Defect Rate goal to provide clearer remediation guidance.

**Overdue Ratio (Delivery Efficiency)**
- Passing threshold: 10% (developer must not exceed 10% overdue ratio)
- Formula: (Overdue Points / Total Epic Participation) × 100
- Interpretation:
  - Overdue Points: unique parent issues where delivery was delayed (from overdue-point records)
  - Total Epic Participation: unique parent issues the developer participated in (from the same overdue-point dataset)
- Bands:
  - `on-track`: overdueRatio% ≤ 5%
  - `at-risk`: overdueRatio% ≥ 6% AND ≤ 10%
  - `off-track`: overdueRatio% > 10%

Note: The implementation currently computes both values from the overdue-point records (unique parent issue counts per developer). If you want Total Epic Participation sourced from a broader dataset (all backlog participation), we can adjust the query to use a different Jira filter.

**High-Level Defect Rate (bespoke bands)**
- Passing threshold: 5% (developer must not exceed 5% to pass)
- `on-track`: defectRate% < 3%
- `at-risk`: defectRate% ≥ 3% AND ≤ 5%
- `off-track`: defectRate% > 5%

These bands are enforced as a special-case for the High-Level Defect Rate goal to provide tighter control over critical/high severity defects.

### Score Calculation

**Sub-Score** (per goal):
- **Must-Reach**: `(actual / target) × 100`, clamped to [0, 100]
- **Must-Not-Exceed**: 
  - If `actual ≤ threshold`: 100
  - Else: `100 - ((actual - threshold) / threshold) × 100`
  - If overage ≥ 3× threshold: apply 1.5× penalty multiplier
  - Clamped to [0, 100]

**Overall Score** (per developer):
```
score = Σ(sub_score × weight) / Σ(weights)
```

**Ranking**: Developers sorted by overall score (descending) with 1-indexed ranks.

---

## Jira Integration

### Filter Mapping

The feature aggregates data from four real Jira filters:

| Goal | Filter ID | Endpoint | Field Mapping |
|------|-----------|----------|---------------|
| Training | 12947 | `/jira/rest/api/3/filter/12947/issues` | `aggregatetimespent`, `customfield_11546` (type), `customfield_11547` (vendor) |
| Defects (Low) | 11471 | `/jira/rest/api/3/filter/11471/issues` | `customfield_10709` (severity: "4 - Low") |
| Defects (High) | 11471 | `/jira/rest/api/3/filter/11471/issues` | `customfield_10709` (severity: "2 - High" or "3 - Medium") |
| Complexity | 13492 | `/jira/rest/api/3/filter/13492/issues` | `customfield_11530` (complexity points) |
| Overdue | 13525 | `/jira/rest/api/3/filter/13525/issues` | Issue count (by assignee) |

### Data Aggregation

For each developer:
1. Fetch all issues assigned to that developer from each filter
2. Sum/count by goal type
3. Calculate status and score
4. Rank all developers

---

## Jira Filter

- **Filters used:**
  - Training — id `12947` (`filter = 12947`)
  - Defects — id `11471` (`filter = 11471`)
  - Complexity — id `13492` (`filter = 13492`)
  - Overdue — id `13525` (`filter = 13525`)
- **Purpose:** Aggregates data from these saved filters to compute per-developer goal metrics. See each feature README for requested fields and mapping rules.


## Feature Structure

```
src/features/goal-setting/
├── api/
│   ├── goalSettingRequests.ts    # Jira API calls, aggregation
│   └── goalSettingRequests.test.ts
├── models/
│   └── goalModels.ts             # TypeScript interfaces
├── services/
│   ├── goalScoring.ts            # Pure scoring logic
│   ├── goalScoring.test.ts
│   ├── goalDefinitions.ts        # Goal metadata, Jira filters
│   └── (no test for definitions)
├── hooks/
│   ├── useGoalSetting.ts         # React Query wrapper
│   └── useGoalSetting.test.ts
├── components/
│   ├── DeveloperGoalCard.tsx      # Card view (single developer)
│   ├── DeveloperGoalCard.scss
│   ├── GoalSettingToolbar.tsx     # Year, search, sort controls
│   ├── GoalSettingToolbar.scss
│   ├── GoalSettingGrid.tsx        # KendoReact Grid layout
│   ├── GoalSettingGrid.scss
│   └── index.ts
├── pages/
│   ├── GoalSettingPage.tsx        # Main page container
│   ├── GoalSettingPage.scss
│   └── GoalSettingPage.test.tsx
├── tests/
│   └── (integration tests, future)
└── README.md
```

---

## API Layer

### `fetchGoalSettingData(year: number): Promise<DeveloperGoalData[]>`

Main entry point that:
1. Calls all four filter endpoints in parallel
2. Normalizes Jira responses to per-developer metrics
3. Calculates goal status and scores for each developer
4. Returns sorted developers (by score descending) with ranks

**Error Handling**: Catches all errors and logs to console; returns empty array on failure.

---

## React Query Integration

### `useGoalSetting(year?: number)`

Hook configuration:
- **Query Key**: `['goal-setting', year]`
- **Stale Time**: 60 seconds (1 minute cache)
- **Retry**: 1 retry on failure
- **Enabled**: Only when year is provided

**Usage**:
```typescript
const { data, isLoading, error } = useGoalSetting(2026);
```

---

## UI Components

### GoalSettingPage
Main page container. Features:
- Year selector (dropdown)
- Developer search (by name or role)
- Sort toggles (by score, name, rank) — default: `rank` (see Ranking behavior below)
- Conditional rendering (loading, error, empty, results)
- Developer grid display

### GoalSettingToolbar
Controls for filtering and sorting:
- Year selector (Kendo DropDownList)
- Search input (text field)
- Sort buttons (Overall Score, Name, Rank)

### GoalSettingGrid
KendoReact Grid with:
- Columns: Rank, Developer, Team, Role, Overall Score, Goals
- Rank column and Overall Score are sortable; `Team` column is not sortable (Team sort removed)
- Paginated (10 per page)
- Status chips for each goal
- Row click handler (future: detail page or modal)

### Role Overrides & Ranking Behavior
- **Role Overrides**: Certain developer display names are mapped to high-level roles for UI and product clarity. Examples configured in code include:
  - `Sittichart Phikunthong` → `Product Delivery Manager`
  - `Puchong Kaewchote` → `L3 Sidecar/Support`
  - `sukanya phikultong` → `L3 Sidecar/Support`
  - `Chalotorn.Tangkhajornkit`, `Pongpon.Supatpitak`, `Suknarin Chaikheaw` → `Senior Developer`
  - `Aattawut.Nutlamyong`, `Yotin Sara`, `Wasapon`, `Apisit Prompha` → `Junior Developer`

- **Ranking Behavior**:
  - Only developers with roles `Senior Developer` or `Junior Developer` are included in the numeric ranking calculation.
  - High-level roles (managers, support, etc.) are shown in the UI but **excluded** from rank calculation and assigned `rank: 0`.
  - Default sort is `Rank`: developers ranked `1`–`7` appear first (ascending), followed by other ranked developers (`8+`), and finally unranked developers (displayed with `—` instead of a rank number).
  - This behavior ensures leadership and sidecar/support personas remain visible but do not affect developer ranking math.

### DeveloperGoalCard
Reusable card component displaying:
- Developer name, role, team
- Rank badge (gold/silver/bronze for top 3)
- Overall score progress bar
- Goal status grid (2-column layout)

---

## Styling

### Design Tokens (CSS Variables)

```css
--color-success: #36b37e         /* On-track status */
--color-warning: #ffa500         /* At-risk status (TODO: add to global.css) */
--color-danger: #de350b          /* Off-track status */
--color-info: #0052cc            /* Primary actions, selected state */
--color-text-primary: #172b4d    /* Main text */
--color-text-secondary: #626f86  /* Secondary text */
--color-neutral-50: #fafbfc      /* Very light backgrounds */
--color-neutral-100: #f7f8f9     /* Light backgrounds */
--color-neutral-200: #f1f2f4     /* Borders, dividers */
--color-neutral-300: #dfe1e6     /* Secondary borders */
--color-neutral-400: #a5adba     /* Neutral text/badges */
```

### Status Colors

| Status | Background | Text | Chip |
|--------|------------|------|------|
| on-track | rgba(54, 179, 126, 0.05) | #36b37e | Green (#36b37e) |
| at-risk | rgba(255, 165, 0, 0.05) | #ffa500 | Orange (#ffa500) |
| off-track | rgba(222, 53, 11, 0.05) | #de350b | Red (#de350b) |

### Rank Badge Colors

| Rank | Style | Gradient |
|------|-------|----------|
| 1st | Gold | #ffd700 → #ffed4e |
| 2nd | Silver | #c0c0c0 → #e8e8e8 |
| 3rd | Bronze | #cd7f32 → #e8a55a |
| Other | Gray | #a5adba |

---

## Testing Strategy

### Unit Tests

**Phase 1 - Scoring Logic** (`goalScoring.test.ts`):
- 22 tests covering all goal types, status boundaries, edge cases
- 100% test pass rate

**Phase 3 - API Layer** (`goalSettingRequests.test.ts`):
- 14 tests covering each data source function and main aggregator
- Mock Jira API responses
- Error handling scenarios

**Phase 4 - React Query Hook** (`useGoalSetting.test.ts`):
- 3 tests covering successful fetch, year changes, default year
- Mock hook with QueryClientProvider wrapper

**Phase 6 - Page Component** (`GoalSettingPage.test.tsx`):
- 5 tests covering page header, toolbar, loading/error states, filtering
- Note: Requires Jest configuration for KendoReact components

### Integration Tests

Future: Add Playwright E2E tests for:
- Full user flow: year selection → search → view rankings
- Sorting and filtering
- Responsive design (mobile, tablet, desktop)

---

## Environment Variables

None required. Feature uses:
- Jira Cloud API (via same-origin `/jira/*` proxy)
- Jira filter IDs (hardcoded in `jiraConstants.ts`)

---

## Performance Considerations

1. **Query Caching**: 60-second stale time reduces API calls
2. **Parallel Fetching**: All four data sources queried simultaneously
3. **Grid Pagination**: 10 developers per page (adjustable)
4. **Search Filtering**: Client-side (after initial load)
5. **Memoization**: `filteredDevelopers` memoized to prevent re-renders

---

## Known Limitations & TODOs

1. **TODO**: Add `--color-warning` token to global.css (currently uses #ffa500)
2. **TODO**: Implement developer detail modal/page
3. **TODO**: Add Playwright E2E tests
4. **TODO**: Implement data export (CSV/Excel)
5. **TODO**: Add goal trend charts (compare years)
6. **TODO**: Fetch actual developer names from Jira user API (currently uses accountId)

---

## Dependencies

- **React 19** - UI framework
- **React Router v6** - Routing (lazy-loaded page)
- **TanStack Query** - Server state management
- **KendoReact** - Grid, DropdownList, ProgressBar, Chips, Cards
- **Axios** - HTTP client
- **date-fns** - Date utilities (future)
- **Jest** - Unit testing
- **React Testing Library** - Component testing

---

## Related ADRs

- [ADR-002: Jira Integration](../decisions/ADR-002-jira-integration.md)
- [ADR-003: Authentication](../decisions/ADR-003-authentication.md)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Goal** | Annual metric (training, defects, complexity, overdue) tracked per developer |
| **Status** | One of `on-track`, `at-risk`, `off-track` based on actual vs. target |
| **Sub-Score** | 0-100 score for individual goal (before weighting) |
| **Overall Score** | Weighted average of all goal sub-scores for a developer |
| **Rank** | 1-indexed position after sorting by overall score |
| **Must-Reach** | Goal type requiring achievement of target (training, complexity) |
| **Must-Not-Exceed** | Goal type requiring staying under threshold (defects, overdue) |

---

## Change Log

### v1.0.0 (Initial Release)
- Implemented Goal Setting dashboard with 5 goals
- Integrated with Jira Cloud API (4 filters)
- Created React components (toolbar, grid, card)
- Added unit tests (scoring, API, hook, page)
- Responsive design for mobile/tablet/desktop
