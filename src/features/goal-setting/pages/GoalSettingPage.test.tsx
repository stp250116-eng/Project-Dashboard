/**
 * Unit tests for GoalSettingPage
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalSettingPage } from './GoalSettingPage';
import * as hooks from '../hooks/useGoalSetting';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../hooks/useGoalSetting');

const mockUseGoalSetting = hooks.useGoalSetting as jest.MockedFunction<typeof hooks.useGoalSetting>;

const mockDevelopers = [
  {
    developerId: 'dev-1',
    name: 'Alice Johnson',
    role: 'Senior Engineer',
    team: 'Platform',
    goals: {
      training: { type: 'training' as const, actual: 40, target: 40, status: 'on-track' as const, subScore: 100 },
      defectLow: { type: 'defectLow' as const, actual: 2, threshold: 5, status: 'on-track' as const, subScore: 100 },
      defectHigh: { type: 'defectHigh' as const, actual: 0, threshold: 2, status: 'on-track' as const, subScore: 100 },
      complexity: { type: 'complexity' as const, actual: 65, target: 60, status: 'on-track' as const, subScore: 108 },
      overdue: { type: 'overdue' as const, actual: 1, threshold: 3, status: 'on-track' as const, subScore: 100 },
    },
    overallScore: 101.6,
    rank: 1,
  },
  {
    developerId: 'dev-2',
    name: 'Bob Smith',
    role: 'Engineer',
    team: 'Backend',
    goals: {
      training: { type: 'training' as const, actual: 30, target: 40, status: 'at-risk' as const, subScore: 75 },
      defectLow: { type: 'defectLow' as const, actual: 4, threshold: 5, status: 'on-track' as const, subScore: 100 },
      defectHigh: { type: 'defectHigh' as const, actual: 1, threshold: 2, status: 'on-track' as const, subScore: 100 },
      complexity: { type: 'complexity' as const, actual: 45, target: 60, status: 'at-risk' as const, subScore: 75 },
      overdue: { type: 'overdue' as const, actual: 2, threshold: 3, status: 'on-track' as const, subScore: 100 },
    },
    overallScore: 90,
    rank: 2,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('GoalSettingPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header', () => {
    mockUseGoalSetting.mockReturnValue({
      data: mockDevelopers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      isPlaceholderData: false,
      status: 'success' as const,
    } as any);

    render(<GoalSettingPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Developer Goal Setting')).toBeInTheDocument();
    expect(screen.getByText(/Track and manage annual developer goals/)).toBeInTheDocument();
  });

  it('displays goal setting toolbar', () => {
    mockUseGoalSetting.mockReturnValue({
      data: mockDevelopers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      isPlaceholderData: false,
      status: 'success' as const,
    } as any);

    render(<GoalSettingPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseGoalSetting.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isPending: true,
      isSuccess: false,
      isFetching: true,
      isPlaceholderData: false,
      status: 'pending' as const,
    } as any);

    render(<GoalSettingPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading developer goals...')).toBeInTheDocument();
  });

  it('filters developers by search text', async () => {
    mockUseGoalSetting.mockReturnValue({
      data: mockDevelopers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      isPlaceholderData: false,
      status: 'success' as const,
    } as any);

    render(<GoalSettingPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Developer name, team, or role...');
    await userEvent.type(searchInput, 'Alice');

    // After filtering, should show filtered results
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('shows no results message when search returns empty', async () => {
    mockUseGoalSetting.mockReturnValue({
      data: mockDevelopers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      isPlaceholderData: false,
      status: 'success' as const,
    } as any);

    render(<GoalSettingPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Developer name, team, or role...');
    await userEvent.type(searchInput, 'NonExistent');

    await waitFor(() => {
      expect(screen.getByText('No goal data available.')).toBeInTheDocument();
    });
  });
});
