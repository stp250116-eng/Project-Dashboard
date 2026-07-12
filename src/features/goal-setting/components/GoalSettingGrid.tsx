/**
 * GoalSettingGrid component — KendoReact Grid for displaying developers with goals.
 * Provides sorting, filtering, and pagination out of the box.
 */

import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, GridColumn } from '@progress/kendo-react-grid';
// Chip not used; keep imports minimal
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { getGoalLabel } from '../services/goalDefinitions';
import type { DeveloperGoalData, DeveloperGoal } from '../models/goalModels';

interface GoalSettingGridProps {
  developers: DeveloperGoalData[];
  isLoading?: boolean;
  onRowClick?: (developerId: string) => void;
}

interface GridState {
  skip: number;
  take: number;
  sort: { field: string; dir: 'asc' | 'desc' }[];
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

  const handlePageChange = (e: any) => {
    setGridState((prev) => ({ ...prev, skip: e.skip, take: e.take }));
  };

  const handleSortChange = (e: any) => {
    setGridState((prev) => ({ ...prev, sort: (e.sort ?? []) as { field: string; dir: 'asc' | 'desc' }[] }));
  };

  const paginatedData = developers.slice(gridState.skip, gridState.skip + gridState.take);

  const ScoreCell = (props: any) => {
    const score = props.dataItem.overallScore;
    return (
      <td className="score-cell">
        <span className="score-value">{score}</span>
        <div className="progress-wrapper"><ProgressBar value={score} max={100} /></div>
      </td>
    );
  };

  const RankCell = (props: any) => {
    const rank = props.dataItem.rank;
    return (
      <td className="rank-cell">
        <span className={`rank-badge rank-badge--${rank <= 3 ? 'top-three' : 'other'}`}>
          {rank > 0 ? `#${rank}` : '—'}
        </span>
      </td>
    );
  };

  const NameCell = (props: any) => {
    const name = props.dataItem.name;
    const id = props.dataItem.developerId;
    return (
      <td>
        <span data-developer-id={id} onClick={() => onRowClick?.(id)} className="developer-name">
          {name}
        </span>
      </td>
    );
  };

  return (
    <div className="goal-setting-grid">
        {/** Cast to any to work around Kendo's Grid prop types that don't include some runtime props we use. */}
        <Grid
          {...({
            data: paginatedData,
            total: developers.length,
            skip: gridState.skip,
            take: gridState.take,
            onPageChange: handlePageChange,
            sortable: true,
            sort: gridState.sort,
            onSortChange: handleSortChange,
            pageable: { pageSizes: [5, 10, 20], buttonCount: 5, info: true, type: 'numeric' },
            scrollable: 'scrollable',
            loading: isLoading,
            onRowClick: (e: any) => onRowClick?.(e.dataItem.developerId),
            rowHeight: 80,
            className: 'goal-grid',
          } as any)}
        >
        <GridColumn field="rank" title="Rank" width="80px" cell={RankCell} />
        <GridColumn field="name" title="Developer" width="180px" sortable={true} cell={NameCell} />
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
              <td className="goals-display">
                {(
                  Object.values(props.dataItem.goals) as DeveloperGoal[]
                ).map((goal) => (
                  <div key={goal.type} className={`goal-badge status-${goal.status}`}>
                    <span className="goal-type">{getGoalLabel(goal.type).substring(0, 10)}</span>
                    <span className={`goal-status status-${goal.status}`}>{goal.status}</span>
                  </div>
                ))}
              </td>
            )}
          />
      </Grid>
    </div>
  );
};
