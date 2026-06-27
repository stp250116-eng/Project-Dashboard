import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
  it('invokes the provided apply and reset handlers', () => {
    const onApply = jest.fn();
    const onReset = jest.fn();
    render(
      <FilterPanel title="Defect filters" onApply={onApply} onReset={onReset}>
        <span>body</span>
      </FilterPanel>,
    );

    expect(screen.getByLabelText('Defect filters')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders the default title and tolerates missing handlers', () => {
    render(
      <FilterPanel>
        <span>body</span>
      </FilterPanel>,
    );

    expect(screen.getByLabelText('Filters')).toBeInTheDocument();
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    }).not.toThrow();
  });
});
