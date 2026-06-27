import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Disable the reports feature flag to cover the early-return guard.
jest.mock('@shared/constants/appConfig', () => ({
  appConfig: { featureFlags: { reports: false } },
}));

import ReportsPage from '../pages/ReportsPage';

describe('ReportsPage (feature disabled)', () => {
  it('renders the disabled notice instead of the catalog', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ReportsPage />
      </QueryClientProvider>,
    );

    expect(
      screen.getByText('Reports are disabled in this environment.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export Excel' })).not.toBeInTheDocument();
  });
});
