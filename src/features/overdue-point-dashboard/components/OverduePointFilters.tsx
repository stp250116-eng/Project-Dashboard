import { MultiSelect, type MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { FilterPanel } from '@shared/components';
import type {
  OverduePointFilterOptions,
  OverduePointFilterState,
} from '../models/overduePointModels';

interface OverduePointFiltersProps {
  options: OverduePointFilterOptions;
  filters: OverduePointFilterState;
  onChange: (next: OverduePointFilterState) => void;
  onReset: () => void;
}

export const OverduePointFilters = ({
  options,
  filters,
  onChange,
  onReset,
}: OverduePointFiltersProps): JSX.Element => {
  const handleDevelopers = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, developers: event.value as string[] });

  const handleReleases = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, releaseVersions: event.value as string[] });

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
          <span className="defect-filters__label">Release Version</span>
          <MultiSelect
            data={options.releaseVersions}
            value={filters.releaseVersions}
            onChange={handleReleases}
            autoClose={false}
            placeholder="All releases"
            ariaLabel="Filter by release version"
          />
        </div>
      </div>
    </FilterPanel>
  );
};
