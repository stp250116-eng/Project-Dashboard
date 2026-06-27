import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import ReportsPage from '../pages/ReportsPage';
import type { ReportRow } from '../hooks/useReports';

jest.mock('../hooks/useReports', () => {
  const actual = jest.requireActual('../hooks/useReports');
  return { ...actual, useReports: jest.fn() };
});
jest.mock('../services/exportService', () => ({ exportReport: jest.fn() }));

import { useReports } from '../hooks/useReports';
import { exportReport } from '../services/exportService';

const mockedUseReports = useReports as jest.MockedFunction<typeof useReports>;
const mockedExport = exportReport as jest.MockedFunction<typeof exportReport>;

const rows: ReportRow[] = [
  { id: 'rp1', name: 'Sprint Summary', category: 'Agile', lastRun: '2026-06-12', format: 'Excel' },
];

const setResult = (overrides: Partial<UseQueryResult<ReportRow[]>>): void => {
  mockedUseReports.mockReturnValue({
    data: rows,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as UseQueryResult<ReportRow[]>);
};

const renderPage = (): void => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ReportsPage />
    </QueryClientProvider>,
  );
};

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setResult({});
  });

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Reports', level: 1 })).toBeInTheDocument();
  });

  it('exports the first report as Excel and PDF', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Export Excel' }));
    expect(mockedExport).toHaveBeenCalledWith(rows[0], 'excel');

    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(mockedExport).toHaveBeenCalledWith(rows[0], 'pdf');
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

  it('renders the error state', () => {
    setResult({ data: undefined, isError: true, error: new Error('down') });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
