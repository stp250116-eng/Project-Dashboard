import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';

export interface OverduePointRecord {
  developer: string;
  parentIssueId: string;
  parentIssueSummary: string;
  releaseVersion: string;
}

export interface OverduePointFilterState {
  developers: string[];
  releaseVersions: string[];
}

export interface OverduePointFilterOptions {
  developers: string[];
  releaseVersions: string[];
}

export interface OverduePointDeveloperRow {
  developer: string;
  overduePoints: number;
  childIssues: OverduePointChildIssueRow[];
}

export interface OverduePointChildIssueRow {
  parentIssueId: string;
  parentIssueSummary: string;
  releaseVersion: string;
}

export interface OverduePointAnalytics {
  kpis: KpiMetric[];
  topDeveloper: KpiMetric;
  topRelease: KpiMetric;
  highestCollaborationRisk: KpiMetric;
}

export interface OverduePointSummary {
  rows: OverduePointDeveloperRow[];
  options: OverduePointFilterOptions;
  kpis: KpiMetric[];
  byDeveloper: ChartSeriesPoint[];
  byRelease: ChartSeriesPoint[];
}

export const EMPTY_OVERDUE_POINT_FILTERS: OverduePointFilterState = {
  developers: [],
  releaseVersions: [],
};
