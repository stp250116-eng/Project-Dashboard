import { KpiCard } from '@shared/components';
import type { OverduePointAnalytics } from '../models/overduePointModels';

interface OverduePointAnalyticsViewProps {
  analytics: OverduePointAnalytics;
}

export const OverduePointAnalyticsView = ({ analytics }: OverduePointAnalyticsViewProps): JSX.Element => (
  <section className="surface" aria-label="Overdue point analytics">
    <h2 className="surface__title">Overdue Point Analytics</h2>
    <div className="kpi-grid">
      <KpiCard metric={analytics.topDeveloper} wide />
      <KpiCard metric={analytics.topRelease} />
      <KpiCard metric={analytics.highestCollaborationRisk} />
    </div>
  </section>
);
