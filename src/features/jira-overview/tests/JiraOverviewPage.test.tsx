import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JiraOverviewPage from '../pages/JiraOverviewPage';

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <JiraOverviewPage />
    </QueryClientProvider>,
  );
};

describe('JiraOverviewPage', () => {
  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Jira Overview', level: 1 })).toBeInTheDocument();
  });

  it('shows open and closed KPI cards', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Open Issues')).toBeInTheDocument());
    expect(screen.getByLabelText('Closed Issues')).toBeInTheDocument();
  });
});
