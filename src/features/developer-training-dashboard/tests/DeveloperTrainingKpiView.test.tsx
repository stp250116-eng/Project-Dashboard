import { render, screen } from '@testing-library/react';
import { DeveloperTrainingKpiView } from '../components/DeveloperTrainingKpiView';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

jest.mock('@shared/components', () => ({
  KpiCard: ({ metric, wide }: { metric: { id: string; label?: string; value?: string }; wide: boolean }) => (
    <div data-testid={`kpi-card-${metric.id}`} data-wide={wide.toString()}>
      {metric.label}
    </div>
  ),
}));

describe('DeveloperTrainingKpiView', () => {
  it('renders section with correct aria-label', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    const section = screen.getByRole('region', { name: 'Training highlights' });
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('kpi-grid');
  });

  it('renders all kpi cards from summary.kpis', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'metric-1', label: 'Metric 1', value: 'Value 1' },
        { id: 'metric-2', label: 'Metric 2', value: 'Value 2' },
        { id: 'metric-3', label: 'Metric 3', value: 'Value 3' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-metric-1')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-card-metric-2')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-card-metric-3')).toBeInTheDocument();
  });

  it('sets wide prop to true for top-training-participant metric', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'top-training-participant', label: 'Top Participant', value: 'Alice' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    const card = screen.getByTestId('kpi-card-top-training-participant');
    expect(card).toHaveAttribute('data-wide', 'true');
  });

  it('sets wide prop to false for non-top-training-participant metrics', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'total-hours', label: 'Total Hours', value: '100h' },
        { id: 'avg-hours', label: 'Avg Hours', value: '50h' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-total-hours')).toHaveAttribute('data-wide', 'false');
    expect(screen.getByTestId('kpi-card-avg-hours')).toHaveAttribute('data-wide', 'false');
  });

  it('renders empty state when summary.kpis is empty', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingKpiView summary={summary} />);
    const section = container.querySelector('.kpi-grid');
    expect(section).toBeInTheDocument();
    expect(section?.children).toHaveLength(0);
  });

  it('uses metric.id as key for list rendering', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'unique-id-1', label: 'Metric 1', value: 'V1' },
        { id: 'unique-id-2', label: 'Metric 2', value: 'V2' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { rerender } = render(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-unique-id-1')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-card-unique-id-2')).toBeInTheDocument();

    rerender(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-unique-id-1')).toBeInTheDocument();
  });

  it('handles mixed metrics with wide and non-wide cards', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'metric-a', label: 'Metric A', value: 'A' },
        { id: 'top-training-participant', label: 'Top Participant', value: 'Winner' },
        { id: 'metric-b', label: 'Metric B', value: 'B' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-metric-a')).toHaveAttribute('data-wide', 'false');
    expect(screen.getByTestId('kpi-card-top-training-participant')).toHaveAttribute('data-wide', 'true');
    expect(screen.getByTestId('kpi-card-metric-b')).toHaveAttribute('data-wide', 'false');
  });

  it('passes metric object to KpiCard component', () => {
    const metric = { id: 'test-metric', label: 'Test Label', value: '42' };
    const summary: DeveloperTrainingSummary = {
      kpis: [metric],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    const card = screen.getByTestId('kpi-card-test-metric');
    expect(card).toHaveTextContent('Test Label');
  });

  it('renders all metrics with correct order', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [
        { id: 'first', label: 'First', value: '1' },
        { id: 'second', label: 'Second', value: '2' },
        { id: 'third', label: 'Third', value: '3' },
      ],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    const { container } = render(<DeveloperTrainingKpiView summary={summary} />);
    const cards = container.querySelectorAll('[data-testid^="kpi-card-"]');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('data-testid', 'kpi-card-first');
    expect(cards[1]).toHaveAttribute('data-testid', 'kpi-card-second');
    expect(cards[2]).toHaveAttribute('data-testid', 'kpi-card-third');
  });

  it('handles single kpi card', () => {
    const summary: DeveloperTrainingSummary = {
      kpis: [{ id: 'only-metric', label: 'Only', value: 'Single' }],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    expect(screen.getByTestId('kpi-card-only-metric')).toBeInTheDocument();
  });

  it('preserves metric properties when passing to KpiCard', () => {
    const metricWithUnit = {
      id: 'hours-metric',
      label: 'Total Hours',
      value: '100h',
      unit: 'hours',
    };
    const summary: DeveloperTrainingSummary = {
      kpis: [metricWithUnit as any],
      rows: [],
      options: { developers: [], vendorTypes: [] },
      trainingTypeDistribution: [],
      hoursByDeveloper: [],
    };

    render(<DeveloperTrainingKpiView summary={summary} />);
    const card = screen.getByTestId('kpi-card-hours-metric');
    expect(card).toBeInTheDocument();
  });
});
