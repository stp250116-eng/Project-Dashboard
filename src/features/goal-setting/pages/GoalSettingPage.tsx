/**
 * GoalSettingPage — main page container for Goal Setting feature.
 * Manages state (year, search, sort) and displays developers with their goals.
 * REDESIGNED: Uses card grid layout for better product visibility.
 */

import React from 'react';
import { useGoalSetting } from '../hooks/useGoalSetting';
import { GoalSettingToolbar } from '../components/GoalSettingToolbar';
import { GoalSettingCardGrid } from '../components/GoalSettingCardGrid';
import './GoalSettingPage.scss';
import type { DeveloperGoalData } from '../models/goalModels';

export const GoalSettingPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [searchText, setSearchText] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'score' | 'name' | 'team'>('score');

  const { data, isLoading, error } = useGoalSetting(selectedYear);

  // Filter and sort developers
  const filteredDevelopers = React.useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (dev) =>
          dev.name.toLowerCase().includes(searchLower) ||
          dev.team.toLowerCase().includes(searchLower) ||
          dev.role.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'team':
        filtered.sort((a, b) => a.team.localeCompare(b.team));
        break;
    }

    return filtered;
  }, [data, searchText, sortBy]);

  const handleSelectDeveloper = (developerId: string) => {
    // TODO: Navigate to developer detail page or open modal
    console.log('Selected developer:', developerId);
  };

  return (
    <div className="goal-setting-page">
      <div className="page-header">
        <h1 className="page-header__title">Developer Goal Setting</h1>
        <p className="page-header__subtitle">
          Track and manage annual developer goals across training, defects, complexity, and delivery metrics.
        </p>
      </div>

      <GoalSettingToolbar
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        searchText={searchText}
        onSearchChange={setSearchText}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <GoalSettingCardGrid
        developers={filteredDevelopers}
        isLoading={isLoading}
        error={error ? error.message : null}
        onSelectDeveloper={handleSelectDeveloper}
      />
    </div>
  );
};

export default GoalSettingPage;
