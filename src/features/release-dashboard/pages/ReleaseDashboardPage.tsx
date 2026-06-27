import { useReleases } from '../hooks/useReleases';
import { DataGrid, StateView, type DataGridColumn } from '@shared/components';

const columns: DataGridColumn[] = [
  { field: 'name', title: 'Release', width: 140 },
  { field: 'status', title: 'Status', width: 160 },
  { field: 'readiness', title: 'Readiness %', width: 140 },
  { field: 'targetDate', title: 'Target Date' },
];

/** Release readiness and status overview. */
const ReleaseDashboardPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useReleases();

  return (
    <div data-testid="release-dashboard-page">
      <header className="page-header">
        <h1 className="page-header__title">Release Dashboard</h1>
        <p className="page-header__subtitle">Release readiness and status</p>
      </header>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
        isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      >
        {data ? (
          <section className="surface" aria-label="Releases">
            <DataGrid data={data} columns={columns} ariaLabel="Releases grid" />
          </section>
        ) : null}
      </StateView>
    </div>
  );
};

export default ReleaseDashboardPage;
