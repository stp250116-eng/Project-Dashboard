import { DataChart } from '@shared/components';
import type { OverduePointSummary } from '../models/overduePointModels';

interface OverduePointChartsProps {
  summary: OverduePointSummary;
}

export const OverduePointCharts = ({ summary }: OverduePointChartsProps): JSX.Element => (
  <div className="panel-grid">
    <section className="surface" aria-label="Top developers by overdue point">
      <DataChart
        title="Top Developers by Overdue Point"
        data={summary.byDeveloper}
        type="bar"
      />
    </section>
    <section className="surface" aria-label="Delayed issues by release version">
      <DataChart
        title="Delayed Issues by Release Version"
        data={summary.byRelease}
        type="pie"
      />
    </section>
  </div>
);
