import { render, screen } from '@testing-library/react';
import { DataChart } from './DataChart';
import type { ChartSeriesPoint } from '@shared/types/common';

const data: ChartSeriesPoint[] = [
  { category: 'A', value: 1 },
  { category: 'B', value: 2 },
];

describe('DataChart', () => {
  it('renders a pie chart and uses the explicit aria label', () => {
    render(<DataChart title="Pie" data={data} type="pie" ariaLabel="Distribution" />);
    expect(screen.getByLabelText('Distribution')).toBeInTheDocument();
  });

  it('renders a donut chart', () => {
    render(<DataChart title="Donut" data={data} type="donut" ariaLabel="Donut chart" />);
    expect(screen.getByLabelText('Donut chart')).toBeInTheDocument();
  });

  it('falls back to the title for the aria label on non-circular charts', () => {
    render(<DataChart title="Columns" data={data} />);
    expect(screen.getByLabelText('Columns')).toBeInTheDocument();
  });
});
