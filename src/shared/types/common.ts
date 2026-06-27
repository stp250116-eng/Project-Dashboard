/** Shared domain-agnostic types used across features. */

export type LoadState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  delta?: number;
  trend?: 'up' | 'down' | 'flat';
  unit?: string;
}

export interface ChartSeriesPoint {
  category: string;
  value: number;
}

export interface SelectOption {
  text: string;
  value: string;
}
