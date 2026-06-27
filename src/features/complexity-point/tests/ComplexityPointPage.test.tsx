import { render, screen } from '@testing-library/react';
import { ComplexityPointPage } from '../pages/ComplexityPointPage';

jest.mock('../hooks/useComplexityPoints', () => ({
  useComplexityPoints: () => ({
    summary: {
      rows: [{ assignee: 'Alice', complexity: 6 }],
      options: { assignees: ['Alice'] },
      kpis: [{ id: 'employees', label: 'Total Employees', value: 1 }],
    },
    isLoading: false,
    isError: false,
    isEmpty: false,
    error: null,
  }),
}));

describe('ComplexityPointPage', () => {
  it('renders the page heading and summary content', () => {
    render(<ComplexityPointPage />);

    expect(screen.getByRole('heading', { name: 'Complexity Point', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Complexity Point Summary')).toBeInTheDocument();
  });
});
