import { MultiSelect, type MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { FilterPanel } from '@shared/components';
import type {
  DeveloperTrainingFilterOptions,
  DeveloperTrainingFilterState,
} from '../models/developerTrainingModels';

interface DeveloperTrainingFiltersProps {
  options: DeveloperTrainingFilterOptions;
  filters: DeveloperTrainingFilterState;
  onChange: (next: DeveloperTrainingFilterState) => void;
  onReset: () => void;
}

export const DeveloperTrainingFilters = ({
  options,
  filters,
  onChange,
  onReset,
}: DeveloperTrainingFiltersProps): JSX.Element => {
  const handleDevelopers = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, developers: event.value as string[] });
  const handleVendors = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, vendorTypes: event.value as string[] });

  return (
    <FilterPanel title="Filters" onReset={onReset}>
      <div className="defect-filters__grid">
        <div className="defect-filters__field">
          <span className="defect-filters__label">Developer</span>
          <MultiSelect
            data={options.developers}
            value={filters.developers}
            onChange={handleDevelopers}
            autoClose={false}
            placeholder="All developers"
            ariaLabel="Filter by developer"
          />
        </div>

        <div className="defect-filters__field">
          <span className="defect-filters__label">Vendor Type</span>
          <MultiSelect
            data={options.vendorTypes}
            value={filters.vendorTypes}
            onChange={handleVendors}
            autoClose={false}
            placeholder="All vendors"
            ariaLabel="Filter by vendor type"
          />
        </div>
      </div>
    </FilterPanel>
  );
};
