import { JIRA_ENDPOINTS, JIRA_DEFECT_FILTER } from './jiraConstants';
import { jiraSearchFixture } from '../../../test/fixtures/jiraIssues';
import { jiraDefectsFixture } from '../../../test/fixtures/jiraDefects';

const mockGet = jest.fn();

// Mock the API-client factory so `jiraApi` talks to a controllable fake client
// instead of the network. The mapper layer runs for real.
jest.mock('@shared/api', () => ({
  createApiClient: () => ({ get: mockGet }),
}));

import { jiraApi } from './jiraApi';

describe('jiraApi', () => {
  beforeEach(() => mockGet.mockReset());

  it('searches issues via JQL and maps the response', async () => {
    mockGet.mockResolvedValueOnce({ data: jiraSearchFixture });

    const issues = await jiraApi.searchIssues('project = DASH');

    expect(issues).toHaveLength(2);
    expect(issues[0].key).toBe('DASH-101');
    expect(mockGet).toHaveBeenCalledWith(JIRA_ENDPOINTS.search, {
      params: { jql: 'project = DASH', maxResults: 50, fields: '*navigable' },
    });
  });

  it('honours a custom maxResults', async () => {
    mockGet.mockResolvedValueOnce({ data: jiraSearchFixture });

    await jiraApi.searchIssues('project = DASH', 5);

    expect(mockGet).toHaveBeenCalledWith(
      JIRA_ENDPOINTS.search,
      expect.objectContaining({ params: expect.objectContaining({ maxResults: 5 }) }),
    );
  });

  it('returns the board list', async () => {
    const boards = [{ id: 1, name: 'OO Board', type: 'scrum' }];
    mockGet.mockResolvedValueOnce({ data: { values: boards } });

    await expect(jiraApi.getBoards()).resolves.toEqual(boards);
    expect(mockGet).toHaveBeenCalledWith(JIRA_ENDPOINTS.boards);
  });

  it('returns the sprints for a board', async () => {
    const sprints = [
      {
        id: 2,
        name: 'Sprint 2',
        state: 'active',
        startDate: null,
        endDate: null,
        completeDate: null,
        goal: null,
      },
    ];
    mockGet.mockResolvedValueOnce({ data: { values: sprints } });

    await expect(jiraApi.getSprints(7)).resolves.toEqual(sprints);
    expect(mockGet).toHaveBeenCalledWith(JIRA_ENDPOINTS.sprints(7));
  });

  it('loads defects from the saved filter in a single page', async () => {
    mockGet.mockResolvedValueOnce({
      data: { issues: jiraDefectsFixture.issues, isLast: true },
    });

    const defects = await jiraApi.getDefects();

    expect(defects).toHaveLength(jiraDefectsFixture.issues.length);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      JIRA_ENDPOINTS.search,
      expect.objectContaining({
        params: expect.objectContaining({ jql: `filter = ${JIRA_DEFECT_FILTER.id}` }),
      }),
    );
  });

  it('follows the nextPageToken cursor across pages', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: { issues: jiraDefectsFixture.issues, isLast: false, nextPageToken: 'cursor-1' },
      })
      .mockResolvedValueOnce({ data: { issues: [], isLast: true } });

    const defects = await jiraApi.getDefects(999, 25);

    expect(defects).toHaveLength(jiraDefectsFixture.issues.length);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenLastCalledWith(
      JIRA_ENDPOINTS.search,
      expect.objectContaining({
        params: expect.objectContaining({ nextPageToken: 'cursor-1', maxResults: 25 }),
      }),
    );
  });
});
