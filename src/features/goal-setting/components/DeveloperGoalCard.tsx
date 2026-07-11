/**
 * DeveloperGoalCard component — displays a single developer's goals and ranking.
 * Shows name, overall score, rank, and individual goal status indicators.
 * REDESIGNED: Uses KendoReact components with card-based layout for better product visibility.
 */

import React from 'react';
import { Card, CardBody, CardHeader } from '@progress/kendo-react-layout';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { Chip } from '@progress/kendo-react-buttons';
import { getGoalLabel, getGoalDefinition } from '../services/goalDefinitions';
import { LOW_DEFECT_TOOLTIP, HIGH_DEFECT_TOOLTIP, COMPLEXITY_TOOLTIP, OVERDUE_TOOLTIP } from '../constants/defectTooltips';
import { formatTrainingDuration } from '@features/developer-training-dashboard/services/developerTrainingAnalytics';
import type { DeveloperGoalData } from '../../models/goalModels';

interface DeveloperGoalCardProps {
  developer: DeveloperGoalData;
  onSelectDeveloper?: (developerId: string) => void;
}

export const DeveloperGoalCard: React.FC<DeveloperGoalCardProps> = ({
  developer,
  onSelectDeveloper,
}) => {
  const getStatusClass = (status: 'on-track' | 'at-risk' | 'off-track'): string => {
    return `status-${status}`;
  };

  const getRankBadgeClass = (rank: number): string => {
    if (rank === 1) return 'rank-badge--first';
    if (rank === 2) return 'rank-badge--second';
    if (rank === 3) return 'rank-badge--third';
    return 'rank-badge--other';
  };

  // Count goals by status for quick summary
  const goalSummary = Object.values(developer.goals).reduce(
    (acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card
      className="developer-goal-card"
      onClick={() => onSelectDeveloper?.(developer.developerId)}
      style={{ cursor: 'pointer', height: '100%' }}
    >
      <CardHeader className="card-header" style={{ padding: '16px', borderBottom: '1px solid var(--color-border, #e0e0e0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary, #333)' }}>
              {developer.name}
            </h3>
            <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-text-secondary, #666)' }}>
              {developer.role} • {developer.team}
            </p>
          </div>
          <div
            className={`rank-badge ${getRankBadgeClass(developer.rank)}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontWeight: 'bold',
              fontSize: '16px',
              backgroundColor:
                developer.rank === 1
                  ? '#ffd700'
                  : developer.rank === 2
                    ? '#c0c0c0'
                    : developer.rank === 3
                      ? '#cd7f32'
                      : developer.rank === 0
                        ? 'var(--color-surface, #f5f5f5)'
                        : 'var(--color-surface, #f5f5f5)',
              color: developer.rank > 0 && developer.rank <= 3 ? '#fff' : 'var(--color-text-primary, #333)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {developer.rank > 0 ? `#${developer.rank}` : '—'}
          </div>
        </div>
      </CardHeader>

      <CardBody style={{ padding: '16px' }}>
        {/* Overall Score Section */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary, #666)' }}>
              Overall Score
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color:
                  developer.overallScore >= 80
                    ? 'var(--color-success, #4caf50)'
                    : developer.overallScore >= 60
                      ? 'var(--color-warning, #ffa500)'
                      : 'var(--color-error, #f44336)',
              }}
            >
              {developer.overallScore}/100
            </span>
          </div>
          <ProgressBar
            value={developer.overallScore}
            max={100}
            style={{
              height: '15px',
              backgroundColor: 'var(--color-surface, #f5f5f5)',
            }}
          />
        </div>

        {/* Goal Status Summary */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {goalSummary['on-track'] > 0 && (
            <Chip style={{ backgroundColor: 'var(--color-success, #4caf50)', color: '#fff' }}>
              {goalSummary['on-track']} On Track
            </Chip>
          )}
          {goalSummary['at-risk'] > 0 && (
            <Chip style={{ backgroundColor: 'var(--color-warning, #ffa500)', color: '#fff' }}>
              {goalSummary['at-risk']} At Risk
            </Chip>
          )}
          {goalSummary['off-track'] > 0 && (
            <Chip style={{ backgroundColor: 'var(--color-error, #f44336)', color: '#fff' }}>
              {goalSummary['off-track']} Off Track
            </Chip>
          )}
        </div>

        {/* Individual Goals */}
        <div style={{ borderTop: '1px solid var(--color-border, #e0e0e0)', paddingTop: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary, #666)' }}>
            Goal Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.values(developer.goals).map((goal) => (
              <div
                key={goal.type}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: `var(--color-${getStatusClass(goal.status)}, #f5f5f5)`,
                  border: `1px solid var(--color-border, #e0e0e0)`,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: 'var(--color-text-primary, #333)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{getGoalLabel(goal.type)}</span>
                  {(goal.type === 'defectLow') && (
                    <span
                      title={LOW_DEFECT_TOOLTIP}
                      aria-label="Low level defect rate details"
                      style={{ fontSize: '11px', color: 'var(--color-text-secondary, #666)', cursor: 'help' }}
                    >
                      ⓘ
                    </span>
                  )}
                  {(goal.type === 'defectHigh') && (
                    <span
                      title={HIGH_DEFECT_TOOLTIP}
                      aria-label="High level defect rate details"
                      style={{ fontSize: '11px', color: 'var(--color-text-secondary, #666)', cursor: 'help' }}
                    >
                      ⓘ
                    </span>
                  )}
                  {(goal.type === 'complexity') && (
                    <span
                      title={COMPLEXITY_TOOLTIP}
                      aria-label="Complexity points guidance"
                      style={{ fontSize: '11px', color: 'var(--color-text-secondary, #666)', cursor: 'help' }}
                    >
                      ⓘ
                    </span>
                  )}
                  {(goal.type === 'overdue') && (
                    <span
                      title={OVERDUE_TOOLTIP}
                      aria-label="Overdue ratio guidance"
                      style={{ fontSize: '11px', color: 'var(--color-text-secondary, #666)', cursor: 'help' }}
                    >
                      ⓘ
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor:
                          goal.status === 'on-track'
                            ? 'var(--color-success, #4caf50)'
                            : goal.status === 'at-risk'
                              ? 'var(--color-warning, #ffa500)'
                              : 'var(--color-error, #f44336)',
                        color: '#fff',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {goal.status}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary, #333)' }}>
                      {(() => {
                        // Format display per goal type
                        if (goal.type === 'training') {
                          const secs = (developer as DeveloperGoalData).trainingSeconds ?? Math.round(goal.actual * 3600);
                          return `${formatTrainingDuration(secs)} / ${goal.target} hrs`;
                        }
                        if (goal.type === 'complexity') {
                          return `${goal.actual}/${goal.target} pts`;
                        }
                        if (goal.type === 'defectLow' || goal.type === 'defectHigh' || goal.type === 'overdue') {
                          const unit = '%';
                          const threshold = goal.threshold ?? '-';
                          return `${(goal.actual as number).toFixed(1)}${unit} / ${threshold}${unit}`;
                        }
                        return `${goal.actual}`;
                      })()}
                    </span>
                    {/* <span style={{ fontSize: '10px', color: 'var(--color-text-secondary, #666)', marginLeft: 'auto' }}>
                      {goal.subScore}/100
                    </span> */}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
