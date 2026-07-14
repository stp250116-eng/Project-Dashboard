export interface ComplexityRecord {
  assignee: string;
  accountId?: string | null;
  complexity: number;
}

export interface ComplexityFilterState {
  assignees: string[];
}

export interface ComplexityFilterOptions {
  assignees: string[];
}

export interface ComplexitySummary {
  rows: ComplexityRecord[];
  options: ComplexityFilterOptions;
  kpis: Array<{
    id: string;
    label: string;
    value: number | string;
    unit?: string;
  }>;
}

export const EMPTY_COMPLEXITY_FILTERS: ComplexityFilterState = {
  assignees: [],
};
