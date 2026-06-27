import { useState } from 'react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { RecentActivity } from '../components/RecentActivity';
import {
  KpiCard,
  DataChart,
  FilterPanel,
  StateView,
} from '@shared/components';

/** Executive dashboard landing page. */
const DashboardPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useDashboardSummary();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div data-testid="dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Dashboard</h1>
        <p className="page-header__subtitle">Executive summary across teams and Jira projects</p>
      </header>

      <FilterPanel
        title="Quick Filters"
        onApply={() => setShowFilters(true)}
        onReset={() => setShowFilters(false)}
      >
        <p className="page-header__subtitle">
          {showFilters ? 'Filters applied.' : 'Refine by project, team, or date range.'}
        </p>
      </FilterPanel>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
        isEmpty={!isLoading && !isError && !data}
      >
        {data ? (
          <>
            <div className="kpi-grid">
              {data.kpis.map((metric) => (
                <KpiCard key={metric.id} metric={metric} />
              ))}
            </div>

            <div className="panel-grid">
              <section className="surface" aria-label="Issues by status">
                <DataChart title="Issues by Status" data={data.issuesByStatus} type="column" />
              </section>
              <RecentActivity items={data.recentActivity} />
            </div>
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default DashboardPage;
