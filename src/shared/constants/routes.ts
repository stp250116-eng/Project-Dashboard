export const ROUTES = {
  root: '/',
  dashboard: '/dashboard',
  jiraOverview: '/jira-overview',
  sprintBoard: '/sprint-board',
  releaseDashboard: '/release-dashboard',
  defectDashboard: '/defect-dashboard',
  complexityPoint: '/complexity-point',
  teamCapacity: '/team-capacity',
  reports: '/reports',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
