import { render, screen, fireEvent } from '@testing-library/react';
import type { MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { DefectFilters } from '../components/DefectFilters';
import { EMPTY_DEFECT_FILTERS, type DefectFilterOptions } from '../models/defectModels';

// Replace the heavy KendoReact MultiSelect with a button that emits a known
// change payload so the release/owner/severity handlers can be exercised.
jest.mock('@progress/kendo-react-dropdowns', () => ({
  MultiSelect: ({
    ariaLabel,
    onChange,
  }: {
    ariaLabel: string;
    onChange: (event: MultiSelectChangeEvent) => void;
  }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() =>
        onChange({
          value: ariaLabel === 'Filter by release' ? ['v26.2.2', 'v26.2.3'] : ['alice'],
        } as MultiSelectChangeEvent)
      }
    >
      {ariaLabel}
    </button>
  ),
}));

const options: DefectFilterOptions = {
  releases: ['v26.2.3', 'v26.2.2'],
  owners: ['alice', 'bob'],
  severities: ['Critical', 'High'],
  rootCauses: ['Coding Error', 'Data Issue'],
};

describe('DefectFilters', () => {
  it('propagates release selections as strings', () => {
    const onChange = jest.fn();
    render(
      <DefectFilters
        options={options}
        filters={EMPTY_DEFECT_FILTERS}
        onChange={onChange}
        onReset={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Filter by release'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ releases: ['v26.2.2', 'v26.2.3'] }),
    );
  });

  it('propagates owner and severity selections as strings', () => {
    const onChange = jest.fn();
    render(
      <DefectFilters
        options={options}
        filters={EMPTY_DEFECT_FILTERS}
        onChange={onChange}
        onReset={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Filter by developer'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ owners: ['alice'] }),
    );

    fireEvent.click(screen.getByLabelText('Filter by severity'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ severities: ['alice'] }),
    );
  });

  it('propagates root cause selections as strings', () => {
    const onChange = jest.fn();
    render(
      <DefectFilters
        options={options}
        filters={EMPTY_DEFECT_FILTERS}
        onChange={onChange}
        onReset={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Filter by root cause'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ rootCauses: ['alice'] }),
    );
  });

  it('forwards reset to the parent', () => {
    const onReset = jest.fn();
    render(
      <DefectFilters
        options={options}
        filters={EMPTY_DEFECT_FILTERS}
        onChange={jest.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
