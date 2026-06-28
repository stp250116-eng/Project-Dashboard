import { DataGrid } from '@shared/components';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';

interface DeveloperTrainingGridProps {
  summary: DeveloperTrainingSummary;
}

export const DeveloperTrainingGrid = ({ summary }: DeveloperTrainingGridProps): JSX.Element => (
  <section className="surface" aria-label="Developer training summary" style={{ marginTop: '10px' }}>
    <h2 className="surface__title">Training Hours by Developer</h2>
    <DataGrid
      data={summary.rows}
      columns={[
        { field: 'developer', title: 'Developer', width: 240 },
        { field: 'totalTrainingHours', title: 'Total Training Hours'},
      ]}
      ariaLabel="Developer training summary table"
      sortable
    />
  </section>
);
