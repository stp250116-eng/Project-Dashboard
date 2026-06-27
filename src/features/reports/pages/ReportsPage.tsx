import { useReports } from '../hooks/useReports';
import { exportReport } from '../services/exportService';
import { DataGrid, StateView, type DataGridColumn } from '@shared/components';
import { appConfig } from '@shared/constants/appConfig';

const columns: DataGridColumn[] = [
  { field: 'name', title: 'Report' },
  { field: 'category', title: 'Category', width: 150 },
  { field: 'format', title: 'Format', width: 120 },
  { field: 'lastRun', title: 'Last Run', width: 140 },
];

/** Reports catalog with Excel/PDF export actions. */
const ReportsPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useReports();

  if (!appConfig.featureFlags.reports) {
    return (
      <div data-testid="reports-page">
        <header className="page-header">
          <h1 className="page-header__title">Reports</h1>
        </header>
        <div className="state-view state-view--empty">Reports are disabled in this environment.</div>
      </div>
    );
  }

  return (
    <div data-testid="reports-page">
      <header className="page-header">
        <h1 className="page-header__title">Reports</h1>
        <p className="page-header__subtitle">Generate and export Excel / PDF reports</p>
      </header>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
        isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      >
        {data ? (
          <>
            <div className="filter-panel__actions" style={{ justifyContent: 'flex-start' }}>
              <button
                type="button"
                className="filter-panel__apply"
                onClick={() => exportReport(data[0], 'excel')}
              >
                Export Excel
              </button>
              <button
                type="button"
                className="filter-panel__reset"
                onClick={() => exportReport(data[0], 'pdf')}
              >
                Export PDF
              </button>
            </div>
            <section className="surface" aria-label="Reports">
              <DataGrid data={data} columns={columns} ariaLabel="Reports grid" />
            </section>
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default ReportsPage;
