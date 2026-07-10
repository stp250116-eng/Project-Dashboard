/**
 * Unit tests for goalSettingRequests.ts
 * Mocks Jira API responses and tests aggregation logic.
 */

import {
  getTrainingInformation,
  getAlmDefects,
  getComplexityPoints,
  getOverdueItems,
  fetchGoalSettingData,
} from './goalSettingRequests';
jest.mock('@integrations/jira/jiraApi', () => ({
  jiraApi: {
    getTrainingInformation: jest.fn(),
    getDefects: jest.fn(),
  },
}));

jest.mock('@shared/api', () => ({
  createApiClient: jest.fn(),
}));

const mockJiraApi = require('@integrations/jira/jiraApi').jiraApi as jest.Mocked<
  typeof import('@integrations/jira/jiraApi').jiraApi
>;

const mockCreateApiClient = require('@shared/api').createApiClient as jest.MockedFunction<
  typeof import('@shared/api').createApiClient
>;

describe('goalSettingRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrainingInformation', () => {
    it('fetches training issues and sums hours by developer', async () => {
      // jiraApi.getTrainingInformation returns raw Jira records (issues array)
      mockJiraApi.getTrainingInformation.mockResolvedValue([
        {
          fields: {
            assignee: { displayName: 'Alice', accountId: 'dev-1' },
            aggregatetimespent: 16 * 3600,
          },
        },
        {
          fields: {
            assignee: { displayName: 'Alice', accountId: 'dev-1' },
            aggregatetimespent: 8 * 3600,
          },
        },
        {
          fields: {
            assignee: { displayName: 'Bob', accountId: 'dev-2' },
            aggregatetimespent: 20 * 3600,
          },
        },
      ] as any);

      const result = await getTrainingInformation(2026);
      expect(result).toEqual({
        Alice: 24 * 3600, // seconds
        Bob: 20 * 3600,
      });
    });

    it('handles missing assignee gracefully', async () => {
      mockJiraApi.getTrainingInformation.mockResolvedValue([
        {
          fields: {
            assignee: null,
            aggregatetimespent: 10 * 3600,
          },
        },
      ] as any);

      const result = await getTrainingInformation(2026);

      expect(result).toEqual({
        Unassigned: 10 * 3600,
      });
    });

    it('returns empty object when no issues', async () => {
      mockJiraApi.getTrainingInformation.mockResolvedValue([] as any);

      const result = await getTrainingInformation(2026);

      expect(result).toEqual({});
    });
  });

  describe('getAlmDefects', () => {
    it('counts defects by developer and severity', async () => {
      // jiraApi.getDefects returns mapped JiraDefect[] with `owner` and `severity`
      mockJiraApi.getDefects.mockResolvedValue([
        { owner: 'dev-1', severity: 'High' } as any,
        { owner: 'dev-1', severity: 'Low' } as any,
        { owner: 'dev-2', severity: 'Medium' } as any,
      ]);

      const result = await getAlmDefects(2026);

      expect(result).toEqual({
        'dev-1': { low: 1, medium: 0, high: 1, critical: 0 },
        'dev-2': { low: 0, medium: 1, high: 0, critical: 0 },
      });
    });

    it('handles missing severity field', async () => {
      mockJiraApi.getDefects.mockResolvedValue([{ owner: 'dev-1', severity: null } as any]);

      const result = await getAlmDefects(2026);

      expect(result).toEqual({
        'dev-1': { low: 1, medium: 0, high: 0, critical: 0 },
      });
    });

    it('returns empty object when no issues', async () => {
      mockJiraApi.getDefects.mockResolvedValue([] as any);

      const result = await getAlmDefects(2026);

      expect(result).toEqual({});
    });
  });

  describe('getComplexityPoints', () => {
    it('sums complexity points by developer', async () => {
      // Mock createApiClient to return a client whose `get` resolves with issues
      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [
        {
          fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: 13 },
        },
        {
          fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: 21 },
        },
        {
          fields: { assignee: { displayName: 'Bob', accountId: 'dev-2' }, customfield_11530: 8 },
        },
      ] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await getComplexityPoints(2026);

      expect(result).toEqual({
        Alice: 34, // 13 + 21
        Bob: 8,
      });
    });

    it('ignores non-numeric complexity values', async () => {
      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: null } },
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: 10 } },
      ] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await getComplexityPoints(2026);

      expect(result).toEqual({ Alice: 10 });
    });

    it('returns empty object when no issues', async () => {
      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await getComplexityPoints(2026);

      expect(result).toEqual({});
    });
  });

  describe('getOverdueItems', () => {
    it('counts overdue items by developer', async () => {
      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' } } },
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' } } },
        { fields: { assignee: { displayName: 'Bob', accountId: 'dev-2' } } },
      ] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await getOverdueItems(2026);

      expect(result).toEqual({ Alice: 2, Bob: 1 });
    });

    it('returns empty object when no issues', async () => {
      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await getOverdueItems(2026);

      expect(result).toEqual({});
    });
  });

  describe('fetchGoalSettingData', () => {
    it('aggregates all data sources and computes goal data with ranking', async () => {
      // Mock jiraApi training + defects
      mockJiraApi.getTrainingInformation.mockResolvedValue([
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, aggregatetimespent: 40 * 3600 } } as any,
      ]);
      mockJiraApi.getDefects.mockResolvedValue([
        { owner: 'Alice', severity: 'Low' } as any,
        { owner: 'Bob', severity: 'High' } as any,
      ] as any);

      // Mock complexity + overdue via createApiClient.get sequence
      const fakeClient: any = { get: jest.fn() };
      const getMock = fakeClient.get as jest.Mock;
      getMock.mockResolvedValueOnce({
        data: {
          issues: [
            { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: 60 } },
          ],
        },
      });
      getMock.mockResolvedValueOnce({
        data: {
          issues: [
            { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' } } },
          ],
        },
      });
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await fetchGoalSettingData(2026);

      expect(result).toHaveLength(2);
      expect(result[0].developerId).toBeDefined();
      expect(result[0].goals).toBeDefined();
      expect(result[0].overallScore).toBeGreaterThanOrEqual(0);
      expect(result[0].rank).toBe(1); // First in ranking
      expect(result[1].rank).toBe(2); // Second in ranking
    });

    it('returns empty array on error', async () => {
      mockJiraApi.getTrainingInformation.mockRejectedValue(new Error('Network error'));

      const result = await fetchGoalSettingData(2026);

      expect(result).toEqual([]);
    });

    it('handles partial data (some endpoints fail)', async () => {
      // Training succeeds, others fail
      mockJiraApi.getTrainingInformation.mockResolvedValue([
        { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, aggregatetimespent: 40 * 3600 } } as any,
      ]);
      mockJiraApi.getDefects.mockRejectedValue(new Error('Defects endpoint failed'));

      const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [ { fields: { assignee: { displayName: 'Alice', accountId: 'dev-1' }, customfield_11530: 60 } } ] } }) };
      mockCreateApiClient.mockReturnValue(fakeClient as any);

      const result = await fetchGoalSettingData(2026);

      // Should return empty array due to the rejection in one of the parallel calls
      expect(result).toEqual([]);
    });
  });
});
