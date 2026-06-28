import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';
import type {
  OverduePointChildIssueRow,
  OverduePointDeveloperRow,
  OverduePointFilterOptions,
  OverduePointFilterState,
  OverduePointRecord,
  OverduePointSummary,
  OverduePointAnalytics,
} from '../models/overduePointModels';

const distinctSorted = (values: readonly string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const collectFilterOptions = (records: readonly OverduePointRecord[]): OverduePointFilterOptions => ({
  developers: distinctSorted(records.map((record) => record.developer)),
  releaseVersions: distinctSorted(records.map((record) => record.releaseVersion)),
});

const matchesFilters = (
  record: OverduePointRecord,
  filters: OverduePointFilterState,
): boolean => {
  const developerMatches =
    filters.developers.length === 0 || filters.developers.includes(record.developer);
  const releaseMatches =
    filters.releaseVersions.length === 0 || filters.releaseVersions.includes(record.releaseVersion);
  return developerMatches && releaseMatches;
};

const buildDeveloperGroups = (
  records: readonly OverduePointRecord[],
): Map<string, OverduePointDeveloperRow> => {
  const groups = new Map<string, OverduePointDeveloperRow>();

  for (const record of records) {
    const child: OverduePointChildIssueRow = {
      parentIssueId: record.parentIssueId,
      parentIssueSummary: record.parentIssueSummary,
      releaseVersion: record.releaseVersion,
    };

    const developerRow = groups.get(record.developer);
    if (!developerRow) {
      groups.set(record.developer, {
        developer: record.developer,
        overduePoints: 1,
        childIssues: [child],
      });
      continue;
    }

    const existingIssue = developerRow.childIssues.find(
      (issue) => issue.parentIssueId === child.parentIssueId,
    );
    if (!existingIssue) {
      developerRow.overduePoints += 1;
      developerRow.childIssues.push(child);
    }
  }

  return groups;
};

const toChartSeries = (totals: Map<string, number>): ChartSeriesPoint[] =>
  Array.from(totals.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value || a.category.localeCompare(b.category));

const buildRows = (groups: Map<string, OverduePointDeveloperRow>): OverduePointDeveloperRow[] =>
  Array.from(groups.values()).sort(
    (a, b) => b.overduePoints - a.overduePoints || a.developer.localeCompare(b.developer),
  );

const topMetric = (
  label: string,
  category: string,
  unit?: string,
): KpiMetric => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  value: category,
  unit,
});

const highestMetric = (records: readonly OverduePointRecord[]): KpiMetric => {
  const releaseCounts = new Map<string, Set<string>>();
  for (const record of records) {
    const set = releaseCounts.get(record.releaseVersion) ?? new Set<string>();
    set.add(record.parentIssueId);
    releaseCounts.set(record.releaseVersion, set);
  }

  let winner = '—';
  let winnerCount = 0;
  for (const [version, issueSet] of releaseCounts.entries()) {
    if (issueSet.size > winnerCount) {
      winnerCount = issueSet.size;
      winner = version;
    }
  }

  return {
    id: 'most-delayed-release',
    label: 'Most Delayed Release',
    value: winner,
    unit: winner === '—' ? undefined : `${winnerCount} issues`,
  };
};

const collaborationRiskMetric = (records: readonly OverduePointRecord[]): KpiMetric => {
  const issueDevelopers = new Map<string, Set<string>>();
  for (const record of records) {
    const developers = issueDevelopers.get(record.parentIssueId) ?? new Set<string>();
    developers.add(record.developer);
    issueDevelopers.set(record.parentIssueId, developers);
  }

  let riskIssue = '—';
  let participantCount = 0;
  for (const [issueId, developers] of issueDevelopers.entries()) {
    if (developers.size > participantCount) {
      participantCount = developers.size;
      riskIssue = issueId;
    }
  }

  return {
    id: 'highest-collaboration-risk',
    label: 'Highest Collaboration Risk',
    value: riskIssue,
    unit: riskIssue === '—' ? undefined : `${participantCount} developers`,
  };
};

const totalDelayedIssues = (records: readonly OverduePointRecord[]): number =>
  new Set(records.map((record) => record.parentIssueId)).size;

export const buildOverduePointSummary = (
  allRecords: readonly OverduePointRecord[],
  filters: OverduePointFilterState,
): OverduePointSummary => {
  const options = collectFilterOptions(allRecords);
  const filtered = allRecords.filter((record) => matchesFilters(record, filters));
  const developerGroups = buildDeveloperGroups(filtered);

  const rows = buildRows(developerGroups);
  const overdueCounts = new Map<string, number>();
  const releaseIssueSets = new Map<string, Set<string>>();

  for (const row of rows) {
    overdueCounts.set(row.developer, row.overduePoints);
    for (const child of row.childIssues) {
      const set = releaseIssueSets.get(child.releaseVersion) ?? new Set<string>();
      set.add(child.parentIssueId);
      releaseIssueSets.set(child.releaseVersion, set);
    }
  }

  const releaseCounts = new Map<string, number>();
  for (const [release, issueIds] of releaseIssueSets.entries()) {
    releaseCounts.set(release, issueIds.size);
  }

  const topDeveloper = rows[0];
  const topRelease = Array.from(releaseCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    rows,
    options,
    kpis: [
      {
        id: 'total-delayed-parent-issues',
        label: 'Delayed Issues',
        value: totalDelayedIssues(filtered),
      },
      {
        id: 'most-overdue-developer',
        label: 'Most Overdue Developer',
        value: topDeveloper?.developer ?? '—',
        unit: topDeveloper ? `${topDeveloper.overduePoints} points` : undefined,
      },
      {
        id: 'most-impacted-release',
        label: 'Most Impacted Release',
        value: topRelease?.[0] ?? '—',
        unit: topRelease ? `${topRelease[1]} issues` : undefined,
      },
    ],
    byDeveloper: toChartSeries(overdueCounts),
    byRelease: toChartSeries(releaseCounts),
  };
};

export const buildOverduePointAnalytics = (
  allRecords: readonly OverduePointRecord[],
  filters: OverduePointFilterState,
): OverduePointAnalytics => {
  const filtered = allRecords.filter((record) => matchesFilters(record, filters));
  const groups = buildDeveloperGroups(filtered);
  const developerTotals = new Map<string, number>();

  for (const [developer, row] of groups.entries()) {
    developerTotals.set(developer, row.overduePoints);
  }

  const topDeveloperEntry = Array.from(developerTotals.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    kpis: [],
    topDeveloper: topMetric(
      'Highest Overdue Point',
      topDeveloperEntry?.[0] ?? '—',
      topDeveloperEntry ? `${topDeveloperEntry[1]} points` : undefined,
    ),
    topRelease: highestMetric(filtered),
    highestCollaborationRisk: collaborationRiskMetric(filtered),
  };
};
