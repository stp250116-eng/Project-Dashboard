import { Grid, GridColumn } from '@progress/kendo-react-grid';
import type { OverduePointDeveloperRow } from '../models/overduePointModels';

interface OverduePointGridProps {
  rows: OverduePointDeveloperRow[];
}

export const OverduePointGrid = ({ rows }: OverduePointGridProps): JSX.Element => (
  <section className="surface" aria-label="Overdue point dashboard grid">
    <h2 className="surface__title">Developer Overdue Points</h2>
    <div className="data-grid">
      <Grid
        data={rows}
        sortable
        pageable
        groupable
        style={{ minHeight: 360 }}
      >
        <GridColumn field="developer" title="Developer" width={260} />
        <GridColumn field="overduePoints" title="Overdue Point" width={180} />
        <GridColumn
          field="childIssues"
          title="Details"
          cell={(props) => {
            const row = props.dataItem as OverduePointDeveloperRow;
            return (
              <td>
                <details>
                  <summary>{`${row.childIssues.length} issues`}</summary>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Parent Issue</th>
                        <th>Summary</th>
                        <th>Release</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.childIssues.map((issue) => (
                        <tr key={issue.parentIssueId}>
                          <td>{issue.parentIssueId}</td>
                          <td>{issue.parentIssueSummary}</td>
                          <td>{issue.releaseVersion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </td>
            );
          }}
        />
      </Grid>
    </div>
  </section>
);
