import { useCallback, useState } from 'react';
import { StateView } from '@shared/components';
import { useDefectAnalytics } from '../hooks/useDefects';
import { DefectFilters } from '../components/DefectFilters';
import { DefectAnalyticsView } from '../components/DefectAnalyticsView';
import { EMPTY_DEFECT_FILTERS, type DefectFilterState } from '../models/defectModels';

/**
 * Interactive defect analytics dashboard, sourced live from the Jira
 * "GET ALM DEFECT" saved filter. Filters refresh all visualizations in place —
 * no page reload.
 */
const DefectDashboardPage = (): JSX.Element => {
  const [filters, setFilters] = useState<DefectFilterState>(EMPTY_DEFECT_FILTERS);

  const { analytics, isLoading, isError, isEmpty, error } = useDefectAnalytics(filters);

  const handleReset = useCallback(() => setFilters(EMPTY_DEFECT_FILTERS), []);

  return (
    <div data-testid="defect-dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Defect Dashboard</h1>
        <p className="page-header__subtitle">
          Live developer defect analytics from Jira filter “GET ALM DEFECT”
        </p>
      </header>

      {analytics ? (
        <DefectFilters
          options={analytics.options}
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
        loadingLabel="Loading defects…"
        emptyLabel="No defects found for the GET ALM DEFECT filter."
      >
        {analytics ? <DefectAnalyticsView analytics={analytics} /> : null}
      </StateView>
    </div>
  );
};

export default DefectDashboardPage;
