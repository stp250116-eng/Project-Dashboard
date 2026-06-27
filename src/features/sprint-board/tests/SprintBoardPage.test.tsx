import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SprintBoardPage from '../pages/SprintBoardPage';

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <SprintBoardPage />
    </QueryClientProvider>,
  );
};

describe('SprintBoardPage', () => {
  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sprint Board', level: 1 })).toBeInTheDocument();
  });

  it('renders sprint KPI cards', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Committed')).toBeInTheDocument());
    expect(screen.getByLabelText('Remaining')).toBeInTheDocument();
  });
});
