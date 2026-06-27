import { MultiSelect, type MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { FilterPanel } from '@shared/components';
import type { ComplexityFilterOptions, ComplexityFilterState } from '../models/complexityModels';

interface ComplexityFiltersProps {
  options: ComplexityFilterOptions;
  filters: ComplexityFilterState;
  onChange: (next: ComplexityFilterState) => void;
  onReset: () => void;
}

export const ComplexityFilters = ({
  options,
  filters,
  onChange,
  onReset,
}: ComplexityFiltersProps): JSX.Element => {
  const handleAssignees = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, assignees: event.value as string[] });

  return (
    <FilterPanel title="Filters" onReset={onReset}>
      <div className="defect-filters__grid">
        <div className="defect-filters__field">
          <span className="defect-filters__label">Developer</span>
          <MultiSelect
            data={options.assignees}
            value={filters.assignees}
            onChange={handleAssignees}
            autoClose={false}
            placeholder="All developers"
            ariaLabel="Filter by developer"
          />
        </div>
      </div>
    </FilterPanel>
  );
};
