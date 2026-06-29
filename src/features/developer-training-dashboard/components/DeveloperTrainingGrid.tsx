import { DataGrid } from '@shared/components';
import type { GridCellProps } from '@progress/kendo-react-grid';
import type { DeveloperTrainingSummary } from '../models/developerTrainingModels';
import { formatTrainingHours } from '../services/developerTrainingAnalytics';

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
        {
          field: 'totalTrainingHours',
          title: 'Total Training Hours',
          cell: (props: GridCellProps) => {
            const row = props.dataItem as { totalTrainingHours: number };
            return <td>{formatTrainingHours(row.totalTrainingHours)}</td>;
          },
        },
      ]}
      ariaLabel="Developer training summary table"
      sortable
    />
  </section>
);
