export const ROUTES = {
  root: '/',
  dashboard: '/dashboard',
  // sprintBoard: '/sprint-board', (removed)
  // releaseDashboard: '/release-dashboard', (removed)
  defectDashboard: '/defect-dashboard',
  complexityPoint: '/complexity-point',
  developerTrainingDashboard: '/developer-training-dashboard',
  overduePointDashboard: '/overdue-point-dashboard',
  // teamCapacity: '/team-capacity', (removed)
  goalSetting: '/goal-setting',
  // reports: '/reports', (removed)
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
