
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

**Must-Reach Goals** (Training, Complexity):
- `on-track`: actual ≥ target × 0.9 (90% of target)
- `at-risk`: actual ≥ target × 0.7 (70% of target)
- `off-track`: actual < target × 0.7

**Must-Not-Exceed Goals** (Defects, Overdue):
- `on-track`: actual ≤ threshold
- `at-risk`: actual > threshold AND ≤ threshold × 1.5
- `off-track`: actual > threshold × 1.5

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
- Developer search (by name, team, role)
- Sort toggles (by score, name, team)
- Conditional rendering (loading, error, empty, results)
- Developer grid display

### GoalSettingToolbar
Controls for filtering and sorting:
- Year selector (Kendo DropDownList)
- Search input (text field)
- Sort buttons (Overall Score, Name, Team)

### GoalSettingGrid
KendoReact Grid with:
- Columns: Rank, Developer, Team, Role, Overall Score, Goals
- Sortable headers
- Paginated (10 per page)
- Status chips for each goal
- Row click handler (future: detail page or modal)

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
