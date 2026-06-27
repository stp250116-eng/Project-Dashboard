import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';
import type { JiraDefect } from '@integrations/jira';

/** Re-exported so feature consumers depend on the feature, not the integration. */
export type DefectRecord = JiraDefect;

/** User-selected multi-select filter state. Empty array = "no filter applied". */
export interface DefectFilterState {
  releases: string[];
  owners: string[];
  severities: string[];
  rootCauses: string[];
}

export const EMPTY_DEFECT_FILTERS: DefectFilterState = {
  releases: [],
  owners: [],
  severities: [],
  rootCauses: [],
};

/** Distinct values available for each filter, derived from the full dataset. */
export interface DefectFilterOptions {
  releases: string[];
  owners: string[];
  severities: string[];
  rootCauses: string[];
}

/** A single named line in the multi-series trend chart, aligned to `releases`. */
export interface DefectTrendSeries {
  name: string;
  data: number[];
}

/** Release trend payload: a shared `releases` axis and one or more series. */
export interface DefectTrend {
  releases: string[];
  series: DefectTrendSeries[];
}

/** Fully computed analytics consumed by the dashboard UI. */
export interface DefectAnalytics {
  total: number;
  kpis: KpiMetric[];
  bySeverity: ChartSeriesPoint[];
  rootCauseDistribution: ChartSeriesPoint[];
  topOwners: ChartSeriesPoint[];
  distribution: ChartSeriesPoint[];
  trend: DefectTrend;
  options: DefectFilterOptions;
}
