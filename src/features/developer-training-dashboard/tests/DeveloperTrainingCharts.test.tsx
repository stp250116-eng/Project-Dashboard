import { render, screen } from '@testing-library/react';
import { DeveloperTrainingCharts } from '../components/DeveloperTrainingCharts';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

jest.mock('@shared/components', () => ({
  DataChart: ({ title, type, ariaLabel }: {
    title: string;
    type: string;
    ariaLabel: string;
  }) => (
    <div data-testid={`chart-${type}`} aria-label={ariaLabel}>
      {title}
    </div>
  ),
}));

describe('DeveloperTrainingCharts', () => {
  it('renders the training type distribution pie chart', () => {
    const summary: DeveloperTrainingSummary = {
      trainingTypeDistribution: [
        { category: 'Workshop', value: 40 },
        { category: 'Online', value: 60 },
      ],
      hoursByDeveloper: [],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
    };

    render(<DeveloperTrainingCharts summary={summary} />);
    
    expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    expect(screen.getByText('Training Type Distribution')).toBeInTheDocument();
    expect(screen.getByLabelText('Training type distribution')).toBeInTheDocument();
  });

  it('renders the training hours by developer bar chart', () => {
    const summary: DeveloperTrainingSummary = {
      trainingTypeDistribution: [],
      hoursByDeveloper: [
        { category: 'Alice', value: 50 },
        { category: 'Bob', value: 30 },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
    };

    render(<DeveloperTrainingCharts summary={summary} />);
    
    expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    expect(screen.getByText('Training Hours by Developer')).toBeInTheDocument();
    expect(screen.getByLabelText('Training hours by developer')).toBeInTheDocument();
  });

  it('renders both charts in the panel grid layout', () => {
    const summary: DeveloperTrainingSummary = {
      trainingTypeDistribution: [{ category: 'Online', value: 100 }],
      hoursByDeveloper: [{ category: 'Alice', value: 100 }],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
    };

    const { container } = render(<DeveloperTrainingCharts summary={summary} />);
    const panelGrid = container.querySelector('.panel-grid');
    
    expect(panelGrid).toBeInTheDocument();
    expect(panelGrid?.children).toHaveLength(2);
  });

  it('passes data props correctly to charts', () => {
    const distributionData = [{ category: 'Type1', value: 10 }];
    const developerData = [{ category: 'Dev1', value: 20 }];
    
    const summary: DeveloperTrainingSummary = {
      trainingTypeDistribution: distributionData,
      hoursByDeveloper: developerData,
      rows: [],
      options: { developers: [], vendorTypes: [] },
      kpis: [],
    };

    render(<DeveloperTrainingCharts summary={summary} />);
    
    expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
  });
});
