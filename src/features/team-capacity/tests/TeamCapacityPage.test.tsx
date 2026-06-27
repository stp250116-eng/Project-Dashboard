import { render, screen, waitFor, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import TeamCapacityPage from '../pages/TeamCapacityPage';
import type { TeamMemberCapacity } from '../hooks/useTeamCapacity';

jest.mock('../hooks/useTeamCapacity', () => {
  const actual = jest.requireActual('../hooks/useTeamCapacity');
  return { ...actual, useTeamCapacity: jest.fn() };
});

import { useTeamCapacity } from '../hooks/useTeamCapacity';

const mockedUseTeamCapacity = useTeamCapacity as jest.MockedFunction<typeof useTeamCapacity>;

const rows: TeamMemberCapacity[] = [
  { id: 't1', name: 'A. Patel', assignedPoints: 18, capacityPoints: 20, utilization: 90 },
];

const setResult = (overrides: Partial<UseQueryResult<TeamMemberCapacity[]>>): void => {
  mockedUseTeamCapacity.mockReturnValue({
    data: rows,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as UseQueryResult<TeamMemberCapacity[]>);
};

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <TeamCapacityPage />
    </QueryClientProvider>,
  );
};

describe('TeamCapacityPage', () => {
  beforeEach(() => setResult({}));

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Team Capacity', level: 1 })).toBeInTheDocument();
  });

  it('renders the capacity grid on success', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Capacity')).toBeInTheDocument());
  });

  it('renders the loading state', () => {
    setResult({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the empty state', () => {
    setResult({ data: [] });
    renderPage();
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('renders the empty state when data is undefined but settled', () => {
    setResult({ data: undefined });
    renderPage();
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('exercises the real capacity hook', async () => {
    const actual = jest.requireActual<typeof import('../hooks/useTeamCapacity')>(
      '../hooks/useTeamCapacity',
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => actual.useTeamCapacity(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });

  it('renders the error state', () => {
    setResult({ data: undefined, isError: true, error: new Error('down') });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
