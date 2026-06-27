import { useJiraOverview } from '../hooks/useJiraOverview';
import { DataGrid, DataChart, KpiCard, StateView, type DataGridColumn } from '@shared/components';

const columns: DataGridColumn[] = [
  { field: 'key', title: 'Key', width: 120 },
  { field: 'summary', title: 'Summary' },
  { field: 'status', title: 'Status', width: 140 },
  { field: 'assignee', title: 'Assignee', width: 160 },
  { field: 'priority', title: 'Priority', width: 120 },
];

/** Jira Overview page: open/closed counts, status breakdown, issue grid. */
const JiraOverviewPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useJiraOverview();

  return (
    <div data-testid="jira-overview-page">
      <header className="page-header">
        <h1 className="page-header__title">Jira Overview</h1>
        <p className="page-header__subtitle">Open, closed, and assigned issues by status</p>
      </header>

      <StateView isLoading={isLoading} isError={isError} error={error ?? null}>
        {data ? (
          <>
            <div className="kpi-grid">
              <KpiCard metric={{ id: 'open', label: 'Open Issues', value: data.openCount }} />
              <KpiCard metric={{ id: 'closed', label: 'Closed Issues', value: data.closedCount }} />
            </div>
            <div className="panel-grid">
              <section className="surface" aria-label="Status breakdown">
                <DataChart title="Status Breakdown" data={data.statusBreakdown} />
              </section>
              <section className="surface" aria-label="Issues">
                <DataGrid data={data.issues} columns={columns} ariaLabel="Jira issues grid" pageable />
              </section>
            </div>
          </>
        ) : null}
      </StateView>
    </div>
  );
};

export default JiraOverviewPage;
