import type { KpiMetric, ChartSeriesPoint } from '@shared/types/common';

export interface RecentActivityItem {
  id: string;
  title: string;
  actor: string;
  timestamp: string;
}

export interface DashboardSummary {
  kpis: KpiMetric[];
  issuesByStatus: ChartSeriesPoint[];
  recentActivity: RecentActivityItem[];
}
