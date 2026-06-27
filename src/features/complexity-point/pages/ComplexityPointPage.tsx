import { useCallback, useState } from 'react';
import { StateView } from '@shared/components';
import { ComplexityFilters } from '../components/ComplexityFilters';
import { ComplexitySummaryView } from '../components/ComplexitySummaryView';
import { useComplexityPoints } from '../hooks/useComplexityPoints';
import { EMPTY_COMPLEXITY_FILTERS, type ComplexityFilterState } from '../models/complexityModels';

export const ComplexityPointPage = (): JSX.Element => {
  const [filters, setFilters] = useState<ComplexityFilterState>(EMPTY_COMPLEXITY_FILTERS);
  const { summary, isLoading, isError, isEmpty, error } = useComplexityPoints(filters);

  const handleReset = useCallback(() => setFilters(EMPTY_COMPLEXITY_FILTERS), []);

  return (
    <div data-testid="complexity-point-page">
      <header className="page-header">
        <h1 className="page-header__title">Complexity Point</h1>
        <p className="page-header__subtitle">
          Complexity point summary from Jira filter “GET COMPLEXITY BY YEAR”
        </p>
      </header>

      {summary ? (
        <ComplexityFilters
          options={summary.options}
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
        />
      ) : null}

      <StateView
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
        error={error}
        loadingLabel="Loading complexity points…"
        emptyLabel="No complexity points found for the GET COMPLEXITY BY YEAR filter."
      >
        {summary ? <ComplexitySummaryView summary={summary} /> : null}
      </StateView>
    </div>
  );
};

export default ComplexityPointPage;
