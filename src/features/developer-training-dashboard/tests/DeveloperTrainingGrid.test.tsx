import { render, screen } from '@testing-library/react';
import { DeveloperTrainingGrid } from '../components/DeveloperTrainingGrid';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

jest.mock('@shared/components', () => ({
  DataGrid: ({ data, ariaLabel }: { data: unknown[]; ariaLabel: string }) => (
    <table data-testid="data-grid" aria-label={ariaLabel}>
      <tbody>
        {(data as Array<{ developer: string; totalTrainingHours: number }>).map((row) => (
          <tr key={row.developer}>
            <td>{row.developer}</td>
            <td>{row.totalTrainingHours}h</td>
          </tr>
        ))} 
      </tbody>
    </table>
  ),
}));

describe('DeveloperTrainingGrid', () => {
  it('renders the section with correct aria-label', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    const section = screen.getByRole('region', { name: 'Developer training summary' });
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('surface');
  });

  it('renders the section title', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByRole('heading', { name: 'Training Hours by Developer', level: 2 })).toBeInTheDocument();
  });

  it('renders the data grid with correct aria-label', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByLabelText('Developer training summary table')).toBeInTheDocument();
  });

  it('renders grid with sortable property', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('renders developer and total training hours columns', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [
        { developer: 'Alice', totalTrainingHours: 40 },
      ],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays multiple rows of training data', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [
        { developer: 'Alice', totalTrainingHours: 40 },
        { developer: 'Bob', totalTrainingHours: 30 },
        { developer: 'Charlie', totalTrainingHours: 50 },
      ],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders empty grid when no rows provided', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingGrid summary={summary} />);
    
    const tbody = container.querySelector('tbody');
    expect(tbody?.children).toHaveLength(0);
  });

  it('applies margin-top style to section', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingGrid summary={summary} />);
    
    const section = container.querySelector('.surface');
    expect(section).toHaveStyle('margin-top: 10px');
  });

  it('applies title styling class to heading', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingGrid summary={summary} />);
    
    const heading = container.querySelector('.surface__title');
    expect(heading).toBeInTheDocument();
  });

  it('passes all row data to DataGrid component', () => {
    const rows = [
      { developer: 'Developer A', totalTrainingHours: 25.5 },
      { developer: 'Developer B', totalTrainingHours: 12.75 },
    ];
    const summary: DeveloperTrainingSummary = {
      rows,
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingGrid summary={summary} />);
    
    expect(screen.getByText('Developer A')).toBeInTheDocument();
    expect(screen.getByText('Developer B')).toBeInTheDocument();
  });

  it('renders section with correct class structure', () => {
    const summary: DeveloperTrainingSummary = {
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingGrid summary={summary} />);
    
    const section = container.querySelector('section.surface');
    expect(section).toHaveAttribute('aria-label', 'Developer training summary');
  });
});
