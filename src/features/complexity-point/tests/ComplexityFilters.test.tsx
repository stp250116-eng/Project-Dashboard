import { render, screen, fireEvent } from '@testing-library/react';
import { ComplexityFilters } from '../components/ComplexityFilters';
import { EMPTY_COMPLEXITY_FILTERS, type ComplexityFilterOptions } from '../models/complexityModels';

jest.mock('@progress/kendo-react-dropdowns', () => ({
  MultiSelect: ({ ariaLabel, autoClose, onChange }: { ariaLabel: string; autoClose?: boolean; onChange: (event: { value: string[] }) => void }) => (
    <div>
      <span>{ariaLabel}</span>
      <button type="button" onClick={() => onChange({ value: ['Alice', 'Bob'] })}>
        Select developers
      </button>
      <span data-testid="auto-close">{String(autoClose)}</span>
    </div>
  ),
}));

const options: ComplexityFilterOptions = {
  assignees: ['Alice', 'Bob', 'Cara'],
};

describe('ComplexityFilters', () => {
  it('keeps the developer multi-select open for multiple selections and uses the Developer label', () => {
    const onChange = jest.fn();

    render(
      <ComplexityFilters
        options={options}
        filters={EMPTY_COMPLEXITY_FILTERS}
        onChange={onChange}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Filter by developer')).toBeInTheDocument();
    expect(screen.getByTestId('auto-close')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'Select developers' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ assignees: ['Alice', 'Bob'] }));
  });
});
