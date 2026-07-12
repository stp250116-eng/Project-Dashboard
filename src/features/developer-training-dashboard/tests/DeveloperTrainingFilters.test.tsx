import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { DeveloperTrainingFilters } from '../components/DeveloperTrainingFilters';
import type {
  DeveloperTrainingFilterOptions,
  DeveloperTrainingFilterState,
} from '../models/developerTrainingModels';

jest.mock('@shared/components', () => ({
  FilterPanel: ({ title, onReset, children }: {
    title: string;
    onReset: () => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="filter-panel">
      <div>{title}</div>
      <button onClick={onReset} data-testid="reset-button">
        Reset
      </button>
      {children}
    </div>
  ),
}));

jest.mock('@progress/kendo-react-dropdowns', () => ({
  MultiSelect: ({ placeholder, value, onChange, ariaLabel }: {
    placeholder: string;
    value: string[];
    onChange: (event: { value: string[] }) => void;
    ariaLabel: string;
    autoClose?: boolean;
  }) => (
    <input
      type="text"
      data-testid={`multi-select-${placeholder}`}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value.join(',')}
      onChange={(e) => onChange({ value: (e.target as HTMLInputElement).value.split(',').filter(Boolean) })}
    />
  ),
}));

describe('DeveloperTrainingFilters', () => {
  const mockOptions: DeveloperTrainingFilterOptions = {
    developers: ['Alice', 'Bob', 'Charlie'],
    vendorTypes: ['Internal', 'External', 'Partner'],
  };

  const mockFilters: DeveloperTrainingFilterState = {
    developers: [],
    vendorTypes: [],
  };

  it('renders the filter panel with title', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders developer and vendor type filter fields', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        // console.log('onChange calls after vendors update:', JSON.stringify(callsAfter));
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByLabelText('Filter by developer')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by vendor type')).toBeInTheDocument();
  });

  it('renders field labels', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Vendor Type')).toBeInTheDocument();
  });

  it('renders developer multi-select with correct placeholder', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByPlaceholderText('All developers')).toBeInTheDocument();
  });

  it('renders vendor multi-select with correct placeholder', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByPlaceholderText('All vendors')).toBeInTheDocument();
  });

  it('calls onChange with updated developers filter on developer selection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const developerInput = screen.getByPlaceholderText('All developers') as HTMLInputElement;
    await user.clear(developerInput);
    fireEvent.change(developerInput, { target: { value: 'Alice,Bob' } });

    // The mocked MultiSelect invokes onChange on intermediate edits as well;
    // assert that at least one call included both selected developers.
    const calls = onChange.mock.calls;
    // Debugging: inspect calls if test intermittently fails
    const found = calls.some((args) => Array.isArray(args[0]?.developers) && args[0].developers.length === 2 && args[0].developers.includes('Alice') && args[0].developers.includes('Bob'));
    expect(found).toBe(true);
  });

  it('calls onChange with updated vendor type filter on vendor selection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const vendorInput = screen.getByPlaceholderText('All vendors') as HTMLInputElement;
    await user.clear(vendorInput);
    fireEvent.change(vendorInput, { target: { value: 'Internal,External' } });

    // Assert at least one onChange call included both vendor types
    const vendorCalls = onChange.mock.calls;
    // console.log('onChange calls after vendors type:', JSON.stringify(vendorCalls));
    const vendorFound = vendorCalls.some((args) => Array.isArray(args[0]?.vendorTypes) && args[0].vendorTypes.includes('Internal') && args[0].vendorTypes.includes('External'));
    expect(vendorFound).toBe(true);
  });

  it('displays current filter values in multi-selects', () => {
    const filters: DeveloperTrainingFilterState = {
      developers: ['Alice'],
      vendorTypes: ['Internal'],
    };
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={filters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Internal')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const resetButton = screen.getByTestId('reset-button');
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('preserves other filter values when updating one filter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onReset = jest.fn();
    const initialFilters: DeveloperTrainingFilterState = {
      developers: ['Alice'],
      vendorTypes: ['Internal'],
    };

    render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={initialFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const vendorInput = screen.getByPlaceholderText('All vendors') as HTMLInputElement;
    await user.clear(vendorInput);
    fireEvent.change(vendorInput, { target: { value: 'External' } });

    // Ensure some onChange call preserved the developer and set vendor to External
    const callsAfter = onChange.mock.calls;
    // console.log('onChange calls after vendors update:', JSON.stringify(callsAfter));
    const preserved = callsAfter.some((args) => Array.isArray(args[0]?.developers) && args[0].developers.includes('Alice') && Array.isArray(args[0]?.vendorTypes) && args[0].vendorTypes.includes('External'));
    expect(preserved).toBe(true);
  });

  it('renders with grid layout for filter fields', () => {
    const onChange = jest.fn();
    const onReset = jest.fn();

    const { container } = render(
      <DeveloperTrainingFilters
        options={mockOptions}
        filters={mockFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const filterGrid = container.querySelector('.defect-filters__grid');
    expect(filterGrid).toBeInTheDocument();
    expect(filterGrid?.children).toHaveLength(2);
  });
});
