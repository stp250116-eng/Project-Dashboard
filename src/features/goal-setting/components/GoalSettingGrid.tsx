/**
 * GoalSettingGrid component — KendoReact Grid for displaying developers with goals.
 * Provides sorting, filtering, and pagination out of the box.
 */

import React from 'react';
import { Grid, GridColumn, GridPageChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import { Chip } from '@progress/kendo-react-buttons';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { getGoalLabel } from '../services/goalDefinitions';
import type { DeveloperGoalData } from '../../models/goalModels';

interface GoalSettingGridProps {
  developers: DeveloperGoalData[];
  isLoading?: boolean;
  onRowClick?: (developerId: string) => void;
}

interface GridState {
  skip: number;
  take: number;
  sort: Array<{ field: string; dir: 'asc' | 'desc' }>;
}

export const GoalSettingGrid: React.FC<GoalSettingGridProps> = ({
  developers,
  isLoading = false,
  onRowClick,
}) => {
  const [gridState, setGridState] = React.useState<GridState>({
    skip: 0,
    take: 10,
    sort: [{ field: 'rank', dir: 'asc' }],
  });

  const handlePageChange = (e: GridPageChangeEvent) => {
    setGridState((prev) => ({ ...prev, skip: e.skip, take: e.take }));
  };

  const handleSortChange = (e: GridSortChangeEvent) => {
    setGridState((prev) => ({ ...prev, sort: e.sort ?? [] }));
  };

  const paginatedData = developers.slice(gridState.skip, gridState.skip + gridState.take);

  const StatusCell = (props: any) => {
    const status = props.dataItem.status;
    const statusClass = `status-chip--${status}`;
    return <Chip className={`status-chip ${statusClass}`}>{status}</Chip>;
  };

  const ScoreCell = (props: any) => {
    const score = props.dataItem.overallScore;
    return (
      <div className="score-cell">
        <span className="score-value">{score}</span>
        <ProgressBar value={score} max={100} />
      </div>
    );
  };

  const RankCell = (props: any) => {
    const rank = props.dataItem.rank;
    return (
      <div className="rank-cell">
        <span className={`rank-badge rank-badge--${rank <= 3 ? 'top-three' : 'other'}`}>
          {rank > 0 ? `#${rank}` : '—'}
        </span>
      </div>
    );
  };

  return (
    <div className="goal-setting-grid">
      <Grid
        data={paginatedData}
        total={developers.length}
        skip={gridState.skip}
        take={gridState.take}
        onPageChange={handlePageChange}
        sortable={true}
        sort={gridState.sort}
        onSortChange={handleSortChange}
        pageable={{
          pageSize: gridState.take,
          buttonCount: 5,
          info: true,
          type: 'numeric',
        }}
        scrollable="scrollable"
        loading={isLoading}
        onRowClick={(e) => onRowClick?.(e.dataItem.developerId)}
        rowHeight={80}
        className="goal-grid"
      >
        <GridColumn field="rank" title="Rank" width="80px" cell={RankCell} />
        <GridColumn field="name" title="Developer" width="180px" sortable={true} />
        <GridColumn field="team" title="Team" width="120px" />
        <GridColumn field="role" title="Role" width="120px" sortable={true} />
        <GridColumn
          field="overallScore"
          title="Overall Score"
          width="180px"
          cell={ScoreCell}
          sortable={true}
        />
        <GridColumn
          title="Goals"
          width="350px"
          cell={(props) => (
            <div className="goals-display">
              {Object.values(props.dataItem.goals).map((goal) => (
                <div key={goal.type} className={`goal-badge status-${goal.status}`}>
                  <span className="goal-type">{getGoalLabel(goal.type).substring(0, 10)}</span>
                  <span className={`goal-status status-${goal.status}`}>{goal.status}</span>
                </div>
              ))}
            </div>
          )}
        />
      </Grid>
    </div>
  );
};
