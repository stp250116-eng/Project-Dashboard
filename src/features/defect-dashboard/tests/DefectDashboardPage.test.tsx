import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { JiraDefect } from '@integrations/jira';
import DefectDashboardPage from '../pages/DefectDashboardPage';
import { jiraDefectsFixture } from '../../../../test/fixtures/jiraDefects';

// Mock the Jira query-hook boundary (not fetch/Axios) so the page renders
// against realistic mapped defect records without network access.
jest.mock('@integrations/jira', () => {
  const actual = jest.requireActual('@integrations/jira');
  return { ...actual, useJiraDefects: jest.fn() };
});

import { useJiraDefects, mapJiraDefects } from '@integrations/jira';

const mockedUseJiraDefects = useJiraDefects as jest.MockedFunction<typeof useJiraDefects>;

const setQueryResult = (overrides: Partial<UseQueryResult<JiraDefect[]>>): void => {
  mockedUseJiraDefects.mockReturnValue({
    data: mapJiraDefects(jiraDefectsFixture.issues),
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as UseQueryResult<JiraDefect[]>);
};

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <DefectDashboardPage />
    </QueryClientProvider>,
  );
};

describe('DefectDashboardPage', () => {
  beforeEach(() => setQueryResult({}));

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Defect Dashboard', level: 1 })).toBeInTheDocument();
  });

  it('renders KPI cards from the live filter data', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Total Defects')).toBeInTheDocument());
    expect(screen.getByLabelText('Total Developers')).toBeInTheDocument();
    expect(screen.getByLabelText('Most Frequent Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Top Defect Developer')).toBeInTheDocument();
  });

  it('renders interactive filters', () => {
    renderPage();
    expect(screen.getByText('Release')).toBeInTheDocument();
    expect(screen.getByText('Developer / Owner')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Root Cause')).toBeInTheDocument();
  });

  it('shows the empty state when the filter returns no defects', () => {
    setQueryResult({ data: [] });
    renderPage();
    expect(
      screen.getByText('No defects found for the GET ALM DEFECT filter.'),
    ).toBeInTheDocument();
  });

  it('shows the loading state and hides filters while fetching', () => {
    setQueryResult({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText('Loading defects…')).toBeInTheDocument();
    expect(screen.queryByText('Release')).not.toBeInTheDocument();
  });

  it('surfaces an error state', () => {
    setQueryResult({ data: undefined, isError: true, error: new Error('boom') });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows the empty state when settled with no data', () => {
    setQueryResult({ data: undefined });
    renderPage();
    expect(
      screen.getByText('No defects found for the GET ALM DEFECT filter.'),
    ).toBeInTheDocument();
  });

  it('resets the filters via the reset action', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Total Defects')).toBeInTheDocument();
  });
});
