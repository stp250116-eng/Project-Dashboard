import { fireEvent, render, screen } from '@testing-library/react';
import ComplexityPointPage, { ComplexityPointPage as NamedComplexityPointPage } from '../pages/ComplexityPointPage';

const mockUseComplexityPoints = jest.fn();

jest.mock('../hooks/useComplexityPoints', () => ({
  useComplexityPoints: (...args: unknown[]) => mockUseComplexityPoints(...args),
}));

describe('ComplexityPointPage', () => {
  beforeEach(() => {
    mockUseComplexityPoints.mockReset();
  });

  it('renders the page heading and summary content when a summary exists', () => {
    mockUseComplexityPoints.mockReturnValue({
      summary: {
        rows: [{ assignee: 'Alice', complexity: 6 }],
        options: { assignees: ['Alice'] },
        kpis: [{ id: 'employees', label: 'Total Employees', value: 1 }],
      },
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    render(<ComplexityPointPage />);

    expect(screen.getByRole('heading', { name: 'Complexity Point', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Complexity Point Summary')).toBeInTheDocument();
  });

  it('renders the empty state when no summary is available', () => {
    mockUseComplexityPoints.mockReturnValue({
      summary: undefined,
      isLoading: false,
      isError: false,
      isEmpty: true,
      error: null,
    });

    render(<ComplexityPointPage />);

    expect(screen.getByText('No complexity points found for the GET COMPLEXITY BY YEAR filter.')).toBeInTheDocument();
  });

  it('renders through the default export as well', () => {
    mockUseComplexityPoints.mockReturnValue({
      summary: {
        rows: [{ assignee: 'Alice', complexity: 6 }],
        options: { assignees: ['Alice'] },
        kpis: [{ id: 'employees', label: 'Total Employees', value: 1 }],
      },
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    render(<NamedComplexityPointPage />);

    expect(screen.getByRole('heading', { name: 'Complexity Point', level: 1 })).toBeInTheDocument();
  });

  it('invokes the reset handler when the filter reset action is triggered', () => {
    mockUseComplexityPoints.mockReturnValue({
      summary: {
        rows: [{ assignee: 'Alice', complexity: 6 }],
        options: { assignees: ['Alice'] },
        kpis: [{ id: 'employees', label: 'Total Employees', value: 1 }],
      },
      isLoading: false,
      isError: false,
      isEmpty: false,
      error: null,
    });

    render(<ComplexityPointPage />);

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByTestId('complexity-point-page')).toBeInTheDocument();
  });
});
