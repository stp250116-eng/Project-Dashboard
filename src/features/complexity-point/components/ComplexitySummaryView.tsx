import { DataGrid, KpiCard } from '@shared/components';
import type { ComplexitySummary } from '../models/complexityModels';

interface ComplexitySummaryViewProps {
  summary: ComplexitySummary;
}

export const ComplexitySummaryView = ({ summary }: ComplexitySummaryViewProps): JSX.Element => (
  <div>
    <section className="kpi-grid" aria-label="Complexity point summary">
      {summary.kpis.map((metric) => (
        <KpiCard key={metric.id} metric={metric} wide={metric.id === 'top-contributor'} />
      ))}
    </section>

    <section className="surface" aria-label="Complexity by employee">
      <h2 className="surface__title">Complexity Point Summary</h2>
      <DataGrid
        data={summary.rows}
        columns={[
          { field: 'assignee', title: 'Developer' },
          { field: 'complexity', title: 'Complexity' },
        ]}
        ariaLabel="Complexity point summary table"
        sortable
      />
    </section>
  </div>
);
