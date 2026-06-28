import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverduePointDashboardPage from '../pages/OverduePointDashboardPage';
import type { OverduePointSummary } from '../models/overduePointModels';

jest.mock('../hooks/useOverduePointDashboard', () => {
  const actual = jest.requireActual('../hooks/useOverduePointDashboard');
  return { ...actual, useOverduePointDashboard: jest.fn() };
});

import { useOverduePointDashboard } from '../hooks/useOverduePointDashboard';

const mockedUseOverduePointDashboard = useOverduePointDashboard as jest.MockedFunction<
  typeof useOverduePointDashboard
>;

const summary: OverduePointSummary = {
  rows: [
    {
      developer: 'Alice',
      overduePoints: 2,
      childIssues: [
        {
          parentIssueId: 'OO-1',
          parentIssueSummary: 'Fix regression',
          releaseVersion: 'v1.0',
        },
      ],
    },
  ],
  options: {
    developers: ['Alice'],
    releaseVersions: ['v1.0'],
  },
  kpis: [
    { id: 'delayed-issues', label: 'Delayed Issues', value: 1 },
    { id: 'most-overdue-developer', label: 'Most Overdue Developer', value: 'Alice', unit: '2 points' },
    { id: 'most-impacted-release', label: 'Most Impacted Release', value: 'v1.0', unit: '1 issue' },
  ],
  byDeveloper: [{ category: 'Alice', value: 2 }],
  byRelease: [{ category: 'v1.0', value: 1 }],
};

const setResult = (overrides: Partial<ReturnType<typeof useOverduePointDashboard>>): void => {
  mockedUseOverduePointDashboard.mockReturnValue({
    summary,
    analytics: {
      kpis: [],
      topDeveloper: { id: 'top-developer', label: 'Highest Overdue Point', value: 'Alice', unit: '2 points' },
      topRelease: { id: 'top-release', label: 'Most Delayed Release', value: 'v1.0', unit: '1 issues' },
      highestCollaborationRisk: {
        id: 'highest-collaboration-risk',
        label: 'Highest Collaboration Risk',
        value: 'OO-1',
        unit: '1 developers',
      },
    },
    filters: { developers: [], releaseVersions: [] },
    setFilters: jest.fn(),
    isLoading: false,
    isError: false,
    isEmpty: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useOverduePointDashboard>);
};

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <OverduePointDashboardPage />
    </QueryClientProvider>,
  );
};

describe('OverduePointDashboardPage', () => {
  beforeEach(() => {
    setResult({});
  });

  it('renders the page heading and filters', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Overdue Point Dashboard', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by developer')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by release version')).toBeInTheDocument();
  });

  it('renders KPI cards and analytics panels on success', () => {
    renderPage();

    expect(screen.getByLabelText('Delayed Issues')).toBeInTheDocument();
    expect(screen.getByLabelText('Most Overdue Developer')).toBeInTheDocument();
    expect(screen.getByLabelText('Most Impacted Release')).toBeInTheDocument();
    expect(screen.getByLabelText('Highest Overdue Point')).toBeInTheDocument();
  });

  it('renders the loading state when data is loading', () => {
    setResult({ isLoading: true, summary: undefined, analytics: undefined, isEmpty: false });
    renderPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the empty state when there is no data', () => {
    setResult({ isLoading: false, isError: false, isEmpty: true, summary: undefined, analytics: undefined });
    renderPage();

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('renders the error state when the hook fails', () => {
    setResult({ isLoading: false, isError: true, error: new Error('Test failure'), summary: undefined, analytics: undefined });
    renderPage();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test failure')).toBeInTheDocument();
  });
});
