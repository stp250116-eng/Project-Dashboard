import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';
import type {
  DefectAnalytics,
  DefectFilterOptions,
  DefectFilterState,
  DefectRecord,
  DefectTrend,
} from '../models/defectModels';

/** How many bars to show in the "top N" horizontal charts. */
const TOP_N = 8;
/** How many series to plot in the trend chart when no explicit selection. */
const MAX_TREND_SERIES = 5;

/** Canonical severity ordering for axes/legends (unknown sinks to the end). */
const SEVERITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const severityRank = (severity: string): number =>
  severity in SEVERITY_ORDER ? SEVERITY_ORDER[severity] : 99;

/** Counts occurrences of `key(record)` across the dataset. */
const countBy = (
  records: readonly DefectRecord[],
  key: (record: DefectRecord) => string,
): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const record of records) {
    const value = key(record);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const distinctSorted = <T>(values: readonly T[], compare?: (a: T, b: T) => number): T[] =>
  Array.from(new Set(values)).sort(compare);

/** Compares release labels numerically so "v26.2.10" sorts after "v26.2.2". */
const compareReleases = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true });

/** Builds the distinct filter option lists from the unfiltered dataset. */
export const collectFilterOptions = (
  defects: readonly DefectRecord[],
): DefectFilterOptions => ({
  releases: distinctSorted(
    defects.map((defect) => defect.release),
    (a, b) => compareReleases(b, a),
  ),
  owners: distinctSorted(
    defects.map((defect) => defect.owner),
    (a, b) => a.localeCompare(b),
  ),
  severities: distinctSorted(
    defects.map((defect) => defect.severity),
    (a, b) => severityRank(a) - severityRank(b),
  ),
  rootCauses: distinctSorted(
    defects.map((defect) => defect.rootCause),
    (a, b) => a.localeCompare(b),
  ),
});

/**
 * Applies the multi-select filters. An empty selection for a dimension means
 * "include all" for that dimension (AND across dimensions, OR within one).
 */
export const filterDefects = (
  defects: readonly DefectRecord[],
  filters: DefectFilterState,
): DefectRecord[] =>
  defects.filter((defect) => {
    const matchesRelease =
      filters.releases.length === 0 || filters.releases.includes(defect.release);
    const matchesOwner = filters.owners.length === 0 || filters.owners.includes(defect.owner);
    const matchesSeverity =
      filters.severities.length === 0 || filters.severities.includes(defect.severity);
    const matchesRootCause =
      filters.rootCauses.length === 0 || filters.rootCauses.includes(defect.rootCause);
    return matchesRelease && matchesOwner && matchesSeverity && matchesRootCause;
  });

/** Converts a count map to chart points sorted by descending value, top N only. */
const toTopPoints = (counts: Map<string, number>, limit = TOP_N): ChartSeriesPoint[] =>
  Array.from(counts.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

const mostFrequentSeverity = (counts: Map<string, number>): string => {
  let best = '—';
  let bestCount = -1;
  for (const [severity, count] of counts.entries()) {
    if (count > bestCount) {
      best = severity;
      bestCount = count;
    }
  }
  return best;
};

/** Finds the developer with the most defects (insertion order breaks ties). */
const topDefectDeveloper = (
  counts: Map<string, number>,
): { name: string; count: number } => {
  let name = '—';
  let count = 0;
  for (const [owner, ownerCount] of counts.entries()) {
    if (ownerCount > count) {
      name = owner;
      count = ownerCount;
    }
  }
  return { name, count };
};

const buildKpis = (defects: readonly DefectRecord[]): KpiMetric[] => {
  const owners = new Set(defects.map((defect) => defect.owner));
  const severityCounts = countBy(defects, (defect) => defect.severity);
  const ownerCounts = countBy(defects, (defect) => defect.owner);
  const topDeveloper = topDefectDeveloper(ownerCounts);

  return [
    { id: 'total', label: 'Total Defects', value: defects.length },
    { id: 'developers', label: 'Total Developers', value: owners.size },
    {
      id: 'top-severity',
      label: 'Most Frequent Severity',
      value: defects.length === 0 ? '—' : mostFrequentSeverity(severityCounts),
    },
    {
      id: 'top-developer',
      label: 'Top Defect Developer',
      value: defects.length === 0 ? '—' : topDeveloper.name,
      unit: defects.length === 0 ? undefined : `${topDeveloper.count} defects`,
    },
  ];
};

const buildSeverityChart = (defects: readonly DefectRecord[]): ChartSeriesPoint[] =>
  Array.from(countBy(defects, (defect) => defect.severity).entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => severityRank(a.category) - severityRank(b.category));

/**
 * Builds the release trend. Each series corresponds to a developer. When the
 * user has selected specific developers, those drive the series; otherwise the
 * top contributors are shown.
 */
const buildTrend = (
  defects: readonly DefectRecord[],
  filters: DefectFilterState,
): DefectTrend => {
  const releases = distinctSorted(
    defects.map((defect) => defect.release),
    compareReleases,
  );
  if (releases.length === 0) return { releases: [], series: [] };

  const accessor = (record: DefectRecord): string => record.owner;
  const selected = filters.owners;
  const seriesNames =
    selected.length > 0
      ? selected
      : toTopPoints(countBy(defects, accessor), MAX_TREND_SERIES).map((point) => point.category);

  const series = seriesNames.map((name) => {
    const data = releases.map(
      (release) =>
        defects.filter((defect) => defect.release === release && accessor(defect) === name)
          .length,
    );
    return { name, data };
  });

  return { releases, series };
};

/**
 * Pure entry point: turns the raw defect dataset plus UI state into everything
 * the dashboard renders. Kept side-effect free so it is trivially testable and
 * can be memoized in the hook for instant, no-reload filter refreshes.
 */
export const buildDefectAnalytics = (
  allDefects: readonly DefectRecord[],
  filters: DefectFilterState,
): DefectAnalytics => {
  const options = collectFilterOptions(allDefects);
  const filtered = filterDefects(allDefects, filters);
  const ownerCounts = countBy(filtered, (defect) => defect.owner);
  const rootCauseCounts = countBy(filtered, (defect) => defect.rootCause);

  return {
    total: filtered.length,
    kpis: buildKpis(filtered),
    bySeverity: buildSeverityChart(filtered),
    rootCauseDistribution: toTopPoints(rootCauseCounts),
    topOwners: toTopPoints(ownerCounts),
    distribution: toTopPoints(ownerCounts),
    trend: buildTrend(filtered, filters),
    options,
  };
};
