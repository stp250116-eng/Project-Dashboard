import { render, screen, waitFor, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import ReleaseDashboardPage from '../pages/ReleaseDashboardPage';
import type { ReleaseRow } from '../hooks/useReleases';

jest.mock('../hooks/useReleases', () => {
  const actual = jest.requireActual('../hooks/useReleases');
  return { ...actual, useReleases: jest.fn() };
});

import { useReleases } from '../hooks/useReleases';

const mockedUseReleases = useReleases as jest.MockedFunction<typeof useReleases>;

const rows: ReleaseRow[] = [
  { id: 'r1', name: '2026.06', status: 'In Progress', readiness: 72, targetDate: '2026-06-30' },
];

const setResult = (overrides: Partial<UseQueryResult<ReleaseRow[]>>): void => {
  mockedUseReleases.mockReturnValue({
    data: rows,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as UseQueryResult<ReleaseRow[]>);
};

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ReleaseDashboardPage />
    </QueryClientProvider>,
  );
};

describe('ReleaseDashboardPage', () => {
  beforeEach(() => setResult({}));

  it('renders the heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Release Dashboard', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the releases grid on success', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByLabelText('Releases')).toBeInTheDocument());
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

  it('exercises the real releases hook', async () => {
    const actual = jest.requireActual<typeof import('../hooks/useReleases')>(
      '../hooks/useReleases',
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => actual.useReleases(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });

  it('renders the error state', () => {
    setResult({ data: undefined, isError: true, error: new Error('down') });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
