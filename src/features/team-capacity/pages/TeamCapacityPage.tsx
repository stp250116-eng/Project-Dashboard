import { useTeamCapacity } from '../hooks/useTeamCapacity';
import { DataGrid, DataChart, StateView, type DataGridColumn } from '@shared/components';

const columns: DataGridColumn[] = [
  { field: 'name', title: 'Member' },
  { field: 'assignedPoints', title: 'Assigned', width: 130 },
  { field: 'capacityPoints', title: 'Capacity', width: 130 },
  { field: 'utilization', title: 'Utilization %', width: 150 },
];

/** Team velocity, workload, and capacity planning. */
const TeamCapacityPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useTeamCapacity();

  const workload = (data ?? []).map((member) => ({
    category: member.name,
    value: member.assignedPoints,
  }));

  return (
    <div data-testid="team-capacity-page">
      <header className="page-header">
        <h1 className="page-header__title">Team Capacity</h1>
        <p className="page-header__subtitle">Velocity, workload, and capacity planning</p>
      </header>

      <StateView
        isLoading={isLoading}
        isError={isError}
        error={error ?? null}
        isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      >
        {data ? (
          <div className="panel-grid">
            <section className="surface" aria-label="Workload">
              <DataChart title="Workload by Member" data={workload} type="column" />
            </section>
            <section className="surface" aria-label="Capacity">
              <DataGrid data={data} columns={columns} ariaLabel="Team capacity grid" />
            </section>
          </div>
        ) : null}
      </StateView>
    </div>
  );
};

export default TeamCapacityPage;
