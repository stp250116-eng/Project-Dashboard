import { MultiSelect, type MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { FilterPanel } from '@shared/components';
import type { DefectFilterOptions, DefectFilterState } from '../models/defectModels';

interface DefectFiltersProps {
  options: DefectFilterOptions;
  filters: DefectFilterState;
  onChange: (next: DefectFilterState) => void;
  onReset: () => void;
}

/**
 * Interactive top-of-page filter bar. Every change is propagated immediately so
 * the dashboard auto-refreshes without an explicit Apply step or page reload.
 */
export const DefectFilters = ({
  options,
  filters,
  onChange,
  onReset,
}: DefectFiltersProps): JSX.Element => {
  const handleReleases = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, releases: event.value as string[] });
  const handleOwners = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, owners: event.value as string[] });
  const handleSeverities = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, severities: event.value as string[] });
  const handleRootCauses = (event: MultiSelectChangeEvent): void =>
    onChange({ ...filters, rootCauses: event.value as string[] });

  return (
    <FilterPanel title="Filters" onReset={onReset}>
      <div className="defect-filters__grid">
        <div className="defect-filters__field">
          <span className="defect-filters__label">Release</span>
          <MultiSelect
            data={options.releases}
            value={filters.releases}
            onChange={handleReleases}
            placeholder="All releases"
            ariaLabel="Filter by release"
          />
        </div>

        <div className="defect-filters__field">
          <span className="defect-filters__label">Developer / Owner</span>
          <MultiSelect
            data={options.owners}
            value={filters.owners}
            onChange={handleOwners}
            placeholder="All developers"
            ariaLabel="Filter by developer"
          />
        </div>

        <div className="defect-filters__field">
          <span className="defect-filters__label">Severity</span>
          <MultiSelect
            data={options.severities}
            value={filters.severities}
            onChange={handleSeverities}
            placeholder="All severities"
            ariaLabel="Filter by severity"
          />
        </div>

        <div className="defect-filters__field">
          <span className="defect-filters__label">Root Cause</span>
          <MultiSelect
            data={options.rootCauses}
            value={filters.rootCauses}
            onChange={handleRootCauses}
            placeholder="All root causes"
            ariaLabel="Filter by root cause"
          />
        </div>
      </div>
    </FilterPanel>
  );
};
