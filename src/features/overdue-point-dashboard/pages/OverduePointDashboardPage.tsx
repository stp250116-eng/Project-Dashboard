import { KpiCard, StateView } from '@shared/components';
import { OverduePointCharts } from '../components/OverduePointCharts';
import { OverduePointFilters } from '../components/OverduePointFilters';
import { OverduePointGrid } from '../components/OverduePointGrid';
import { useOverduePointDashboard } from '../hooks/useOverduePointDashboard';
import { EMPTY_OVERDUE_POINT_FILTERS } from '../models/overduePointModels';

const OverduePointDashboardPage = (): JSX.Element => {
  const { summary, filters, setFilters, isLoading, isError, isEmpty, error } =
    useOverduePointDashboard(EMPTY_OVERDUE_POINT_FILTERS);

  return (
    <div data-testid="overdue-point-dashboard-page" className="overdue-point-dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Overdue Point Dashboard</h1>
        <p className="page-header__subtitle">
          Track late delivery risk by developer, release, and collaboration footprint.
        </p>
      </header>

      <StateView isLoading={isLoading} isError={isError} isEmpty={isEmpty} error={error ?? null}>
        {summary ? (
          <>
            <OverduePointFilters
              options={summary.options}
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(EMPTY_OVERDUE_POINT_FILTERS)}
            />

            <div className="kpi-grid">
              {summary.kpis.map((metric) => (
                <KpiCard key={metric.id} metric={metric} />
              ))}
            </div>

            <OverduePointCharts summary={summary} />
            <OverduePointGrid rows={summary.rows} />
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default OverduePointDashboardPage;
