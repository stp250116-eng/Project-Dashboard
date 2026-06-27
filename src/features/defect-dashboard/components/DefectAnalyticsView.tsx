import { KpiCard, DataChart } from '@shared/components';
import { DefectTrendChart } from './DefectTrendChart';
import type { DefectAnalytics } from '../models/defectModels';

interface DefectAnalyticsViewProps {
  analytics: DefectAnalytics;
}

/** Composes the KPI cards, trend, and analytics charts for the dashboard body. */
export const DefectAnalyticsView = ({
  analytics,
}: DefectAnalyticsViewProps): JSX.Element => {
  return (
    <>
      <div className="kpi-grid">
        {analytics.kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} wide={metric.id === 'top-developer'} />
        ))}
      </div>

      <section className="surface" aria-label="Defect trend by release">
        <DefectTrendChart trend={analytics.trend} title="Defect Trend by Release — by Developer" />
      </section>

      <div className="panel-grid">
        <section className="surface" aria-label="Defects by severity">
          <DataChart title="Defects by Severity" data={analytics.bySeverity} type="column" />
        </section>
        <section className="surface" aria-label="Defect distribution">
          <DataChart
            title="Distribution by Developer"
            data={analytics.distribution}
            type="donut"
          />
        </section>
        <section className="surface" aria-label="Top developers with most defects">
          <DataChart
            title="Top Developers with Most Defects"
            data={analytics.topOwners}
            type="bar"
          />
        </section>
        <section className="surface" aria-label="Root cause distribution">
          <DataChart
            title="Root Cause Distribution"
            data={analytics.rootCauseDistribution}
            type="donut"
          />
        </section>
      </div>
    </>
  );
};
