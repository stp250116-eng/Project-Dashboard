import { render, screen, act, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { RouterProvider } from 'react-router-dom';

// Mock every lazily-imported page with a trivial component so the router test
// exercises the lazy import factories and `withSuspense` wrapper without
// rendering real pages (which would perform data fetching).
const pageMock = (heading: string) => ({
  __esModule: true,
  default: () => createElement('h1', null, heading),
});

jest.mock('@features/dashboard/pages/DashboardPage', () => pageMock('Dashboard'));
jest.mock('@features/jira-overview/pages/JiraOverviewPage', () => pageMock('Jira Overview'));
jest.mock('@features/sprint-board/pages/SprintBoardPage', () => pageMock('Sprint Board'));
jest.mock('@features/release-dashboard/pages/ReleaseDashboardPage', () =>
  pageMock('Release Dashboard'),
);
jest.mock('@features/defect-dashboard/pages/DefectDashboardPage', () =>
  pageMock('Defect Dashboard'),
);
jest.mock('@features/complexity-point/pages/ComplexityPointPage', () =>
  pageMock('Complexity Point'),
);
jest.mock('@features/developer-training-dashboard/pages/DeveloperTrainingDashboardPage', () =>
  pageMock('Developer Training Dashboard'),
);
jest.mock('@features/overdue-point-dashboard/pages/OverduePointDashboardPage', () =>
  pageMock('Overdue Point Dashboard'),
);
jest.mock('@features/team-capacity/pages/TeamCapacityPage', () => pageMock('Team Capacity'));
jest.mock('@features/reports/pages/ReportsPage', () => pageMock('Reports'));

import { router } from './router';

const renderRouter = (): void => {
  render(<RouterProvider router={router} />);
};

describe('router', () => {
  it('redirects the index route to the dashboard', async () => {
    renderRouter();
    expect(
      await screen.findByRole('heading', { name: 'Dashboard', level: 1 }),
    ).toBeInTheDocument();
  });

  it('lazily resolves every primary route', async () => {
    renderRouter();
    await screen.findByRole('heading', { name: 'Dashboard', level: 1 });

    const routesToVisit: ReadonlyArray<readonly [string, string]> = [
      ['/jira-overview', 'Jira Overview'],
      ['/sprint-board', 'Sprint Board'],
      ['/release-dashboard', 'Release Dashboard'],
      ['/defect-dashboard', 'Defect Dashboard'],
      ['/complexity-point', 'Complexity Point'],
      ['/developer-training-dashboard', 'Developer Training Dashboard'],
      ['/overdue-point-dashboard', 'Overdue Point Dashboard'],
      ['/team-capacity', 'Team Capacity'],
      ['/reports', 'Reports'],
    ];

    for (const [path, heading] of routesToVisit) {
      await act(async () => {
        await router.navigate(path);
      });
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument(),
      );
    }
  });

  it('redirects unknown routes to the dashboard', async () => {
    renderRouter();
    await act(async () => {
      await router.navigate('/does-not-exist');
    });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument(),
    );
  });
});
