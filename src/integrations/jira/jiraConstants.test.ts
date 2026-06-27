import { JIRA_ENDPOINTS, JIRA_QUERY_KEYS, JIRA_DEFECT_FILTER } from './jiraConstants';

describe('jiraConstants', () => {
  it('builds platform and agile endpoint paths', () => {
    expect(JIRA_ENDPOINTS.project('OO')).toBe('/rest/api/3/project/OO');
    expect(JIRA_ENDPOINTS.filter(JIRA_DEFECT_FILTER.id)).toBe('/rest/api/3/filter/11471');
    expect(JIRA_ENDPOINTS.filter('CUSTOM')).toBe('/rest/api/3/filter/CUSTOM');
    expect(JIRA_ENDPOINTS.sprints(5)).toBe('/rest/agile/1.0/board/5/sprint');
    expect(JIRA_ENDPOINTS.sprintIssues(9)).toBe('/rest/agile/1.0/sprint/9/issue');
  });

  it('builds stable React Query cache keys', () => {
    expect(JIRA_QUERY_KEYS.issues('project = DASH')).toEqual([
      'jira',
      'issues',
      'project = DASH',
    ]);
    expect(JIRA_QUERY_KEYS.boards()).toEqual(['jira', 'boards']);
    expect(JIRA_QUERY_KEYS.sprints(3)).toEqual(['jira', 'sprints', 3]);
    expect(JIRA_QUERY_KEYS.releases('OO')).toEqual(['jira', 'releases', 'OO']);
    expect(JIRA_QUERY_KEYS.defects(11471)).toEqual(['jira', 'defects', 11471]);
    expect(JIRA_QUERY_KEYS.all).toEqual(['jira']);
  });
});
