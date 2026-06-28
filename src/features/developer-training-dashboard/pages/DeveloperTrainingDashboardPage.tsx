import { useCallback, useState } from 'react';
import { StateView } from '@shared/components';
import { DeveloperTrainingFilters } from '../components/DeveloperTrainingFilters';
import { DeveloperTrainingKpiView } from '../components/DeveloperTrainingKpiView';
import { DeveloperTrainingCharts } from '../components/DeveloperTrainingCharts';
import { DeveloperTrainingGrid } from '../components/DeveloperTrainingGrid';
import { useDeveloperTraining } from '../hooks/useDeveloperTraining';
import {
  EMPTY_DEVELOPER_TRAINING_FILTERS,
  type DeveloperTrainingFilterState,
} from '../models/developerTrainingModels';

const DeveloperTrainingDashboardPage = (): JSX.Element => {
  const [filters, setFilters] = useState<DeveloperTrainingFilterState>(
    EMPTY_DEVELOPER_TRAINING_FILTERS,
  );
  const { summary, isLoading, isError, isEmpty, error } = useDeveloperTraining(filters);

  const handleReset = useCallback(() => setFilters(EMPTY_DEVELOPER_TRAINING_FILTERS), []);

  return (
    <div data-testid="developer-training-dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Developer Training Dashboard</h1>
        <p className="page-header__subtitle">
          Live training hours analytics from Jira filter “[OO] - GET TRAINING INFORMATION”
        </p>
      </header>

      {summary ? (
        <DeveloperTrainingFilters
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
        loadingLabel="Loading training analytics…"
        emptyLabel="No training records found for the GET TRAINING INFORMATION filter."
      >
        {summary ? (
          <>
            <DeveloperTrainingKpiView summary={summary} />
            <DeveloperTrainingCharts summary={summary} />
            <DeveloperTrainingGrid summary={summary} />
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default DeveloperTrainingDashboardPage;
