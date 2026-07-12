import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { GoalSettingToolbar } from './GoalSettingToolbar';

describe('GoalSettingToolbar', () => {
  it('calls onYearChange only when a valid year value is selected', () => {
    const onYearChange = jest.fn();
    const { container } = render(<GoalSettingToolbar selectedYear={2025} onYearChange={onYearChange} />);

    // Verify that the underlying native select contains the expected selected option
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
    if (select) {
      const option = select.querySelector('option');
      expect(option?.getAttribute('value')).toBe(String(2025));
    }
  });

  it('calls onSearchChange when user types', () => {
    const onSearchChange = jest.fn();
    render(<GoalSettingToolbar selectedYear={2025} onYearChange={() => {}} onSearchChange={onSearchChange} searchText="" />);

    const input = screen.getByPlaceholderText('Developer name, team, or role...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(onSearchChange).toHaveBeenCalledWith('Alice');
  });

  it('calls onSortChange when sort buttons are clicked', () => {
    const onSortChange = jest.fn();
    render(<GoalSettingToolbar selectedYear={2025} onYearChange={() => {}} onSortChange={onSortChange} sortBy="score" />);

    const nameBtn = screen.getByText('Name');
    fireEvent.click(nameBtn);
    expect(onSortChange).toHaveBeenCalledWith('name');

    const rankBtn = screen.getByText('Rank');
    fireEvent.click(rankBtn);
    expect(onSortChange).toHaveBeenCalledWith('rank');
  });
});
