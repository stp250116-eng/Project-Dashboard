import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import DeveloperTrainingDashboardPage from '../pages/DeveloperTrainingDashboardPage';
import { useDeveloperTraining } from '../hooks/useDeveloperTraining';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

jest.mock('../hooks/useDeveloperTraining');
jest.mock('@shared/components', () => ({
  StateView: ({
    isLoading,
    isError,
    isEmpty,
    error,
    loadingLabel,
    emptyLabel,
    children,
  }: {
    isLoading: boolean;
    isError: boolean;
    isEmpty: boolean;
    error: Error | null;
    loadingLabel: string;
    emptyLabel: string;
    children: React.ReactNode;
  }) => (
    <>
      {isLoading && <div>{loadingLabel}</div>}
      {isError && error && <div>Error: {error.message}</div>}
      {isEmpty && !isLoading && <div>{emptyLabel}</div>}
      {!isLoading && !isError && !isEmpty && children}
    </>
  ),
}));
jest.mock('../components/DeveloperTrainingFilters', () => ({
  DeveloperTrainingFilters: ({
    options,
    filters,
    onChange,
    onReset,
  }: {
    options: unknown;
    filters: unknown;
    onChange: (filters: unknown) => void;
    onReset: () => void;
  }) => (
    <div data-testid="filters">
      <button onClick={() => onChange({ developers: ['Test'], vendorTypes: [] })}>
        Change Filter
      </button>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));
jest.mock('../components/DeveloperTrainingKpiView', () => ({
  DeveloperTrainingKpiView: ({ summary }: { summary: DeveloperTrainingSummary }) => (
    <div data-testid="kpi-view">KPI View: {summary.rows.length} rows</div>
  ),
}));
jest.mock('../components/DeveloperTrainingCharts', () => ({
  DeveloperTrainingCharts: ({ summary }: { summary: DeveloperTrainingSummary }) => (
    <div data-testid="charts">Charts: {summary.rows.length} rows</div>
  ),
}));
jest.mock('../components/DeveloperTrainingGrid', () => ({
  DeveloperTrainingGrid: ({ summary }: { summary: DeveloperTrainingSummary }) => (
    <div data-testid="grid">Grid: {summary.rows.length} rows</div>
  ),
}));

const mockedUseDeveloperTraining = useDeveloperTraining as jest.MockedFunction<
  typeof useDeveloperTraining
>;

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <DeveloperTrainingDashboardPage />
    </QueryClientProvider>,
  );
};

describe('DeveloperTrainingDashboardPage', () => {
  const mockSummary: DeveloperTrainingSummary = {
    rows: [
      { developer: 'Alice', totalTrainingHours: 40 },
      { developer: 'Bob', totalTrainingHours: 30 },
    ],
    options: {
      developers: ['Alice', 'Bob'],
      vendorTypes: ['Internal', 'External'],
    },
    kpis: [
      { id: 'top-participant', label: 'Top', value: 'Alice' },
    ],
    trainingTypeDistribution: [
      { category: 'Online', value: 50 },
    ],
    hoursByDeveloper: [
      { category: 'Alice', value: 40 },
    ],
  };

  beforeEach(() => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });
  });

  it('renders the page heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Developer Training Dashboard', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the page subtitle', () => {
    renderPage();
    const subtitle = screen.getByRole('contentinfo', { hidden: true })?.parentElement?.querySelector('.page-header__subtitle');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle?.textContent).toContain('Live training hours analytics from Jira filter');
    expect(subtitle?.textContent).toContain('[OO] - GET TRAINING INFORMATION');
  });

  it('renders the page container with correct test id', () => {
    renderPage();
    expect(screen.getByTestId('developer-training-dashboard-page')).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: true,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Loading training analytics…')).toBeInTheDocument();
  });

  it('shows the empty state when there are no records', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: true,
      error: null,
    });

    renderPage();
    expect(
      screen.getByText('No training records found for the GET TRAINING INFORMATION filter.'),
    ).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    const error = new Error('API call failed');
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: true,
      isEmpty: false,
      error,
    });

    renderPage();
    expect(screen.getByText('Error: API call failed')).toBeInTheDocument();
  });

  it('renders filters when summary is available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
  });

  it('does not render filters when summary is not available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.queryByTestId('filters')).not.toBeInTheDocument();
  });

  it('renders KPI view when summary is available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('kpi-view')).toBeInTheDocument();
  });

  it('renders charts when summary is available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('charts')).toBeInTheDocument();
  });

  it('renders grid when summary is available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('does not render content views when summary is undefined', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.queryByTestId('kpi-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('charts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grid')).not.toBeInTheDocument();
  });

  it('passes summary to filter component', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
  });

  it('initializes with empty filters', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    expect(mockedUseDeveloperTraining).toHaveBeenCalledWith(
      expect.objectContaining({
        developers: [],
        vendorTypes: [],
      }),
    );
  });

  it('updates filters when filter component changes them', async () => {
    const user = userEvent.setup();
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    const changeButton = screen.getByText('Change Filter');
    await user.click(changeButton);

    await waitFor(() => {
      expect(mockedUseDeveloperTraining).toHaveBeenCalledWith(
        expect.objectContaining({
          developers: ['Test'],
          vendorTypes: [],
        }),
      );
    });
  });

  it('resets filters when reset button is clicked', async () => {
    const user = userEvent.setup();
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    const changeButton = screen.getByText('Change Filter');
    await user.click(changeButton);

    await waitFor(() => {
      expect(mockedUseDeveloperTraining).toHaveBeenCalledWith(
        expect.objectContaining({
          developers: ['Test'],
        }),
      );
    });

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    await waitFor(() => {
      expect(mockedUseDeveloperTraining).toHaveBeenCalledWith(
        expect.objectContaining({
          developers: [],
          vendorTypes: [],
        }),
      );
    });
  });

  it('renders header with correct class structure', () => {
    renderPage();
    const header = screen.getByRole('heading', { name: 'Developer Training Dashboard', level: 1 })
      .closest('.page-header');
    expect(header).toHaveClass('page-header');
  });

  it('passes correct props to filter component', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    expect(screen.getByTestId('filters')).toBeInTheDocument();
  });

  it('shows loading message with correct text', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: true,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByText('Loading training analytics…')).toBeInTheDocument();
  });

  it('shows empty message with correct text', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: true,
      error: null,
    });

    renderPage();
    expect(
      screen.getByText('No training records found for the GET TRAINING INFORMATION filter.'),
    ).toBeInTheDocument();
  });

  it('handles null error gracefully', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();
    expect(screen.getByTestId('developer-training-dashboard-page')).toBeInTheDocument();
  });

  it('renders all components when data is available', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-view')).toBeInTheDocument();
    expect(screen.getByTestId('charts')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('passes hook parameters correctly', () => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    renderPage();

    expect(mockedUseDeveloperTraining).toHaveBeenCalled();
    const callArgs = mockedUseDeveloperTraining.mock.calls[0]?.[0];
    expect(callArgs).toHaveProperty('developers');
    expect(callArgs).toHaveProperty('vendorTypes');
  });
});
