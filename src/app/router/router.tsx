import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { ROUTES } from '@shared/constants/routes';

const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));
// Sprint Board, Release Dashboard, Team Capacity and Reports features removed
const DefectDashboardPage = lazy(
  () => import('@features/defect-dashboard/pages/DefectDashboardPage'),
);
const ComplexityPointPage = lazy(
  () => import('@features/complexity-point/pages/ComplexityPointPage'),
);
const DeveloperTrainingDashboardPage = lazy(
  () => import('@features/developer-training-dashboard/pages/DeveloperTrainingDashboardPage'),
);
const OverduePointDashboardPage = lazy(
  () => import('@features/overdue-point-dashboard/pages/OverduePointDashboardPage'),
);
// Team Capacity and Reports removed
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
      // Jira Overview feature removed
      // Sprint Board and Release Dashboard removed
      { path: ROUTES.defectDashboard, element: withSuspense(<DefectDashboardPage />) },
      { path: ROUTES.complexityPoint, element: withSuspense(<ComplexityPointPage />) },
      { path: ROUTES.developerTrainingDashboard, element: withSuspense(<DeveloperTrainingDashboardPage />) },
      { path: ROUTES.overduePointDashboard, element: withSuspense(<OverduePointDashboardPage />) },
      // Team Capacity removed
      { path: ROUTES.goalSetting, element: withSuspense(<GoalSettingPage />) },
      // Reports removed
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
