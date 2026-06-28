import { KpiCard } from '@shared/components';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

interface DeveloperTrainingKpiViewProps {
  summary: DeveloperTrainingSummary;
}

export const DeveloperTrainingKpiView = ({ summary }: DeveloperTrainingKpiViewProps): JSX.Element => (
  <section className="kpi-grid" aria-label="Training highlights">
    {summary.kpis.map((metric) => (
      <KpiCard key={metric.id} metric={metric} wide={metric.id === 'top-training-participant'} />
    ))}
  </section>
);
