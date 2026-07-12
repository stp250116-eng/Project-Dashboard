import { buildOverduePointAnalytics, buildOverduePointSummary } from '../services/overduePointAnalytics';
import { EMPTY_OVERDUE_POINT_FILTERS, type OverduePointRecord } from '../models/overduePointModels';

describe('overduePointAnalytics', () => {
  const records: OverduePointRecord[] = [
    {
      developer: 'Alice',
      parentIssueId: 'OO-1',
      parentIssueSummary: 'Fix performance regression',
      releaseVersion: 'v1.0',
    },
    {
      developer: 'Alice',
      parentIssueId: 'OO-2',
      parentIssueSummary: 'Resolve UI inconsistency',
      releaseVersion: 'v2.0',
    },
    {
      developer: 'Bob',
      parentIssueId: 'OO-1',
      parentIssueSummary: 'Fix performance regression',
      releaseVersion: 'v1.0',
    },
    {
      developer: 'Bob',
      parentIssueId: 'OO-3',
      parentIssueSummary: 'Update release notes',
      releaseVersion: 'v1.0',
    },
  ];

  it('builds a summary grouped by developer with top metrics and filter options', () => {
    const result = buildOverduePointSummary(records, EMPTY_OVERDUE_POINT_FILTERS);

    expect(result.rows).toEqual([
      {
        developer: 'Alice',
        overduePoints: 2,
        childIssues: [
          {
            parentIssueId: 'OO-1',
            parentIssueSummary: 'Fix performance regression',
            releaseVersion: 'v1.0',
          },
          {
            parentIssueId: 'OO-2',
            parentIssueSummary: 'Resolve UI inconsistency',
            releaseVersion: 'v2.0',
          },
        ],
      },
      {
        developer: 'Bob',
        overduePoints: 2,
        childIssues: [
          {
            parentIssueId: 'OO-1',
            parentIssueSummary: 'Fix performance regression',
            releaseVersion: 'v1.0',
          },
          {
            parentIssueId: 'OO-3',
            parentIssueSummary: 'Update release notes',
            releaseVersion: 'v1.0',
          },
        ],
      },
    ]);

    expect(result.options.developers).toEqual(['Alice', 'Bob']);
    expect(result.options.releaseVersions).toEqual(['v1.0', 'v2.0']);
    expect(result.kpis).toEqual([
      { id: 'total-delayed-parent-issues', label: 'Delayed Issues', value: 3 },
      { id: 'most-overdue-developer', label: 'Most Overdue Developer', value: 'Alice', unit: '2 points' },
      { id: 'most-impacted-release', label: 'Most Impacted Release', value: 'v1.0', unit: '2 issues' },
      { id: 'highest-collaboration-risk', label: 'Highest Collaboration Risk', value: 'OO-1', unit: '2 developers' },
    ]);
  });

  it('applies filters while preserving the full options list', () => {
    const result = buildOverduePointSummary(records, { developers: ['Bob'], releaseVersions: [] });

    expect(result.rows).toEqual([
      {
        developer: 'Bob',
        overduePoints: 2,
        childIssues: [
          {
            parentIssueId: 'OO-1',
            parentIssueSummary: 'Fix performance regression',
            releaseVersion: 'v1.0',
          },
          {
            parentIssueId: 'OO-3',
            parentIssueSummary: 'Update release notes',
            releaseVersion: 'v1.0',
          },
        ],
      },
    ]);

    expect(result.options.developers).toEqual(['Alice', 'Bob']);
    expect(result.options.releaseVersions).toEqual(['v1.0', 'v2.0']);
    expect(result.kpis[0].value).toBe(2);
  });

  it('builds analytics including collaboration risk and top overdue developer', () => {
    const analytics = buildOverduePointAnalytics(records, EMPTY_OVERDUE_POINT_FILTERS);

    expect(analytics.topDeveloper.label).toBe('Highest Overdue Point');
    expect(analytics.topDeveloper.value).toBe('Alice');
    expect(analytics.topDeveloper.unit).toBe('2 points');
    expect(analytics.topRelease.label).toBe('Most Delayed Release');
    expect(analytics.topRelease.value).toBe('v1.0');
    expect(analytics.highestCollaborationRisk.label).toBe('Highest Collaboration Risk');
    expect(analytics.highestCollaborationRisk.unit).toBe('2 developers');
  });
});
