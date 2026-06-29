import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';
import type {
  DeveloperTrainingFilterOptions,
  DeveloperTrainingFilterState,
  DeveloperTrainingRecord,
  DeveloperTrainingSummary,
  DeveloperTrainingRow,
} from '../models/developerTrainingModels';

const distinctSorted = (values: readonly string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

const toHours = (seconds: number): number => Number((seconds / 3600).toFixed(2));

export const formatTrainingHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 60) {
    return `${wholeHours + 1}h`;
  }

  return minutes === 0 ? `${wholeHours}h` : `${wholeHours}h ${minutes}m`;
};

export const formatTrainingDuration = (seconds: number): string => formatTrainingHours(seconds / 3600);

export const collectFilterOptions = (
  records: readonly DeveloperTrainingRecord[],
): DeveloperTrainingFilterOptions => ({
  developers: distinctSorted(records.map((record) => record.developer)),
  vendorTypes: distinctSorted(records.map((record) => record.vendorType)),
});

export const filterTrainingRecords = (
  records: readonly DeveloperTrainingRecord[],
  filters: DeveloperTrainingFilterState,
): DeveloperTrainingRecord[] =>
  records.filter((record) => {
    const matchesDeveloper =
      filters.developers.length === 0 || filters.developers.includes(record.developer);
    const matchesVendor =
      filters.vendorTypes.length === 0 || filters.vendorTypes.includes(record.vendorType);
    return matchesDeveloper && matchesVendor;
  });

const aggregateByDeveloper = (
  records: readonly DeveloperTrainingRecord[],
): Map<string, number> => {
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(record.developer, (totals.get(record.developer) ?? 0) + record.aggregatedTimeSeconds);
  }
  return totals;
};

const aggregateByTrainingType = (
  records: readonly DeveloperTrainingRecord[],
): Map<string, number> => {
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(record.trainingType, (totals.get(record.trainingType) ?? 0) + record.aggregatedTimeSeconds);
  }
  return totals;
};

const toChartPoints = (totals: Map<string, number>): ChartSeriesPoint[] =>
  Array.from(totals.entries())
    .map(([category, value]) => ({ category, value: toHours(value) }))
    .sort((a, b) => b.value - a.value);

const buildRows = (totals: Map<string, number>): DeveloperTrainingRow[] =>
  Array.from(totals.entries())
    .map(([developer, seconds]) => ({ developer, totalTrainingHours: toHours(seconds) }))
    .sort((a, b) => b.totalTrainingHours - a.totalTrainingHours || a.developer.localeCompare(b.developer));

const topMetric = (
  totals: Map<string, number>,
  label: string,
): KpiMetric => {
  let winner = '—';
  let topSeconds = 0;
  for (const [category, seconds] of totals.entries()) {
    if (seconds > topSeconds) {
      winner = category;
      topSeconds = seconds;
    }
  }

  return {
    id: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    value: winner,
    unit: winner === '—' ? undefined : formatTrainingDuration(topSeconds),
  };
};

export const buildDeveloperTrainingSummary = (
  allRecords: readonly DeveloperTrainingRecord[],
  filters: DeveloperTrainingFilterState,
): DeveloperTrainingSummary => {
  const options = collectFilterOptions(allRecords);
  const filtered = filterTrainingRecords(allRecords, filters);
  const developerTotals = aggregateByDeveloper(filtered);
  const trainingTypeTotals = aggregateByTrainingType(filtered);

  return {
    rows: buildRows(developerTotals),
    options,
    kpis: [
      topMetric(trainingTypeTotals, 'Most Popular Training Type'),
      topMetric(developerTotals, 'Top Training Participant'),
      {
        id: 'total-team-hours',
        label: 'Total Training Hours',
        value:
          filtered.length === 0
            ? '0h'
            : formatTrainingDuration(
                Array.from(developerTotals.values()).reduce((sum, secs) => sum + secs, 0),
              ),
      },
    ],
    trainingTypeDistribution: toChartPoints(trainingTypeTotals),
    hoursByDeveloper: toChartPoints(developerTotals),
  };
};
