import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../pages/DashboardPage';

const renderWithClient = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
};

describe('DashboardPage', () => {
  it('renders the page title', () => {
    renderWithClient();
    expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
  });

  it('renders KPI cards after data loads', async () => {
    renderWithClient();
    await waitFor(() => {
      expect(screen.getByLabelText('Open Issues')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Critical Defects')).toBeInTheDocument();
  });

  it('toggles the quick-filter hint via Apply and Reset', async () => {
    renderWithClient();
    await waitFor(() => {
      expect(screen.getByLabelText('Open Issues')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Refine by project, team, or date range.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Filters applied.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(
      screen.getByText('Refine by project, team, or date range.'),
    ).toBeInTheDocument();
  });
});
