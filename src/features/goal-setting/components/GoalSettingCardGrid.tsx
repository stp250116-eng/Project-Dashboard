/**
 * GoalSettingCardGrid — displays developers as KendoReact cards in a grid layout.
 * Provides better visual representation of goals compared to traditional grid.
 * Shows developer rank, score, and goal status at a glance.
 */

import React from 'react';
import { DeveloperGoalCard } from './DeveloperGoalCard';
import type { DeveloperGoalData } from '../models/goalModels';

interface GoalSettingCardGridProps {
  developers: DeveloperGoalData[];
  isLoading?: boolean;
  error?: string | null;
  onSelectDeveloper?: (developerId: string) => void;
}

export const GoalSettingCardGrid: React.FC<GoalSettingCardGridProps> = ({
  developers,
  isLoading = false,
  error = null,
  onSelectDeveloper,
}) => {
  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-error)',
          backgroundColor: 'var(--color-error-bg)',
          borderRadius: '4px',
          marginTop: '16px',
        }}
      >
        <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>Error loading goal data</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p style={{ margin: '0', fontSize: '14px' }}>Loading developer goals...</p>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '4px',
          marginTop: '16px',
        }}
      >
        <p style={{ margin: '0', fontSize: '14px' }}>No goal data available.</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        marginTop: '16px',
      }}
    >
      {developers.map((developer) => (
        <DeveloperGoalCard
          key={developer.developerId}
          developer={developer}
          onSelectDeveloper={onSelectDeveloper}
        />
      ))}
    </div>
  );
};
