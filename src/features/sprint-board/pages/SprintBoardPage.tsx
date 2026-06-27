import { useSprintProgress } from '../hooks/useSprintProgress';
import { KpiCard, DataChart, StateView } from '@shared/components';

/** Active sprint progress and burndown. */
const SprintBoardPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useSprintProgress();

  return (
    <div data-testid="sprint-board-page">
      <header className="page-header">
        <h1 className="page-header__title">Sprint Board</h1>
        <p className="page-header__subtitle">Active sprint progress and burndown</p>
      </header>

      <StateView isLoading={isLoading} isError={isError} error={error ?? null}>
        {data ? (
          <>
            <div className="kpi-grid">
              <KpiCard metric={{ id: 'committed', label: 'Committed', value: data.committedPoints, unit: 'pts' }} />
              <KpiCard metric={{ id: 'completed', label: 'Completed', value: data.completedPoints, unit: 'pts' }} />
              <KpiCard metric={{ id: 'remaining', label: 'Remaining', value: data.remainingPoints, unit: 'pts' }} />
            </div>
            <section className="surface" aria-label="Burndown">
              <DataChart title={`${data.sprintName} Burndown`} data={data.burndown} type="line" />
            </section>
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default SprintBoardPage;
