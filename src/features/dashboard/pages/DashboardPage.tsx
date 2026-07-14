import { useTeamGoal } from '../hooks/useTeamGoal';
import { useUpskilling } from '../hooks/useUpskilling';
import { useDefects } from '../hooks/useDefects';
import { useOverdue } from '../hooks/useOverdue';
import { TeamGoalSummary } from '../components/TeamGoalSummary';
import { StateView } from '@shared/components';

/** Executive dashboard landing page. */
const DashboardPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useTeamGoal();
  const { data: upskillingData } = useUpskilling();
  const { data: defectsData } = useDefects();
  const { data: overdueData } = useOverdue();

  return (
    <div data-testid="dashboard-page" className="dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Dashboard</h1>
        <p className="page-header__subtitle">Executive summary across teams and Jira projects</p>
      </header>

      {/* Quick Filters removed per feature update */}

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
        isEmpty={!isLoading && !isError && !data}
      >
        {data ? (
          <TeamGoalSummary summary={data} upskilling={upskillingData ?? null} defects={defectsData ?? null} overdue={overdueData ?? null} />
        ) : null}
      </StateView>
    </div>
  );
};

export default DashboardPage;
