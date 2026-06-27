import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { AppProviders } from './AppProviders';
import { queryClient } from './queryClient';

const QueryClientProbe = (): JSX.Element => {
  const client = useQueryClient();
  return <span>{client === queryClient ? 'shared-client' : 'other-client'}</span>;
};

describe('AppProviders', () => {
  it('renders children within the shared QueryClientProvider', () => {
    render(
      <AppProviders>
        <QueryClientProbe />
      </AppProviders>,
    );
    expect(screen.getByText('shared-client')).toBeInTheDocument();
  });
});
