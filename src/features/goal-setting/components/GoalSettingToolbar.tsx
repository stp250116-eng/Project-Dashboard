/**
 * GoalSettingToolbar component — year selector, search, and sort controls.
 * REDESIGNED: Better layout and KendoReact integration with inline styling.
 */

import React from 'react';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { Button, ButtonGroup } from '@progress/kendo-react-buttons';

interface GoalSettingToolbarProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sortBy: 'score' | 'name' | 'team') => void;
  sortBy?: 'score' | 'name' | 'team';
  searchText?: string;
  onSearchChange?: (text: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { text: `${CURRENT_YEAR} (Current)`, value: CURRENT_YEAR },
  { text: `${CURRENT_YEAR - 1}`, value: CURRENT_YEAR - 1 },
  { text: `${CURRENT_YEAR - 2}`, value: CURRENT_YEAR - 2 },
  { text: `${CURRENT_YEAR + 1}`, value: CURRENT_YEAR + 1 },
];

export const GoalSettingToolbar: React.FC<GoalSettingToolbarProps> = ({
  selectedYear,
  onYearChange,
  onFilterChange,
  onSortChange,
  sortBy = 'score',
  searchText = '',
  onSearchChange,
}) => {
  const handleYearChange = (event: DropDownListChangeEvent) => {
    if (event.value !== undefined) {
      onYearChange(event.value);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '24px',
        alignItems: 'flex-start',
        padding: '20px',
        backgroundColor: 'var(--color-surface, #f5f5f5)',
        borderRadius: '4px',
        marginBottom: '24px',
        border: '1px solid var(--color-border, #e0e0e0)',
      }}
    >
      {/* Year Selector */}
      <div>
        <label
          htmlFor="year-selector"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--color-text-secondary, #666)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Year
        </label>
        <DropDownList
          id="year-selector"
          data={YEAR_OPTIONS}
          value={selectedYear}
          onChange={handleYearChange}
          dataItemKey="value"
          textField="text"
          style={{
            width: '100%',
          }}
        />
      </div>

      {/* Search Input */}
      <div>
        <label
          htmlFor="search-input"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--color-text-secondary, #666)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Search
        </label>
        <input
          id="search-input"
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Developer name, team, or role..."
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--color-border, #e0e0e0)',
            borderRadius: '4px',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Sort Options */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--color-text-secondary, #666)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Sort By
        </label>
        <ButtonGroup style={{ width: '100%', display: 'flex', gap: '4px' }}>
          <Button
            togglable={true}
            selected={sortBy === 'score'}
            onClick={() => onSortChange?.('score')}
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '8px 4px',
            }}
          >
            Score
          </Button>
          <Button
            togglable={true}
            selected={sortBy === 'name'}
            onClick={() => onSortChange?.('name')}
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '8px 4px',
            }}
          >
            Name
          </Button>
          <Button
            togglable={true}
            selected={sortBy === 'team'}
            onClick={() => onSortChange?.('team')}
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '8px 4px',
            }}
          >
            Team
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
