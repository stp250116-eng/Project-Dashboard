import type { DashboardSummary } from '../models/dashboardModels';

/**
 * Mock dashboard data source. Replace with a real API/Jira-backed service.
 * Kept deterministic so tests and Playwright smoke runs are stable.
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  return Promise.resolve({
    kpis: [
      { id: 'open', label: 'Open Issues', value: 128, delta: 4, trend: 'up' },
      { id: 'closed', label: 'Closed This Week', value: 87, delta: 12, trend: 'up' },
      { id: 'velocity', label: 'Avg Velocity', value: 42, unit: 'pts', delta: 2, trend: 'flat' },
      { id: 'defects', label: 'Critical Defects', value: 5, delta: 1, trend: 'down' },
    ],
    issuesByStatus: [
      { category: 'To Do', value: 48 },
      { category: 'In Progress', value: 35 },
      { category: 'In Review', value: 18 },
      { category: 'Done', value: 87 },
    ],
    recentActivity: [
      { id: 'a1', title: 'DASH-204 moved to Done', actor: 'A. Patel', timestamp: '2026-06-13T09:12:00Z' },
      { id: 'a2', title: 'DASH-198 commented', actor: 'M. Chen', timestamp: '2026-06-13T08:40:00Z' },
      { id: 'a3', title: 'Sprint 24 started', actor: 'System', timestamp: '2026-06-12T16:00:00Z' },
    ],
  });
};
