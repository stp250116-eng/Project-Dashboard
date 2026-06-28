import { DataChart } from '@shared/components';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

interface DeveloperTrainingChartsProps {
  summary: DeveloperTrainingSummary;
}

export const DeveloperTrainingCharts = ({ summary }: DeveloperTrainingChartsProps): JSX.Element => (
  <div className="panel-grid">
    <DataChart
      title="Training Type Distribution"
      data={summary.trainingTypeDistribution}
      type="pie"
      ariaLabel="Training type distribution"
    />
    <DataChart
      title="Training Hours by Developer"
      data={summary.hoursByDeveloper}
      type="bar"
      ariaLabel="Training hours by developer"
    />
  </div>
);
