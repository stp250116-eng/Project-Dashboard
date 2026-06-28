# Developer Training Dashboard Feature

## Feature Purpose

Live developer training analytics sourced from Jira filter **[OO] - GET TRAINING INFORMATION** (id `12947`). The dashboard aggregates training hours by developer and helps teams understand training volume, vendor mix, and the most popular learning categories.

## Business Requirements

- Load live training data from Jira filter `12947` on every visit.
- Aggregate training hours by developer using Jira's `fields.aggregatetimespent`.
- Provide multi-select filters for Developer and Vendor Type.
- Refresh KPI cards, pie chart, bar chart, and grid immediately when filters change.
- Support large Jira datasets with pagination and cached requests.

## Data Source & Field Mapping

| Dashboard Field | Jira Field |
| --- | --- |
| Developer | `assignee.displayName` |
| Training Hours | `fields.aggregatetimespent` (seconds) |
| Training Type | `customfield_11546` |
| Training Vendor | `customfield_11547` |

## Filters

- **Developer** — multi-select of developer names.
- **Vendor Type** — multi-select of vendor type values.

## KPI Cards

- **Top Training Participant** — developer with the highest total training hours.
- **Most Popular Training Type** — training category with the highest accumulated hours.
- **Total Training Hours** — aggregated training hours for the selected dataset.

## Charts

- **Training Type Distribution** — pie chart of hours by training type.
- **Training Hours by Developer** — bar chart sorted descending by total hours.

## Grid

- One row per developer.
- Columns: Developer, Total Training Hours.
- Sorted descending by total training hours.

## Performance

- Uses TanStack Query for caching and async loading.
- Avoids duplicate API calls.
- Uses Jira pagination to support large result sets.
- Handles loading, empty, and error states.

## Testing

- Unit tests for the page states and mapping logic.
- Hook/analytics tests should cover aggregation, filtering, and chart payloads.
