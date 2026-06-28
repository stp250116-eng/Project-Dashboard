import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeveloperTrainingDashboardPage from '../pages/DeveloperTrainingDashboardPage';
import { useDeveloperTraining } from '../hooks/useDeveloperTraining';

jest.mock('../hooks/useDeveloperTraining');

const mockedUseDeveloperTraining = useDeveloperTraining as jest.MockedFunction<typeof useDeveloperTraining>;

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <DeveloperTrainingDashboardPage />
    </QueryClientProvider>,
  );
};

describe('DeveloperTrainingDashboardPage', () => {
  beforeEach(() => {
    mockedUseDeveloperTraining.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });
  });

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Developer Training Dashboard', level: 1 })).toBeInTheDocument();
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
    expect(screen.getByText('No training records found for the GET TRAINING INFORMATION filter.')).toBeInTheDocument();
  });
});
