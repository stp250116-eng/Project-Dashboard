import { render, screen } from '@testing-library/react';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard metric={{ id: 'k', label: 'Open Issues', value: 42 }} />);
    expect(screen.getByLabelText('Open Issues')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders trend and delta when provided', () => {
    render(
      <KpiCard metric={{ id: 'k', label: 'Velocity', value: 30, delta: 5, trend: 'up' }} />,
    );
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('renders unit when provided', () => {
    render(<KpiCard metric={{ id: 'k', label: 'Velocity', value: 30, unit: 'pts' }} />);
    expect(screen.getByText(/pts/)).toBeInTheDocument();
  });

  it('applies the wide variant class when wide is set', () => {
    render(
      <KpiCard metric={{ id: 'k', label: 'Top Defect Developer', value: 'Wasapon' }} wide />,
    );
    expect(screen.getByLabelText('Top Defect Developer')).toHaveClass('kpi-card--wide');
  });

  it('omits the wide variant class by default', () => {
    render(<KpiCard metric={{ id: 'k', label: 'Open Issues', value: 42 }} />);
    expect(screen.getByLabelText('Open Issues')).not.toHaveClass('kpi-card--wide');
  });
});
