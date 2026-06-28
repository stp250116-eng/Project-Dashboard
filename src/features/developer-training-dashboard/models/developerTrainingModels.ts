import type { ChartSeriesPoint, KpiMetric } from '@shared/types/common';

export interface DeveloperTrainingRecord {
  developer: string;
  trainingType: string;
  vendorType: string;
  aggregatedTimeSeconds: number;
}

export interface DeveloperTrainingFilterState {
  developers: string[];
  vendorTypes: string[];
}

export interface DeveloperTrainingFilterOptions {
  developers: string[];
  vendorTypes: string[];
}

export interface DeveloperTrainingRow {
  developer: string;
  totalTrainingHours: number;
}

export interface DeveloperTrainingSummary {
  rows: DeveloperTrainingRow[];
  options: DeveloperTrainingFilterOptions;
  kpis: KpiMetric[];
  trainingTypeDistribution: ChartSeriesPoint[];
  hoursByDeveloper: ChartSeriesPoint[];
}

export const EMPTY_DEVELOPER_TRAINING_FILTERS: DeveloperTrainingFilterState = {
  developers: [],
  vendorTypes: [],
};
