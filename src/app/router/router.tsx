import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { ROUTES } from '@shared/constants/routes';

const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));
const JiraOverviewPage = lazy(() => import('@features/jira-overview/pages/JiraOverviewPage'));
const SprintBoardPage = lazy(() => import('@features/sprint-board/pages/SprintBoardPage'));
const ReleaseDashboardPage = lazy(
  () => import('@features/release-dashboard/pages/ReleaseDashboardPage'),
);
const DefectDashboardPage = lazy(
  () => import('@features/defect-dashboard/pages/DefectDashboardPage'),
);
const ComplexityPointPage = lazy(
  () => import('@features/complexity-point/pages/ComplexityPointPage'),
);
const TeamCapacityPage = lazy(() => import('@features/team-capacity/pages/TeamCapacityPage'));
const DeveloperTrainingDashboardPage = lazy(
  () => import('@features/developer-training-dashboard/pages/DeveloperTrainingDashboardPage'),
);
const OverduePointDashboardPage = lazy(
  () => import('@features/overdue-point-dashboard/pages/OverduePointDashboardPage'),
);
const ReportsPage = lazy(() => import('@features/reports/pages/ReportsPage'));
const GoalSettingPage = lazy(
  () => import('@features/goal-setting/pages/GoalSettingPage'),
);

const withSuspense = (node: JSX.Element): JSX.Element => (
  <Suspense fallback={<div className="route-loading">Loading…</div>}>{node}</Suspense>
);

const routes: RouteObject[] = [
  {
    path: ROUTES.root,
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      { path: ROUTES.dashboard, element: withSuspense(<DashboardPage />) },
      { path: ROUTES.jiraOverview, element: withSuspense(<JiraOverviewPage />) },
      { path: ROUTES.sprintBoard, element: withSuspense(<SprintBoardPage />) },
      { path: ROUTES.releaseDashboard, element: withSuspense(<ReleaseDashboardPage />) },
      { path: ROUTES.defectDashboard, element: withSuspense(<DefectDashboardPage />) },
      { path: ROUTES.complexityPoint, element: withSuspense(<ComplexityPointPage />) },
      { path: ROUTES.developerTrainingDashboard, element: withSuspense(<DeveloperTrainingDashboardPage />) },
      { path: ROUTES.overduePointDashboard, element: withSuspense(<OverduePointDashboardPage />) },
      { path: ROUTES.teamCapacity, element: withSuspense(<TeamCapacityPage />) },
      { path: ROUTES.goalSetting, element: withSuspense(<GoalSettingPage />) },
      { path: ROUTES.reports, element: withSuspense(<ReportsPage />) },
      { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
