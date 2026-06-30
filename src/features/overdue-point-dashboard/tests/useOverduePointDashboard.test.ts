import { renderHook } from '@testing-library/react';
import { useJiraOverdueIssues } from '@integrations/jira';
import { useOverduePointDashboard } from '../hooks/useOverduePointDashboard';
import { EMPTY_OVERDUE_POINT_FILTERS } from '../models/overduePointModels';

jest.mock('@integrations/jira', () => ({
  useJiraOverdueIssues: jest.fn(),
}));

describe('useOverduePointDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty state values when no data is loaded', () => {
    jest.mocked(useJiraOverdueIssues).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as never);

    const { result } = renderHook(() => useOverduePointDashboard(EMPTY_OVERDUE_POINT_FILTERS));

    expect(result.current.summary).toBeUndefined();
    expect(result.current.analytics).toBeUndefined();
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.filters).toEqual(EMPTY_OVERDUE_POINT_FILTERS);
  });

  it('maps raw Jira issues into summary and analytics when data exists', () => {
    jest.mocked(useJiraOverdueIssues).mockReturnValue({
      data: [
        {
          fields: {
            assignee: { displayName: 'Alice' },
            parent: {
              key: 'OO-1',
              fields: { summary: 'Fix regression' },
            },
            fixVersions: [{ name: 'v1.0' }],
          },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    } as never);

    const { result } = renderHook(() => useOverduePointDashboard(EMPTY_OVERDUE_POINT_FILTERS));

    expect(result.current.summary?.rows[0]).toMatchObject({
      developer: 'Alice',
      overduePoints: 1,
    });
    expect(result.current.analytics?.topDeveloper.value).toBe('Alice');
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.filters).toEqual(EMPTY_OVERDUE_POINT_FILTERS);
  });
});
